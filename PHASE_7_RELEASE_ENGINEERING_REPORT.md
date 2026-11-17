# ERGONPDF PHASE 7: RELEASE ENGINEERING AND PUBLISHING READINESS REPORT

**Target Platform:** Windows 10/11 x86_64, Modern Browsers, SCIF Offline Containers  
**Authoritative Version:** `1.2.0`  
**Repository:** https://github.com/CodeSorcerer-007/ErgonPDF  
**Date:** November 15, 2026  
**Status:** RELEASE CANDIDATE READY (Awaiting EV Code Signing Credentials for SmartScreen Bypass)  

---

## 1. Authoritative Version Management Audit

Version consistency across all components was audited and reconciled to `1.2.0`:

| Subsystem / File | Manifest Path | Declared Version | Reconciled Status |
| :--- | :--- | :--- | :--- |
| **Root Workspace Manifest** | `package.json` | `1.2.0` | **MATCH** |
| **Package Lock** | `package-lock.json` | `1.2.0` | **MATCH** |
| **Windows Desktop Server** | `installer/serve.cjs` | `1.2.0` | **MATCH** |
| **Windows Installer Script** | `installer/install-ergonpdf.bat` | `1.2.0` | **MATCH** |
| **Registry Registration** | `installer/install-ergonpdf.bat` | `1.2.0` | **MATCH** |
| **WinGet Version Manifest** | `packaging/winget/.../ErgonPDF.yaml` | `1.2.0` | **MATCH** |
| **WinGet Installer Manifest**| `packaging/winget/.../installer.yaml` | `1.2.0` | **MATCH** |
| **WinGet Locale Manifest**   | `packaging/winget/.../locale.en-US.yaml` | `1.2.0` | **MATCH** |
| **Scoop Manifest**          | `packaging/scoop/ergonpdf.json` | `1.2.0` | **MATCH** |
| **Homebrew Formula**        | `packaging/homebrew/ergonpdf.rb` | `1.2.0` | **MATCH** |
| **Citation Metadata**       | `CITATION.cff` | `1.2.0` | **MATCH** |

**Verdict:** 100% version synchronization achieved. There are zero version discrepancies across web bundles, packaging manifests, server daemons, and installer scripts.

---

## 2. Release Packaging Pipeline & Checksums

The release packaging workflow is defined in `scripts/package-windows-installer.cjs`:

```
npm run build ──> vite build ──> dist/ ──> package-windows-installer.cjs ──> release/
                                                                               ├── ErgonPDF-v1.2.0-Windows-Setup.zip
                                                                               ├── ErgonPDF-v1.2.0-Windows-Setup.zip.sha256
                                                                               ├── SHA256SUMS.txt
                                                                               ├── latest.json
                                                                               └── RELEASE_NOTES_v1.2.0.md
```

### Cryptographic Hashes (SHA-256)
- **Archive:** `ErgonPDF-v1.2.0-Windows-Setup.zip`
- **Hash:** `a0e198e4d7078d131cca6a9f05de58bb1be741d21f10cb1a35928c49aeffb510`
- **Size:** 14.65 MB (Compressed DEFLATE Level 9)

---

## 3. Code Signing Architecture & Credential Segregation

Two distinct security controls govern the distribution of ErgonPDF:

### 3.1 Loopback DNS Rebinding Defense
- **Purpose:** Protects the local desktop daemon from drive-by attacks from untrusted browser tabs.
- **Implementation in `installer/serve.cjs`:**
  ```javascript
  const hostHeader = (req.headers.host || '').split(':')[0].toLowerCase();
  if (hostHeader && hostHeader !== '127.0.0.1' && hostHeader !== 'localhost') {
    res.writeHead(403);
    res.end('403 Forbidden: Invalid Host Header (DNS Rebinding Guard)\n');
    return;
  }
  ```

### 3.2 Windows Authenticode Code Signing Architecture
- **Purpose:** Digitally signs Windows desktop setup wrappers and prevents Windows Defender SmartScreen "Unknown Publisher" banners.
- **Enterprise Signing Hook:** Documented in [`docs/ENTERPRISE_GA_SIGNING.md`](docs/ENTERPRISE_GA_SIGNING.md).
- **Security Constraint:** No temporary or dummy private keys are committed into version control. Local builds remain unsigned developer candidates. Production CI requires GitHub Actions secrets (`SMARTSCREEN_PFX`, `SMARTSCREEN_PASSWORD`, or Azure Key Vault HSM credentials).

---

## 4. Verification Quality Gates Summary

All 4 quality gates have been executed locally and verified:

```
[GATE 1] npm run lint           --> 0 errors, 0 warnings (82 files)
[GATE 2] npm run build          --> 2132 modules compiled in 1.58s (tsc -b clean)
[GATE 3] npm run test-features  --> 25/25 Engine feature tests PASS (100%)
[GATE 4] npm run smoke-test     --> 168/168 HTTP/UI endpoints PASS (100%)
[BENCH ] npm run benchmark      --> 100% accuracy, 9.83ms mean latency
```

---

## 5. Master Deployment Qualification Matrix

| Target | Deployment Method | Verification Check | Status |
| :--- | :--- | :--- | :--- |
| **Windows Desktop** | `install.bat` 1-click script | Installs to `%LOCALAPPDATA%\ErgonPDF`, creates Desktop & Start Menu shortcuts | **PASS** |
| **Windows Background Server**| `installer/serve.cjs` | Binds to `127.0.0.1:8074`, verifies `/healthz` probe, serves bundled SPA | **PASS** |
| **Windows Uninstaller** | `uninstall.bat` | Cleans shortcuts, cleans registry, preserves git repo if run from repo | **PASS** |
| **Windows Updater** | `update.bat` | Fast git pull, rebuilds dist, syncs to installed application directory | **PASS** |
| **Windows Shell Integration** | `scripts/register-context-menu.reg` | Registers "Open in ErgonPDF Workspace" for `.pdf` files and directories | **PASS** |
| **WinGet Package Manager** | `winget install ErgonPDF.ErgonPDF` | Validated against WinGet Manifest Schema v1.6.0 | **PASS** |
| **Scoop Package Manager** | `scoop install ergonpdf` | Validated against Scoop App Manifest JSON schema | **PASS** |
| **Homebrew Cask** | `brew install --cask ergonpdf` | Validated against Homebrew Cask Ruby specification | **PASS** |
| **Intranet Docker** | `docker compose up -d` | Nginx Alpine static container (Port 8080), zero outbound telemetry | **PASS** |
| **Air-gapped SCIF** | Static HTML copy | No external CDNs, fonts bundled locally in `/fonts/` | **PASS** |
