# ErgonPDF Release Process & Engineering Runbook

This document specifies the standard release procedure, automated packaging pipeline, cryptographic signing protocols, and quality gates for **ErgonPDF**.

---

## 1. Version Alignment Checklist

Before initiating any release candidate, verify that version numbers are strictly synchronized across all project manifests:

1. **`package.json`**: `"version": "x.y.z"`
2. **`package-lock.json`**: Generated lockfile version
3. **`installer/.ergon_runtime.json`**: `"version": "x.y.z"`
4. **`installer/serve.cjs`**: `const VERSION = 'x.y.z';`
5. **`docs/openapi.yaml`**: `info.version: "x.y.z"`
6. **`CITATION.cff`**: `version: x.y.z` and `date-released: YYYY-MM-DD`
7. **`CHANGELOG.md`**: Complete release notes section under `[x.y.z] - YYYY-MM-DD`

---

## 2. Pre-Release Verification Gate (Mandatory 4-Gate Check)

Every check must pass with exit code `0` before pushing a release tag or building artifacts:

```bash
# Gate 1: Static Code Analysis (0 errors, 0 warnings)
npm run lint

# Gate 2: Strict TypeScript Compilation & Production Asset Bundling
npm run build

# Gate 3: Core PDF Engine Integrity Suite (25 end-to-end features)
npm run test-features

# Gate 4: Comprehensive HTTP Route & UI Tool Handler Smoke Test (168 points)
npm run smoke-test
```

If **any** gate fails, the release candidate is halted immediately.

---

## 3. Windows Distribution Packaging

ErgonPDF provides an automated Windows packaging script that generates a portable, self-contained distribution archive:

```powershell
# Run the automated Windows packager
node scripts/package-windows-installer.cjs
```

The script produces:
- `release/ErgonPDF-vX.Y.Z-Windows-Setup.zip`
- `release/ErgonPDF-vX.Y.Z-Windows-Setup.zip.sha256`
- `release/SHA256SUMS.txt`
- `release/latest.json`
- Embedded `serve.cjs` headless static daemon
- Pinned production `dist/` bundle
- Desktop & Start Menu shortcut generation scripts (`create-shortcuts.ps1`)
- Control Panel uninstallation hooks (`uninstall.bat`)
- Root launcher scripts (`install.bat`, `launch.bat`, `update.bat`, `uninstall.bat`)

---

## 4. Cryptographic Checksum Generation

Release packages must be cryptographically hashed to ensure tamper-proof distribution.

In PowerShell:
```powershell
# Compute SHA-256 for release artifacts
Get-FileHash release-artifacts\ErgonPDF-Windows-Setup-v*.zip -Algorithm SHA256 | Format-List
```

Store the hashes in `release-artifacts/SHA256SUMS.txt`:
```text
<SHA256_HASH> *ErgonPDF-Windows-Setup-v1.2.0.zip
```

---

## 5. Offline Air-Gap Verification Protocol

Before declaring an artifact ready for distribution:
1. Boot a clean Windows virtual machine or test machine with **all network adapters disabled** (no Wi-Fi, no Ethernet).
2. Extract the generated release archive.
3. Run `install.bat`.
4. Verify that:
   - The loopback daemon starts at `http://127.0.0.1:8074`.
   - The UI loads completely with all local fonts (`Inter`, `JetBrains Mono`).
   - The PDF.js Web Worker loads from local cache.
   - Merging, splitting, watermarking, and AES-256 locking function flawlessly.
   - Local OCR functions using cached language data.
   - Developer tools network tab shows **zero external network requests**.

---

## 6. Git Tagging & Release Publication

Once all verification steps succeed:

```bash
# 1. Commit synchronized version manifests
git commit -am "chore(release): bump version to v1.2.0"

# 2. Create signed semantic version tag
git tag -s v1.2.0 -m "Release ErgonPDF v1.2.0 - 126 Local Client-Side PDF Tools"

# 3. Push tag to upstream repository
git push origin v1.2.0

# 4. Generate GitHub Release
# Upload ErgonPDF-Windows-Setup-v1.2.0.zip and SHA256SUMS.txt to GitHub Releases
```

---

## 7. Post-Release Monitoring & Emergency Rollback

If a critical regression (P0 Blocker) is identified post-release:
1. Revert to previous stable tag: `git checkout v1.1.0`.
2. Repackage distribution ZIP with patch bump (e.g. `v1.2.1`).
3. Publish urgent patch advisory following [SECURITY.md](SECURITY.md) guidelines.
