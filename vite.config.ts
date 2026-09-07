import fs from 'node:fs';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/**
 * Middleware plugin to provide real JSON health probe, /api/ 404 handler,
 * and 404 for missing static files (preventing SPA fallback on .pdf, .png, etc.)
 */
function ergonApiAndStaticPlugin(): Plugin {
  const staticExtRegex = /\.(pdf|png|jpe?g|gif|svg|ico|css|js|wasm|json|csv|txt|woff2?|ttf|eot)$/i;

  const handleApiAndStatic = (req: any, res: any, next: any, baseDir: string) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = decodeURIComponent(url.pathname);

    // Health check endpoints (/api/health and /healthz)
    if (pathname === '/healthz') {
      res.setHeader('Content-Type', 'text/plain');
      res.writeHead(200);
      res.end('OK\n');
      return;
    }

    if (pathname === '/api/health') {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'ok', service: 'ErgonPDF', version: '1.1.0', mode: 'client-wasm', timestamp: Date.now() }));
      return;
    }

    // Explicit 404 for any other /api/ route
    if (pathname.startsWith('/api/')) {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not Found', message: 'ErgonPDF operates entirely in-browser. Backend API endpoints are not active.' }));
      return;
    }

    // Missing static files with file extensions must return 404 Not Found, not SPA index.html
    if (staticExtRegex.test(pathname)) {
      const cleanPath = pathname.replace(/^\//, '');
      const filePath = path.resolve(baseDir, cleanPath);
      const publicPath = path.resolve(process.cwd(), 'public', cleanPath);

      if (!fs.existsSync(filePath) && !fs.existsSync(publicPath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
    }

    next();
  };

  return {
    name: 'ergon-api-and-static-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        handleApiAndStatic(req, res, next, process.cwd());
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        handleApiAndStatic(req, res, next, path.resolve(process.cwd(), 'dist'));
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ergonApiAndStaticPlugin()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('pdfjs-dist')) return 'vendor-pdfjs';
          if (id.includes('tesseract.js')) return 'vendor-tesseract';
          if (id.includes('pdf-lib') || id.includes('@pdfsmaller') || id.includes('jszip')) return 'vendor-pdflib';
          if (id.includes('react') || id.includes('lucide-react')) return 'vendor-react';
        },
      },
    },
  },
});
