# ErgonPDF Enterprise General Availability (GA) Code Signing & Packaging Guide

This document details the enterprise packaging, Authenticode code signing architecture, Microsoft SmartScreen reputation bootstrapping, and Active Directory Group Policy (GPO) deployment standards for **ErgonPDF**.

---

## 1. Enterprise Code Signing Architecture

In enterprise Windows environments, executing untrusted batch scripts, PowerShell runners, or executable wrappers triggers Windows SmartScreen warnings and Application Control (WDAC) blocks unless signed with a trusted cryptographic certificate.

```text
+---------------------------------------------------------------+
|         ErgonPDF Windows Distribution Package                 |
|         (serve.cjs, ErgonPDF.bat, run-hidden.vbs)             |
+---------------------------------------------------------------+
                                |
                                v
+---------------------------------------------------------------+
|             Hardware Security Module (HSM) / Azure Key Vault  |
|             Extended Validation (EV) Code Signing Cert        |
|             (RFC 3161 Timestamping Service)                   |
+---------------------------------------------------------------+
                                |
                                v
+---------------------------------------------------------------+
|           Digitally Signed Windows Install Package            |
|       - Zero SmartScreen "Unknown Publisher" Warnings         |
|       - Compliant with Windows Defender Application Control   |
+---------------------------------------------------------------+
```

---

## 2. Signing Windows Scripts & Executables with `signtool.exe`

For corporate deployments where batch scripts are wrapped as native `.exe` or `.msi` installers:

```cmd
:: Using Microsoft SignTool with RFC 3161 Timestamping
signtool.exe sign ^
  /tr http://timestamp.digicert.com ^
  /td sha256 ^
  /fd sha256 ^
  /sha1 <CERTIFICATE_THUMBPRINT> ^
  "release-artifacts\ErgonPDF-Windows-Setup-v1.2.0.exe"
```

To verify the signature:
```cmd
signtool.exe verify /pa /v "release-artifacts\ErgonPDF-Windows-Setup-v1.2.0.exe"
```

---

## 3. Microsoft Defender SmartScreen Reputation Strategy

New software releases often trigger the Windows SmartScreen warning:
*"Windows protected your PC — Microsoft Defender SmartScreen prevented an unrecognized app from starting."*

### Strategy to Establish Instant Trust:
1. **Extended Validation (EV) Certificate**: EV certificates immediately grant instant SmartScreen reputation from the very first download, bypassing the warning dialog entirely.
2. **Microsoft Edge Developer Program**: Submit the compiled release package to the Microsoft Security Intelligence portal (`https://www.microsoft.com/en-us/wdsi/filesubmission`) for automated false-positive clearing.
3. **Enterprise Whitelisting via GPO**: For corporate intranet deployments, enterprise sysadmins can distribute the internal CA root or whitelist the ErgonPDF application hash.

---

## 4. Enterprise Group Policy (GPO) & Microsoft Intune Deployment

ErgonPDF can be deployed silently across thousands of workstations via Microsoft Intune or Active Directory GPO:

### Microsoft Intune Win32 App Packaging (`.intunewin`):
1. Wrap the distribution directory using the Microsoft Win32 Content Prep Tool (`IntuneWinAppUtil.exe`):
   ```cmd
   IntuneWinAppUtil.exe -c .\installer -s install-ergonpdf.bat -o .\intune-output
   ```
2. **Install Command**: `install-ergonpdf.bat /silent`
3. **Uninstall Command**: `uninstall-ergonpdf.bat /silent`
4. **Detection Rule**:
   - Rule Type: **File**
   - Path: `%LOCALAPPDATA%\ErgonPDF`
   - File or folder: `serve.cjs`

---

## 5. Air-Gapped & High-Security Compliance Auditing

Corporate security teams auditing ErgonPDF for air-gapped deployment can verify:

1. **Zero External Sockets**: The `serve.cjs` daemon opens a TCP listening socket strictly on `127.0.0.1`. It refuses connections from other IP addresses on the local network.
2. **No Dynamic Code Injection**: All scripts are strictly bundled; no `eval()` or unvetted remote scripts are loaded at runtime.
3. **Local Cryptographic Primitives**: Password encryption uses standard WebCrypto `crypto.subtle` operations with zero third-party telemetry.
