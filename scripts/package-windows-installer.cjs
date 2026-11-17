/**
 * @file package-windows-installer.cjs
 * @description Packages the ErgonPDF Windows Installer into a ready-to-distribute, self-contained ZIP archive.
 * Includes root launcher scripts, offline runtime server, bundled static assets, and pre-built distribution files.
 * Generates SHA-256 checksums, SHA256SUMS.txt, latest.json updater metadata, and release notes.
 *
 * @license MIT
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const JSZip = require('jszip');

const ROOT_DIR = path.resolve(__dirname, '..');
const RELEASE_DIR = path.resolve(ROOT_DIR, 'release');
const VERSION = '1.2.0';
const ZIP_NAME = `ErgonPDF-v${VERSION}-Windows-Setup.zip`;

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

  // 1. Add root operational and lifecycle files
  const rootFiles = [
    'install.bat',
    'install-ergonpdf.bat',
    'launch.bat',
    'uninstall.bat',
    'update.bat',
    'README.md',
    'LICENSE',
    'RESPONSIBLE_USE.md',
    'INSTALLATION.md',
    'UNINSTALLATION.md',
    'UPGRADING.md'
  ];

  for (const file of rootFiles) {
    const fullPath = path.join(ROOT_DIR, file);
    if (fs.existsSync(fullPath)) {
      zip.file(file, fs.readFileSync(fullPath));
    }
  }

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

  // 5. Compute SHA-256 Checksum
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  const sha256FilePath = `${zipPath}.sha256`;
  fs.writeFileSync(sha256FilePath, `${hash} *${ZIP_NAME}\n`);

  // 6. Write/Update SHA256SUMS.txt
  const sumsPath = path.join(RELEASE_DIR, 'SHA256SUMS.txt');
  fs.writeFileSync(sumsPath, `${hash}  ${ZIP_NAME}\n`);

  // 7. Write latest.json updater metadata
  const latestJsonPath = path.join(RELEASE_DIR, 'latest.json');
  const latestMeta = {
    version: VERSION,
    notes: `ErgonPDF v${VERSION} — Privacy-First All-in-One Local PDF Workspace. 100% In-Browser Execution.`,
    pub_date: new Date().toISOString(),
    platforms: {
      "windows-x86_64": {
        signature: "",
        url: `https://github.com/CodeSorcerer-007/ErgonPDF/releases/download/v${VERSION}/${ZIP_NAME}`,
        sha256: hash
      }
    }
  };
  fs.writeFileSync(latestJsonPath, JSON.stringify(latestMeta, null, 2) + '\n');

  const sizeMb = (buffer.length / (1024 * 1024)).toFixed(2);
  console.log(`====================================================`);
  console.log(`  Package Created : release/${ZIP_NAME}`);
  console.log(`  SHA-256 Hash    : ${hash}`);
  console.log(`  Package Size    : ${sizeMb} MB`);
  console.log(`  Checksum File   : release/${ZIP_NAME}.sha256`);
  console.log(`  Metadata File   : release/latest.json`);
  console.log(`  SHA256SUMS File : release/SHA256SUMS.txt`);
  console.log(`  Ready for user distribution!`);
  console.log(`====================================================`);
}

createPackage().catch((err) => {
  console.error('Packaging failed:', err);
  process.exit(1);
});
