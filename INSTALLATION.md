# ErgonPDF Installation & Deployment Guide

ErgonPDF is an open-source, sovereign, client-side document workspace offering 126 professional PDF utilities. All computations execute directly in your local browser memory via WebAssembly and HTML5 Canvas with **zero cloud dependencies** and **zero telemetry**.

---

## 📋 System Requirements

| Environment | Minimum Requirements | Recommended Specifications |
| :--- | :--- | :--- |
| **Operating System** | Windows 10 (Build 19041+) / 11, macOS 12+, Linux (glibc 2.31+), ChromeOS | Windows 11 (64-bit) or Modern Linux / macOS |
| **Memory (RAM)** | 2 GB available RAM | 8 GB+ (for processing 500+ page documents or bulk OCR) |
| **Browser Runtime** | Chromium 109+, Firefox 115+, Safari 16.4+, Edge 109+ | Latest Google Chrome, Brave, Edge, or Firefox |
| **Disk Space** | ~50 MB for static bundle | ~150 MB (includes local Tesseract OCR language weights) |
| **Network** | None required (100% offline-ready once loaded) | Completely air-gapped / offline capable |

---

## 🚀 Installation Methods

Choose the deployment method that fits your environment:

- [Method 1: Windows One-Click Native Installer (Recommended for Windows)](#method-1-windows-one-click-native-installer)
- [Method 2: Package Managers (WinGet, Scoop, Homebrew)](#method-2-package-managers-winget-scoop-homebrew)
- [Method 3: One-Line PowerShell Quick-Launch](#method-3-one-line-powershell-quick-launch)
- [Method 4: Building from Source (Developers)](#method-4-building-from-source-developers)
- [Method 5: Docker & Containerized Intranet Deployment](#method-5-docker--containerized-intranet-deployment)
- [Method 6: Enterprise Offline / Air-Gapped Deployment](#method-6-enterprise-offline--air-gapped-deployment)
- [Method 7: Static Web Hosting (Nginx / Cloudflare Pages / Vercel)](#method-7-static-web-hosting-nginx--cloudflare-pages--vercel)

---

### Method 1: Windows One-Click Native Installer

Ideal for Windows 10/11 desktop workstations. This script deploys an ultra-lightweight loopback server daemon (`serve.cjs`), creates Desktop & Start Menu shortcuts, and registers ErgonPDF in Windows Installed Apps without requiring third-party administrative utilities.

1. **Download or Clone the Repository**:
   ```cmd
   git clone https://github.com/CodeSorcerer-007/ErgonPDF.git
   cd ErgonPDF
   ```
2. **Execute the Installer**:
   - Double-click **`install.bat`** (or **`install-ergonpdf.bat`**).
   - Alternatively, execute from Command Prompt or PowerShell:
     ```cmd
     .\install.bat
     ```
3. **What the Installer Does**:
   - Verifies Node.js runtime availability (Node 18+ recommended).
   - Compiles production distribution bundle (`npm run build`).
   - Copies static assets and headless runner to `%LOCALAPPDATA%\ErgonPDF`.
   - Generates Windows Desktop and Start Menu shortcuts pointing to the background runner.
   - Registers ErgonPDF in `HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\ErgonPDF` for clean Control Panel uninstallation.
   - Spawns the local daemon at `http://127.0.0.1:8074` and opens your default browser.

4. **Subsequent Launches**:
   - Double-click the **ErgonPDF** icon on your Desktop or search **ErgonPDF** in your Start Menu.
   - Or run `launch.bat` from the repository root.

---

### Method 2: Package Managers (WinGet, Scoop, Homebrew)

ErgonPDF provides official manifests for community package managers:

#### Microsoft WinGet (Windows 10/11)
```powershell
winget install ErgonPDF.ErgonPDF
```

#### Scoop (Windows)
```powershell
# Using the local manifest or custom bucket:
scoop install packaging/scoop/ergonpdf.json
```

#### Homebrew Cask (macOS / Linux)
```bash
brew install --cask packaging/homebrew/ergonpdf.rb
```

---

### Method 3: One-Line PowerShell Quick-Launch

For rapid headless initialization on any Windows terminal:

```powershell
# In PowerShell:
git clone https://github.com/CodeSorcerer-007/ErgonPDF.git; cd ErgonPDF; .\install.bat
```

To run directly via `just` (if installed):
```powershell
just install-windows
```

---

### Method 3: Building from Source (Developers)

If you are developing custom tools or contributing to the codebase:

1. **Verify Prerequisites**:
   ```bash
   node --version  # Requires >= 18.0.0 (LTS 20 or 22 recommended)
   npm --version   # Requires >= 9.0.0
   ```

2. **Clone & Install Dependencies**:
   ```bash
   git clone https://github.com/CodeSorcerer-007/ErgonPDF.git
   cd ErgonPDF
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:5173`. Hot-module replacement (HMR) is active.

4. **Verify Quality Gates**:
   ```bash
   npm run lint          # Static oxlint check
   npm run build         # Strict TypeScript check + Vite bundle
   npm run test-features # 25-feature PDF engine integrity suite
   npm run smoke-test    # 168-endpoint route and engine verification
   ```

---

### Method 4: Docker & Containerized Intranet Deployment

Deploy ErgonPDF across your internal corporate network, home lab, or Kubernetes cluster.

#### Option A: Docker Compose (Simplest)
```bash
docker compose up -d
```
The workspace is instantly accessible on port `8080` at `http://localhost:8080`.

#### Option B: Docker CLI Build & Run
```bash
# 1. Build unprivileged production container
docker build -t ergonpdf:1.2.0 .

# 2. Run container under non-root security profile
docker run -d \
  --name ergonpdf \
  -p 8080:80 \
  --restart unless-stopped \
  --read-only \
  --tmpfs /tmp \
  ergonpdf:1.2.0
```

#### Container Healthcheck Endpoints:
- `http://localhost:8080/healthz` -> `200 OK`
- `http://localhost:8080/api/health` -> JSON operational health metadata

---

### Method 5: Enterprise Offline / Air-Gapped Deployment

Because ErgonPDF performs **zero external API calls**, it is designed from the ground up for air-gapped SCIFs, forensic workstations, and defense environments.

1. **Pre-Package on a Connected Machine**:
   ```powershell
   git clone https://github.com/CodeSorcerer-007/ErgonPDF.git
   cd ErgonPDF
   npm install
   npm run build
   node scripts/package-windows-installer.cjs
   ```
2. **Transfer to Offline Medium**:
   Copy the repository directory or the generated release ZIP to an approved USB transfer drive.
3. **Deploy on Air-Gapped Machine**:
   - Extract the package.
   - Run `.\install.bat` (or use standalone `npx serve -s dist -l 8080`).
   - Disconnect all network interfaces (Ethernet, Wi-Fi, Bluetooth).
   - Test any tool: Merge, OCR, AES-256 Lock, AI Document Studio. Everything operates at 100% fidelity without network access.

---

### Method 6: Static Web Hosting (Nginx / Cloudflare Pages / Vercel)

ErgonPDF compiles to 100% static HTML, CSS, JavaScript, and WebAssembly assets:

#### Production Nginx Configuration
```nginx
server {
    listen 80;
    server_name ergonpdf.internal;
    root /var/www/ergonpdf/dist;
    index index.html;

    # Secure Content-Security-Policy & Sandbox Headers
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' blob:; worker-src 'self' blob:;" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    # Static asset caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2|wasm)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform, immutable";
    }

    # SPA routing fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Cloudflare Pages / Vercel / Netlify
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: `20.x` or `22.x`

---

## 🔍 Verification & Post-Install Smoke Test

After installation, verify operational health:

```bash
# Execute full smoke test against your running instance
npm run smoke-test
```
A complete summary will be printed asserting 168/168 endpoints and tool routes passing with zero errors.

---

## 🛠️ Need Assistance?

- Read the [Frequently Asked Questions (FAQ)](docs/FAQ.md).
- Consult the [Troubleshooting Guide](docs/troubleshooting.md).
- Report issues using the [Beta Feedback Template](BETA_FEEDBACK_TEMPLATE.md).
