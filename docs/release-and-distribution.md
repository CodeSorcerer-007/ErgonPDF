# Release Engineering & Multi-Format Distribution

ErgonPDF provides enterprise distribution options spanning native Windows desktop installers, package managers, intranet Docker containers, and air-gapped SCIF deployments.

---

## 1. Supported Distribution Channels

| Channel | Platform | Artifact / Manifest | Command |
| :--- | :--- | :--- | :--- |
| **Windows Desktop ZIP** | Windows 10/11 x64 | `release/ErgonPDF-v1.2.0-Windows-Setup.zip` | 1-click `install.bat` |
| **Microsoft WinGet** | Windows 10/11 x64 | `packaging/winget/manifests/...` | `winget install ErgonPDF.ErgonPDF` |
| **Scoop Package** | Windows 10/11 x64 | `packaging/scoop/ergonpdf.json` | `scoop install ergonpdf` |
| **Homebrew Cask** | macOS / Linux | `packaging/homebrew/ergonpdf.rb` | `brew install --cask ergonpdf` |
| **Docker Intranet** | Linux / Cloud / Local | `Dockerfile` & `docker-compose.yml` | `docker compose up -d` |
| **Static SCIF Hosting**| Air-Gapped Networks | `dist/` production build | Nginx / Apache / IIS |

---

## 2. Windows Packaging Pipeline

The packaging workflow is implemented in `scripts/package-windows-installer.cjs`:

```bash
# Compile and create release bundle
npm run build
npm run package:windows
```

### Artifact Manifest
Running `npm run package:windows` generates:
- `release/ErgonPDF-v1.2.0-Windows-Setup.zip` (14.65 MB)
- `release/ErgonPDF-v1.2.0-Windows-Setup.zip.sha256`
- `release/SHA256SUMS.txt`
- `release/latest.json` (Updater and metadata payload)

---

## 3. Microsoft WinGet Submission Runbook

To publish ErgonPDF to the official Microsoft WinGet Community Repository:
1. Verify manifests with `winget-cli`:
   ```powershell
   winget validate packaging\winget\manifests\e\ErgonPDF\ErgonPDF\1.2.0
   ```
2. Test local installation:
   ```powershell
   winget test --manifest packaging\winget\manifests\e\ErgonPDF\ErgonPDF\1.2.0
   ```
3. Submit Pull Request to `microsoft/winget-pkgs`.

---

## 4. Intranet & Air-Gapped Deployment

For secure government, defense, or banking networks disconnected from the public internet:
1. Run `npm run build` on a secure build agent.
2. Transfer the resulting `dist/` directory to the target environment.
3. Serve with the included Alpine Nginx container:
   ```bash
   docker build -t ergonpdf:1.2.0 .
   docker run -d -p 8080:80 --name ergonpdf ergonpdf:1.2.0
   ```
4. Verify all fonts, WebAssembly binaries, and workers load locally without attempting internet requests.
