# ErgonPDF Troubleshooting & Diagnostics Guide

This document provides resolutions for common operational, rendering, and desktop installation issues encountered in ErgonPDF.

---

## 1. Document Processing & In-Memory Operations

### Issue: "Input PDF buffer cannot be empty" or File Fails to Load
- **Cause**: The selected file has 0 bytes or the file picker was canceled before byte read completion.
- **Resolution**: Confirm the file is a valid PDF document with byte size > 0. If the file is locked by another program (e.g. Adobe Acrobat), close that application and retry.

### Issue: Browser Canvas Out-of-Memory on 500+ Page Documents
- **Cause**: Rendering high-DPI canvas thumbnails for hundreds of pages simultaneously can exceed the browser's allocated tab memory (~1.5GB–2GB in 32-bit/standard V8 processes).
- **Resolution**:
  - Use the **Split PDF** tool to process the document in smaller chapter increments.
  - In Settings, reduce the default thumbnail rendering quality from "High (300 DPI)" to "Standard (150 DPI)".
  - Close unused browser tabs to free system RAM.

### Issue: "fetchStandardFontData: baseUrl parameter must be specified" Console Warning
- **Cause**: PDF.js emits this non-fatal diagnostic warning when a document contains non-embedded standard Type 1 fonts (Helvetica, Times, Courier) and fallback glyphs are synthesized locally.
- **Resolution**: This warning is harmless and does not affect the output. All text extraction, rendering, and mutations continue normally.

### Issue: Redaction Verification
- **Question**: How do I know text was permanently removed and not just covered by a black rectangle?
- **Verification Protocol**:
  1. Open the redacted document in ErgonPDF's **Extract Text** tool or in any PDF reader.
  2. Press `Ctrl + A` and `Ctrl + C` to copy all text.
  3. Search for the redacted words.
  4. The redacted words will be completely absent from the text stream because ErgonPDF physically excises the text glyph objects from the `/Contents` dictionary.

---

## 2. Windows Desktop Installer Issues

### Issue: Port 8074 Already in Use
- **Symptom**: `installer\ErgonPDF.bat` fails to connect or serves a different application.
- **Resolution**:
  - Another local application is occupying port 8074.
  - You can launch `serve.cjs` on a custom port:
    ```cmd
    node installer\serve.cjs --port 8095
    ```
  - Or set the `PORT` environment variable:
    ```cmd
    set PORT=8095 && .\launch.bat
    ```

### Issue: "Node.js runtime was not found on this system"
- **Symptom**: `install.bat` alerts that Node.js is missing.
- **Resolution**:
  - Install Node.js LTS from [https://nodejs.org](https://nodejs.org) or via Windows Package Manager:
    ```cmd
    winget install OpenJS.NodeJS.LTS
    ```
  - Re-run `install.bat`.

### Issue: PowerShell Execution Policy Restriction on `create-shortcuts.ps1`
- **Symptom**: Shortcut creation fails with `execution of scripts is disabled on this system`.
- **Resolution**:
  - The installer runs with `-ExecutionPolicy Bypass`. If your corporate machine enforces strict group policies, run:
    ```powershell
    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
    ```

### Issue: Antivirus False Positive on `run-hidden.vbs`
- **Symptom**: Windows Defender or third-party antivirus flags `run-hidden.vbs`.
- **Cause**: VBScript files that execute background processes without console windows are frequently subjected to heuristic scrutiny.
- **Resolution**:
  - Inspect `installer\run-hidden.vbs` in Notepad—it contains only 3 lines that execute `node serve.cjs` in window style `0` (hidden).
  - Add `%LOCALAPPDATA%\ErgonPDF` to your antivirus exclusions, or launch ErgonPDF directly via `node installer\serve.cjs` without the VBS wrapper.

---

## 3. Offline & Air-Gapped Operation

### Issue: OCR Fails in Completely Disconnected / Air-Gapped Environment
- **Cause**: Tesseract.js attempts to fetch trained language weights (`eng.traineddata.gz`) on first use if not already cached.
- **Resolution**:
  - Download the required language weights on an internet-connected machine:
    `https://tessdata.projectnaptha.com/4.0.0/eng.traineddata.gz`
  - Place the downloaded file into `public/tessdata/eng.traineddata.gz`.
  - ErgonPDF will load the weights locally without any outbound network calls.

---

## 4. Diagnostics Collection Runbook

If you need to submit a bug report via [BETA_FEEDBACK_TEMPLATE.md](../BETA_FEEDBACK_TEMPLATE.md):

1. Open Developer Tools (`F12`).
2. Switch to the **Console** tab.
3. Reproduce the error.
4. Right-click the error message and choose **Copy object** or copy the stack trace.
5. **Sanitize personal file paths**: Search and replace `C:\Users\<YourUsername>` with `C:\Users\<user>` before posting.
