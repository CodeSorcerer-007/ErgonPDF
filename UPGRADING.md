# ErgonPDF Upgrading Guide

This document describes how to perform seamless, zero-downtime upgrades of ErgonPDF across all supported deployment paradigms while preserving local preferences.

---

## 🔒 The Zero-Migration Guarantee

Because ErgonPDF is an entirely **client-side, local-first application**:
- **Zero Document Database**: ErgonPDF maintains no backend SQL database, MongoDB instance, or server-side state. Documents exist only in transient browser memory during an active session.
- **Zero Schema Migrations**: Upgrades will never corrupt, lock, or invalidate your documents.
- **Backward-Compatible LocalStorage**: User UI preferences (theme choice, default DPI, watermark text history) stored under `ergonpdf_storage` are strictly backward-compatible across minor and patch releases.

---

## 🔄 Upgrade Methods

### Method 1: Windows Desktop In-Place Upgrade (Recommended)

To update your installed Windows Desktop instance to the latest release:

1. **Pull and Rebuild via `update.bat`**:
   Double-click **`update.bat`** from the repository root, or run in PowerShell:
   ```cmd
   .\update.bat
   ```
   This script will:
   - Perform a clean `git pull --ff-only` to fetch the latest release commits.
   - Run `npm install` to update pinned dependencies.
   - Run `npm run build` to re-compile optimized production assets.
   - Safely cycle the local loopback server (`serve.cjs`).

2. **Re-Run Installer (Alternative)**:
   You can also simply run:
   ```cmd
   .\install.bat
   ```
   The installer automatically detects existing installations in `%LOCALAPPDATA%\ErgonPDF`, stops the old background daemon, overwrites application assets with the new build, and updates Start Menu / Desktop shortcuts.

---

### Method 2: Git Source Update (Developer Setup)

If you are developing or running directly from a source clone:

```bash
# 1. Fetch latest upstream changes
git fetch origin

# 2. Fast-forward current branch
git checkout main
git pull --ff-only origin main

# 3. Synchronize dependencies
npm install

# 4. Verify quality gates
npm run lint
npm run build
npm run test-features
npm run smoke-test
```

---

### Method 3: Docker Container In-Place Upgrade

If running containerized instances on intranet servers or homelabs:

```bash
# 1. Pull latest Docker compose service configuration
git pull origin main

# 2. Rebuild container image with no cache
docker compose build --no-cache

# 3. Re-launch service with zero downtime
docker compose up -d --force-recreate
```

For manual Docker CLI deployments:
```bash
# Pull or build new container
docker build -t ergonpdf:latest .

# Stop and replace old container
docker stop ergonpdf
docker rm ergonpdf
docker run -d --name ergonpdf -p 8080:80 --restart unless-stopped ergonpdf:latest
```

---

### Method 4: Enterprise Offline / Air-Gapped Upgrading

For air-gapped facilities with no public network access:

1. On a secure staging machine connected to the Internet:
   - Check out the target release tag: `git checkout v1.2.0`.
   - Run `npm install && npm run build`.
   - Run `node scripts/package-windows-installer.cjs` to generate `ErgonPDF-Windows-Setup-v1.2.0.zip`.
   - Generate SHA-256 checksum:
     ```powershell
     Get-FileHash ErgonPDF-Windows-Setup-v1.2.0.zip -Algorithm SHA256 > SHA256SUM.txt
     ```
2. Transfer the archive and checksum file to approved offline physical media.
3. On the air-gapped workstation:
   - Verify the checksum against `SHA256SUM.txt`.
   - Extract the archive to `%LOCALAPPDATA%\ErgonPDF` (or run `install.bat`).
   - Launch ErgonPDF.

---

## ⏪ Rollback Runbook

If you encounter unexpected regressions with a new version, rolling back is completely safe and takes less than 30 seconds:

```bash
# In Git checkout:
git checkout v1.1.0
npm install
npm run build
.\install.bat
```
Because no database migrations exist, your preferences and previous settings remain 100% operational.

---

## 🛠️ Post-Upgrade Verification

After upgrading, confirm operational integrity:
- [ ] Open `http://127.0.0.1:8074` or desktop shortcut.
- [ ] Confirm application version displayed in footer or about dialog matches the target release.
- [ ] Run `npm run smoke-test` to confirm all 126 tool handlers pass cleanly.
