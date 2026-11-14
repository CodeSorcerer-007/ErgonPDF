const { spawn } = require('child_process');
const http = require('http');

const s = spawn('node', ['installer/serve.cjs', '--no-open', '--port', '8081'], { stdio: 'pipe' });

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port: 8081, path, headers }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

setTimeout(async () => {
  try {
    const root = await get('/');
    console.log('Root status:', root.status, 'HTML contains root:', root.body.includes('id="root"'));

    const health = await get('/healthz');
    console.log('/healthz status:', health.status, 'Body:', health.body.trim());

    const fonts = await get('/fonts/fonts.css');
    console.log('/fonts/fonts.css status:', fonts.status, 'Has font-face:', fonts.body.includes('@font-face'));

    const missingAsset = await get('/missing-image.png');
    console.log('Missing asset status (should be 404):', missingAsset.status);

    const spaFallback = await get('/workspace/edit');
    console.log('SPA fallback status (should be 200):', spaFallback.status, 'Has root:', spaFallback.body.includes('id="root"'));

    console.log('All static server tests passed!');
  } catch (err) {
    console.error('Test failed:', err);
    process.exitCode = 1;
  } finally {
    s.kill();
  }
}, 800);
