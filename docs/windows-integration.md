# Windows Platform Integration

ErgonPDF provides deep, native integration with the **Windows 10 / 11** desktop operating system while maintaining a lightweight footprint and strict privacy isolation.

This document describes how ErgonPDF manages its local loopback daemon, Windows Explorer context menus, Win32 path normalization, desktop shortcuts, and zero-residue lifecycle management.

---

## 1. Zero-Dependency Loopback Daemon Architecture

Unlike Electron-based applications that bundle a full Chromium runtime (150–300 MB), ErgonPDF utilizes the system browser or Microsoft Edge WebView2 via an ultra-lightweight Node.js loopback server:

```
[Windows User] ──> [ErgonPDF.bat] ──> [run-hidden.vbs]
                                             │
                                             ▼
                                     [serve.cjs daemon]
                                      (127.0.0.1:8074)
                                             │
                   +-------------------------+-------------------------+
                   │                                                   │
          [Health Probes]                                      [Static Assets]
          /healthz -> 200 OK                                   SPA dist/ bundle
          /api/health -> JSON                                  gzip on-the-fly
```

### Key Architectural Benefits
- **Zero Binary Bloat:** The total desktop installer package is only **~14.6 MB**, compared to 150+ MB for Electron alternatives.
- **Port Collision Safety:** When `ErgonPDF.bat` launches, it checks if `127.0.0.1:8074/healthz` is already active. If so, it simply focuses the active browser tab without spawning redundant background instances.
- **DNS Rebinding Protection:** The server inspects incoming HTTP request `Host` headers. Any request with a host other than `127.0.0.1` or `localhost` is rejected with `403 Forbidden`, safeguarding users from malicious external websites probing the local port.

---

## 2. Windows Explorer Context Menu Integration

ErgonPDF integrates into the Windows Explorer shell, allowing users to right-click PDF files or directories and immediately launch them into the workspace:

### Registration via `.reg` Scripts
- **Install Script:** [`scripts/register-context-menu.reg`](../scripts/register-context-menu.reg)
- **Uninstall Script:** [`scripts/unregister-context-menu.reg`](../scripts/unregister-context-menu.reg)

### Registered Shell Handlers
1. **Right-Click on any `.pdf` Document:**
   - Registry Key: `HKEY_CURRENT_USER\Software\Classes\SystemFileAssociations\.pdf\shell\ErgonPDF`
   - Action Name: *"Open in ErgonPDF Workspace"*
   - Command: `"%LOCALAPPDATA%\ErgonPDF\ErgonPDF.bat"`
2. **Right-Click on any Directory (Folder):**
   - Registry Key: `HKEY_CURRENT_USER\Software\Classes\Directory\shell\ErgonPDF`
   - Action Name: *"Open ErgonPDF Workspace"*
3. **Right-Click on Directory Background:**
   - Registry Key: `HKEY_CURRENT_USER\Software\Classes\Directory\Background\shell\ErgonPDF`
   - Action Name: *"Launch ErgonPDF Workspace"*

All registry changes are stored under `HKEY_CURRENT_USER` (HKCU), requiring **no Administrator privileges** to install or remove.

---

## 3. Desktop Shortcuts & Shell Icons

Desktop and Start Menu shortcuts are created via [`installer/create-shortcuts.ps1`](../installer/create-shortcuts.ps1) using the Windows Script Host `WScript.Shell` COM interface:

- **Desktop Shortcut:** `%USERPROFILE%\Desktop\ErgonPDF.lnk`
- **Start Menu Shortcut:** `%APPDATA%\Microsoft\Windows\Start Menu\Programs\ErgonPDF.lnk`
- **Application Icon:** Embedded multi-resolution `.ico` (16x16, 32x32, 48x48, 64x64, 128x128, 256x256) deployed to `%LOCALAPPDATA%\ErgonPDF\icon.ico`.

---

## 4. Windows Add/Remove Programs Registration

The installer registers ErgonPDF in the standard Windows Control Panel ("Installed Apps" / "Add or Remove Programs"):

- **Registry Key:** `HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\ErgonPDF`
- **Attributes:**
  - `DisplayName`: `ErgonPDF`
  - `DisplayVersion`: `1.2.0`
  - `Publisher`: `ErgonPDF Open Source Project`
  - `InstallLocation`: `%LOCALAPPDATA%\ErgonPDF`
  - `UninstallString`: `"%LOCALAPPDATA%\ErgonPDF\uninstall.bat"`
  - `DisplayIcon`: `"%LOCALAPPDATA%\ErgonPDF\icon.ico"`
  - `NoModify`: `1`
  - `NoRepair`: `1`

---

## 5. Non-Destructive Uninstallation & Upgrades

The uninstaller ([`installer/uninstall.bat`](../installer/uninstall.bat)) enforces strict environment detection:
1. **Developer Safe Mode:** If executed from within a Git working copy or repository containing `package.json`, it removes shortcuts and unregisters from the registry, but **strictly preserves repository files**.
2. **End-User Clean Mode:** When invoked from `%LOCALAPPDATA%\ErgonPDF`, it stops running background Node.js processes, removes shortcuts, deletes registry entries, and cleans up the application folder via a self-terminating temporary batch task.
