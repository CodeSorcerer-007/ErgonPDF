# ErgonPDF Windows Release & Deployment Engineering Guide

This guide details the technical internals of ErgonPDF's Windows desktop distribution architecture, automated installation pipeline, silent loopback server, shortcut management, and uninstallation hooks.

---

## 1. Architectural Philosophy: The Native Web Desktop Paradigm

Rather than bundling a heavy 150MB+ Chromium binary via Electron or requiring C++/Rust toolchains for native WebView2 bindings, ErgonPDF delivers a **Native Web Desktop Experience** via a zero-dependency local static loopback daemon:

```text
[Windows Desktop / Start Menu]
             |
             v (Launches)
[installer\ErgonPDF.bat]
             |
             v (Spawns silently via run-hidden.vbs)
[node installer\serve.cjs]  <--- Bound strictly to 127.0.0.1:8074
             |
             v (Automated browser launch)
[User's Default Browser (Edge / Chrome / Brave / Firefox)]
```

### Key Advantages:
- **Instant Boot**: Zero Electron initialization delay; server binds and answers in <15 milliseconds.
- **Zero Idle Memory**: Consumes <20MB resident memory while running in the background.
- **Always-Current Browser Engine**: Inherits user browser security updates, hardware acceleration, and memory optimizations automatically.

---

## 2. Windows Packaging Pipeline (`package-windows-installer.cjs`)

To generate a standalone Windows installer distribution:

```powershell
node scripts/package-windows-installer.cjs
```

### The Packaging Script Executes:
1. **Production Build Validation**: Verifies that `dist/index.html` exists and is up to date (or runs `npm run build`).
2. **Staging Assembly**: Assembles a clean distribution folder containing:
   - `dist/` (compiled static assets, WebAssembly modules, fonts, worker scripts)
   - `serve.cjs` (lightweight static HTTP server)
   - `ErgonPDF.bat` & `run-hidden.vbs` (launcher wrappers)
   - `install-ergonpdf.bat` & `create-shortcuts.ps1` (installation and shortcut scripts)
   - `stop-ergonpdf.bat` & `uninstall.bat` (service stop and uninstallation scripts)
   - `icon.ico` (high-resolution multi-size Windows icon)
3. **ZIP Archive Compression**: Compresses the staging directory into `ErgonPDF-Windows-Setup-v1.2.0.zip`.

---

## 3. Desktop Installation Internals (`install-ergonpdf.bat`)

When `install.bat` or `install-ergonpdf.bat` is executed:

1. **Node.js Pre-Flight Check**:
   - Queries `where node`. If absent, alerts user with installation instructions.
2. **Target Directory Setup**:
   - Creates directory `%LOCALAPPDATA%\ErgonPDF`.
   - Copies production distribution files into this location.
3. **PowerShell Shortcut Generation (`create-shortcuts.ps1`)**:
   - Uses `WScript.Shell` COM object in PowerShell to generate:
     - Desktop Shortcut: `C:\Users\<user>\Desktop\ErgonPDF.lnk`
     - Start Menu Shortcut: `C:\Users\<user>\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\ErgonPDF.lnk`
   - Sets target to `wscript.exe "%LOCALAPPDATA%\ErgonPDF\run-hidden.vbs"`
   - Assigns custom `icon.ico` and working directory.
4. **Registry Registration for Windows "Installed Apps"**:
   - Writes uninstall keys to `HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\ErgonPDF`:
     - `DisplayName` = "ErgonPDF"
     - `DisplayVersion` = "1.2.0"
     - `Publisher` = "ErgonPDF Open Source Community"
     - `UninstallString` = `"%LOCALAPPDATA%\ErgonPDF\uninstall.bat"`
     - `DisplayIcon` = `"%LOCALAPPDATA%\ErgonPDF\icon.ico"`
5. **Initial Service Launch**:
   - Starts `serve.cjs` and opens the user's default browser to `http://127.0.0.1:8074`.

---

## 4. Background Server Daemon Internals (`serve.cjs`)

`serve.cjs` is an ultra-lightweight Node.js HTTP server:
- **Port Management**: Defaults to port `8074`. Can be overridden with `--port <num>` or `PORT=<num>`.
- **Liveness Probes**:
  - `GET /healthz` -> `200 OK`
  - `GET /api/health` -> JSON system diagnostics
- **SPA Fallback**: Requests for client-side tool routes (e.g. `/merge-pdf`, `/compress-pdf`, `/organize`) automatically return `index.html`.
- **Gzip Compression**: Compresses text/HTML/JS responses dynamically using Node's native `zlib.createGzip()`.
- **Security Headers**: Injects standard sandbox and anti-sniff headers on all responses.

---

## 5. Clean Uninstallation Internals (`uninstall.bat`)

When uninstallation is triggered from Windows Settings or `uninstall.bat`:
1. **Graceful Daemon Shutdown**:
   - Reads PID from `.ergon_runtime.json` and issues `taskkill /F /PID <pid>`.
   - Terminates any lingering `serve.cjs` processes.
2. **Shortcut Removal**:
   - Deletes `ErgonPDF.lnk` from Desktop and Start Menu Programs.
3. **Registry Removal**:
   - Deletes `HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\ErgonPDF`.
4. **Self-Deleting Cleanup**:
   - Eradicates `%LOCALAPPDATA%\ErgonPDF` completely. Zero leftover files.
