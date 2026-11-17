# ADR 005: Zero-Dependency Localhost Static Loopback Daemon for Windows Desktop

**Status:** `ACCEPTED`  
**Date:** November 2026  
**Deciders:** ErgonPDF Core Architecture Team & Senior Windows Release Engineers  

---

## Context

Many users prefer launching applications from their Windows Desktop or Start Menu as a native application rather than navigating to a website or starting a terminal command.

Common desktop packaging strategies exhibit substantial drawbacks:
1. **Electron Framework**: Bundling Chromium + Node.js creates ~150MB–250MB installer downloads, consumes 300MB+ idle RAM, and requires complex code signing and background update infrastructure.
2. **Tauri / WebView2 Native Binaries**: Requires Rust compilation toolchains (`cargo`, MSVC C++ runtime), platform-specific build environments, and native bridge maintenance.
3. **Pure Static File Access (`file://`)**: Browsers enforce strict cross-origin restrictions on `file://` URIs, breaking Web Workers (`pdf.worker.min.js`), WebAssembly instantiations, and Canvas image data reads (`SecurityError: The operation is insecure`).

---

## Decision

We deploy a **Zero-Dependency Static HTTP Loopback Daemon** (`installer/serve.cjs`) executing via native Node.js:

```text
+---------------------------------------------------------------+
|         Windows Explorer / Desktop Icon / Start Menu          |
+---------------------------------------------------------------+
                                |
                                v
+---------------------------------------------------------------+
|       installer/ErgonPDF.bat  ==>  run-hidden.vbs             |
+---------------------------------------------------------------+
                                |
                                v
+---------------------------------------------------------------+
|             Local Loopback Daemon (serve.cjs)                 |
|             Bound strictly to 127.0.0.1:8074                  |
|             Zero external network listening interfaces        |
+---------------------------------------------------------------+
                                |
        +-----------------------+-----------------------+
        |                                               |
        v                                               v
+-------------------------------+               +-------------------------------+
| Static Asset Delivery         |               | Health & Liveness Probes      |
| - Gzip-compressed chunks      |               | - /healthz -> 200 OK          |
| - MIME type resolution        |               | - /api/health -> JSON Status  |
| - SPA fallback to index.html  |               | - Process PID in .ergon_...   |
+-------------------------------+               +-------------------------------+
                                |
                                v
+---------------------------------------------------------------+
|     Default Web Browser (Chrome, Edge, Brave, Firefox)        |
+---------------------------------------------------------------+
```

1. **Loopback Server (`serve.cjs`)**: Pure Node.js `http` server using built-in standard libraries (`node:http`, `node:fs`, `node:path`, `node:zlib`). Zero external npm production dependencies required.
2. **Strict Loopback Binding**: Binds exclusively to `127.0.0.1` (localhost). It does NOT listen on `0.0.0.0`, ensuring the server cannot be accessed across local LANs.
3. **Silent Background Daemon**: `run-hidden.vbs` spawns the node process invisibly without leaving an open terminal command prompt.
4. **Automated Desktop Integration**: `install-ergonpdf.bat` and PowerShell scripts generate standard Windows `.lnk` shortcuts with customized icons (`icon.ico`) and register uninstallation entries in Windows Settings.

---

## Consequences

### Positive
- **Ultra-Lightweight**: Installer payload is only ~2.5MB (compared to 150MB+ for Electron).
- **Zero Additional Native Dependencies**: Runs on any workstation with standard Node.js installed.
- **Native Browser Engine**: Leverages the user's existing updated browser (Chrome/Edge/Brave/Firefox) with optimal V8 JIT performance and hardware-accelerated canvas.
- **Clean Uninstallation**: Uninstaller cleanly terminates background processes, purges shortcuts, and eradicates `%LOCALAPPDATA%\ErgonPDF`.

### Negative & Mitigations
- **Requires Node.js**: User must have Node.js installed on the host machine.  
  *Mitigation*: The installer (`install-ergonpdf.bat`) automatically checks for `node.exe`. If missing, it can invoke winget or provide direct download links.
