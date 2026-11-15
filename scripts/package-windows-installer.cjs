/**
 * @file package-windows-installer.cjs
 * @description Packages the ErgonPDF Windows Installer into a ready-to-distribute, self-contained ZIP archive.
 * Includes root launcher scripts, offline runtime server, bundled static assets, and pre-built distribution files.
 *
 * @license MIT
 */

const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const ROOT_DIR = path.resolve(__dirname, '..');
const RELEASE_DIR = path.resolve(ROOT_DIR, 'release');
const ZIP_NAME = 'ErgonPDF-v1.2.0-Windows-Setup.zip';

// Ignore runtime cache or OS metadata files
const IGNORED_FILES = new Set(['.ergon_runtime.json', '.DS_Store', 'Thumbs.db', 'ehthumbs.db', 'desktop.ini']);

if (!fs.existsSync(RELEASE_DIR)) {
  fs.mkdirSync(RELEASE_DIR, { recursive: true });
}

function addDirectoryToZip(zip, folderPath, zipPath = '') {
  const items = fs.readdirSync(folderPath);
  for (const item of items) {
    if (IGNORED_FILES.has(item) || item.endsWith('.tmp') || item.endsWith('.log')) {
      continue;
    }
    const fullPath = path.join(folderPath, item);
    const itemZipPath = zipPath ? `${zipPath}/${item}` : item;
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const folderZip = zip.folder(item);
      addDirectoryToZip(folderZip, fullPath, itemZipPath);
    } else {
      const data = fs.readFileSync(fullPath);
      zip.file(item, data);
    }
  }
}

async function createPackage() {
  console.log('Building standalone Windows installer package...');

  const zip = new JSZip();

  // 1. Add root install-ergonpdf.bat
  zip.file('install-ergonpdf.bat', fs.readFileSync(path.join(ROOT_DIR, 'install-ergonpdf.bat')));

  // 2. Add installer folder contents
  const installerZip = zip.folder('installer');
  addDirectoryToZip(installerZip, path.join(ROOT_DIR, 'installer'));

  // 3. Add dist folder directly into installer/dist
  const installerDistZip = installerZip.folder('dist');
  addDirectoryToZip(installerDistZip, path.join(ROOT_DIR, 'dist'));

  // 4. Generate zip file
  const zipPath = path.join(RELEASE_DIR, ZIP_NAME);
  console.log(`Compressing into ${zipPath}...`);

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  fs.writeFileSync(zipPath, buffer);
  const sizeMb = (buffer.length / (1024 * 1024)).toFixed(2);
  console.log(`====================================================`);
  console.log(`  Package Created: release/${ZIP_NAME}`);
  console.log(`  Size           : ${sizeMb} MB`);
  console.log(`  Ready for user distribution!`);
  console.log(`====================================================`);
}

createPackage().catch((err) => {
  console.error('Packaging failed:', err);
  process.exit(1);
});
