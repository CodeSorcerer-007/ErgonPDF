/**
 * ErgonPDF Local Desktop Server
 * Zero-dependency, ultra-lightweight static HTTP server with SPA fallback,
 * gzip compression, health probes, and automatic browser launch.
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { exec } = require('node:child_process');

const VERSION = '1.2.0';
const DEFAULT_PORT = 8074;

// Parse command line arguments
const args = process.argv.slice(2);
let portArg = process.env.PORT ? parseInt(process.env.PORT, 10) : DEFAULT_PORT;
let shouldOpenBrowser = true;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' || args[i] === '-p') {
    const val = parseInt(args[i + 1], 10);
    if (!isNaN(val)) portArg = val;
    i++;
  } else if (args[i] === '--no-open' || args[i] === '-n') {
    shouldOpenBrowser = false;
  }
}

// Locate dist folder containing index.html
const candidateDirs = [
  path.resolve(__dirname, 'dist'),
  path.resolve(__dirname, '..', 'dist'),
  path.resolve(process.cwd(), 'dist'),
  path.resolve(__dirname),
  process.cwd()
];
const baseDir = candidateDirs.find(d => fs.existsSync(path.join(d, 'index.html'))) || path.resolve(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.txt': 'text/plain; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.xml': 'application/xml',
};

const COMPRESSIBLE_EXTENSIONS = new Set([
  '.html', '.js', '.mjs', '.css', '.json', '.svg', '.txt', '.csv', '.xml'
]);

const STATIC_EXT_REGEX = /\.(pdf|png|jpe?g|gif|svg|ico|css|js|mjs|wasm|json|csv|txt|woff2?|ttf|eot)$/i;

function openBrowser(url) {
  if (!shouldOpenBrowser) return;
  const platform = process.platform;
  let cmd = `start "" "${url}"`;
  if (platform === 'darwin') cmd = `open "${url}"`;
  else if (platform === 'linux') cmd = `xdg-open "${url}"`;
  exec(cmd, (err) => {
    if (err) {
      console.warn(`[ErgonPDF] Note: Open ${url} in your browser.`);
    }
  });
}

function handleRequest(req, res) {
  // DNS Rebinding Protection: strictly validate Host header against loopback origins
  const hostHeader = (req.headers.host || '').split(':')[0].toLowerCase();
  if (hostHeader && hostHeader !== '127.0.0.1' && hostHeader !== 'localhost') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.writeHead(403);
    res.end('403 Forbidden: Invalid Host Header (DNS Rebinding Guard)\n');
    return;
  }

  const urlObj = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(urlObj.pathname);

  // Set standard security headers
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');

  // Liveness / readiness probe
  if (pathname === '/healthz') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.writeHead(200);
    res.end('OK\n');
    return;
  }

  // Health API endpoint
  if (pathname === '/api/health') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'ok',
      service: 'ErgonPDF',
      version: VERSION,
      mode: 'client-wasm',
      timestamp: Date.now()
    }));
    return;
  }

  // API 404 notice
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.writeHead(404);
    res.end(JSON.stringify({
      error: 'Not Found',
      message: 'ErgonPDF operates entirely in-browser. Backend API endpoints are not active.'
    }));
    return;
  }

  // Sanitize relative path to prevent directory traversal
  let safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  if (safePath.startsWith('/') || safePath.startsWith('\\')) {
    safePath = safePath.slice(1);
  }

  let filePath = path.join(baseDir, safePath);

  // If path is a directory, look for index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // If file doesn't exist
  if (!fs.existsSync(filePath)) {
    // Missing static resource with extension -> return explicit 404
    if (STATIC_EXT_REGEX.test(pathname)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.writeHead(404);
      res.end('404 Not Found');
      return;
    }
    // SPA route fallback -> serve index.html
    filePath = path.join(baseDir, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.writeHead(404);
    res.end('404 Not Found: Application bundle missing.');
    return;
  }

  // Determine MIME type
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);

  // Cache policy
  if (ext === '.html') {
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // Gzip compression check
  const acceptEncoding = req.headers['accept-encoding'] || '';
  const canCompress = COMPRESSIBLE_EXTENSIONS.has(ext);

  if (canCompress && /\bgzip\b/.test(acceptEncoding)) {
    res.setHeader('Content-Encoding', 'gzip');
    res.writeHead(200);
    const rawStream = fs.createReadStream(filePath);
    const gzip = zlib.createGzip();
    rawStream.pipe(gzip).pipe(res);
  } else {
    res.writeHead(200);
    fs.createReadStream(filePath).pipe(res);
  }
}

function startServer(port, retryCount = 0) {
  const maxRetries = 10;
  const server = http.createServer(handleRequest);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      // Single-instance check: see if ErgonPDF is already serving on this port
      const checkReq = http.get(`http://127.0.0.1:${port}/api/health`, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (data.service === 'ErgonPDF') {
              console.log(`[ErgonPDF] Instance already active at http://127.0.0.1:${port}. Bringing to focus.`);
              openBrowser(`http://127.0.0.1:${port}`);
              process.exit(0);
            }
          } catch {}
          retryNextPort();
        });
      });
      checkReq.on('error', () => {
        retryNextPort();
      });
      checkReq.setTimeout(600, () => {
        checkReq.destroy();
        retryNextPort();
      });

      function retryNextPort() {
        if (retryCount < maxRetries) {
          const nextPort = port + 1;
          console.log(`[ErgonPDF] Port ${port} is in use, trying port ${nextPort}...`);
          startServer(nextPort, retryCount + 1);
        } else {
          console.error(`[ErgonPDF] Error: Could not find an open port between ${portArg} and ${port}.`);
          process.exit(1);
        }
      }
    } else {
      console.error('[ErgonPDF] Server error:', err);
      process.exit(1);
    }
  });

  server.listen(port, '127.0.0.1', () => {
    const appUrl = `http://127.0.0.1:${port}`;
    console.log('====================================================');
    console.log(`  ErgonPDF Desktop v${VERSION} — Local Workspace`);
    console.log('====================================================');
    console.log(`  Status    : Ready & Serving`);
    console.log(`  URL       : ${appUrl}`);
    console.log(`  Directory : ${baseDir}`);
    console.log(`  Privacy   : 100% Local (Zero data leaves this PC)`);
    console.log('====================================================');
    console.log('  Press Ctrl+C to stop the server.');
    console.log('');

    // Write current port to state file so helper scripts know which port is live
    try {
      const stateFile = path.resolve(__dirname, '.ergon_runtime.json');
      fs.writeFileSync(stateFile, JSON.stringify({ port, pid: process.pid, url: appUrl, started: Date.now() }), 'utf8');
    } catch {
      // ignore
    }

    openBrowser(appUrl);
  });

  // Graceful shutdown
  const cleanup = () => {
    try {
      const stateFile = path.resolve(__dirname, '.ergon_runtime.json');
      if (fs.existsSync(stateFile)) fs.unlinkSync(stateFile);
    } catch {}
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

startServer(portArg);
