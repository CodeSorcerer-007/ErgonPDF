# ErgonPDF Uninstallation Guide

This document describes how to cleanly and completely uninstall ErgonPDF from your system with **zero forensic residue**.

Because ErgonPDF is local-first, it never registers third-party telemetry services, cloud synchronization daemons, or intrusive background kernel drivers. Uninstallation is instantaneous, safe, and transparent.

---

## 🗑️ Method 1: Automated Uninstallation (Windows Desktop App)

If you installed ErgonPDF using `install.bat` or `install-ergonpdf.bat`:

### Option A: Via Windows Settings / Installed Apps (Standard UI)
1. Open Windows **Settings** (`Win + I`).
2. Navigate to **Apps** > **Installed apps** (or **Apps & features** on Windows 10).
3. Search for **ErgonPDF**.
4. Click the three dots `...` next to ErgonPDF and select **Uninstall**.
5. Confirm the prompt. The uninstaller will:
   - Terminate any running `serve.cjs` background daemon.
   - Delete the desktop shortcut.
   - Delete the Start Menu shortcut.
   - Eradicate the installation folder (`%LOCALAPPDATA%\ErgonPDF`).
   - Remove the uninstallation registry key from `HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\ErgonPDF`.

### Option B: Via Command Line Wrapper
From the root of the repository or source folder, run:
```cmd
.\uninstall.bat
```
Or if invoking directly from the installer folder:
```cmd
.\installer\uninstall-ergonpdf.bat
```

### Option C: Via `just` Task Runner
```powershell
just uninstall-windows
```

---

## 🧹 Method 2: Manual Removal Runbook (Zero-Trace Wipe)

If you wish to perform a manual forensic cleanup or if you moved the directory:

### 1. Stop Any Running Background Server
In PowerShell:
```powershell
# Terminate background node server process
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like "*serve.cjs*" } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

### 2. Remove Application Directories
```powershell
# Remove installation folder in Local AppData
if (Test-Path "$env:LOCALAPPDATA\ErgonPDF") {
    Remove-Item -Recurse -Force "$env:LOCALAPPDATA\ErgonPDF"
    Write-Host "Removed %LOCALAPPDATA%\ErgonPDF"
}
```

### 3. Remove Desktop & Start Menu Shortcuts
```powershell
# Remove Desktop shortcut
$desktopShortcut = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'ErgonPDF.lnk')
if (Test-Path $desktopShortcut) {
    Remove-Item -Force $desktopShortcut
    Write-Host "Removed Desktop shortcut."
}

# Remove Start Menu shortcut
$startMenuShortcut = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('Programs'), 'ErgonPDF.lnk')
if (Test-Path $startMenuShortcut) {
    Remove-Item -Force $startMenuShortcut
    Write-Host "Removed Start Menu shortcut."
}
```

### 4. Remove Windows Installed Apps Registry Key
```powershell
# Remove HKCU uninstall registry entry
$regPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\ErgonPDF"
if (Test-Path $regPath) {
    Remove-Item -Recurse -Force $regPath
    Write-Host "Removed registry uninstall entry."
}
```

---

## 🌐 Method 3: Browser Cache & Local Storage Purge

ErgonPDF stores user visual preferences (active theme, default DPI scale, custom watermark presets) locally in your browser's `localStorage` under the `ergonpdf_storage` key. No document contents are ever saved to disk.

To wipe browser-stored preferences:
1. Open your browser and navigate to `http://127.0.0.1:8074` or your host URL.
2. Press `F12` to open Developer Tools.
3. Switch to the **Application** (or **Storage**) tab.
4. Select **Local Storage** > your site URL.
5. Click **Clear All** (or run `localStorage.clear()` in the Console).
6. Under **Cache Storage**, select any registered service worker caches and click **Delete**.

---

## 🐳 Method 4: Docker Container Teardown

If running ErgonPDF via Docker Compose:

```bash
# Stop and remove containers, networks, and orphaned volumes
docker compose down --volumes --remove-orphans

# Remove container image
docker rmi ergonpdf:1.2.0
```

---

## ✅ Forensic Verification Checklist

To confirm that your system is completely clean:

- [ ] Port `8074` is closed: `Test-NetConnection -ComputerName 127.0.0.1 -Port 8074` returns `TcpTestSucceeded: False`.
- [ ] Directory `%LOCALAPPDATA%\ErgonPDF` does not exist.
- [ ] No shortcut named `ErgonPDF.lnk` exists on the Desktop or Start Menu.
- [ ] Registry path `HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\ErgonPDF` is absent.
- [ ] No background processes matching `serve.cjs` appear in Task Manager.
