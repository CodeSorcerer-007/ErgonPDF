# ErgonPDF — Windows Local Desktop Application Guide

ErgonPDF can be installed directly on any Windows PC as a local desktop application with zero external cloud dependencies. All PDF processing, OCR, encryption, and conversions occur 100% inside your local browser runtime via WebAssembly.

---

## ⚡ Quick Installation

1. **Download or clone** the ErgonPDF repository.
2. Double-click **`install-ergonpdf.bat`** (either in the root folder or inside the `installer/` directory).
3. The installer will:
   - Verify Node.js (v18+). If missing, it can automatically download and install official Node.js LTS for you.
   - Install ErgonPDF to `%LOCALAPPDATA%\ErgonPDF` (requires **no administrator elevation**).
   - Create a **Desktop Shortcut** with the ErgonPDF icon.
   - Create a **Start Menu** entry.
   - Register ErgonPDF in Windows **Installed Apps / Add or Remove Programs**.
   - Launch the application at `http://127.0.0.1:8074`.

---

## 🚀 Daily Usage

- **To Open ErgonPDF**:
  Double-click the **ErgonPDF** icon on your Desktop or launch it from the Windows Start Menu.
  If the background server is not already running, it starts automatically and opens your default browser.
  If it is already running, it simply opens the application tab in your browser.

- **To Stop the Background Server**:
  Navigate to `%LOCALAPPDATA%\ErgonPDF` (or your chosen install directory) and run:
  `stop-ergonpdf.bat`

---

## 🗑️ Uninstallation

You can cleanly remove ErgonPDF at any time:
1. Open Windows **Settings** > **Apps** > **Installed Apps**.
2. Find **ErgonPDF** and click **Uninstall**.
   *(Or run `uninstall.bat` directly inside `%LOCALAPPDATA%\ErgonPDF`)*.
3. The uninstaller terminates active background services, deletes shortcuts, removes registry entries, and cleans up the application files.

---

## 🔒 Security & Privacy Guarantee

- **Zero Cloud Uploads**: Documents never leave your computer.
- **Offline Capable**: All fonts, WebAssembly binaries, workers, and styles are bundled locally.
- **Local Isolation**: Runs strictly on loopback address `127.0.0.1` and does not accept remote network connections.
