# Security Architecture & Threat Model

ErgonPDF is engineered from the ground up to operate in zero-trust, high-compliance environments including legal defense teams, healthcare networks (HIPAA), and financial institutions.

This document describes the security model, cryptographic invariants, and threat mitigations implemented across the platform.

---

## 1. The Core Security Invariant

> **ZERO DATA EGRESS INVARIANT:**  
> No document content, parsed text, metadata, form values, biometric signatures, or diagnostic telemetry may ever leave the host machine.
>
> All operations execute strictly within local browser sandbox memory (`ArrayBuffer` / `Uint8Array`) or isolated WebAssembly worker threads.

---

## 2. Threat Model & Mitigations

### Threat 1: Malicious Remote Exfiltration (Data Theft)
- **Attack Vector:** An attacker compromises a client dependency or attempts to inject remote beacons to harvest opened PDF files.
- **Mitigation:**
  - Strict Content Security Policy (CSP) headers disallow remote script sources and external network connections.
  - Zero external analytics packages (`Google Analytics`, `Mixpanel`, `Sentry`) exist in `package.json`.
  - Offline-first font loading via `@font-face` from local `/fonts/` prevents CDN tracking.

### Threat 2: DNS Rebinding Attacks
- **Attack Vector:** A user visits a malicious website while running the ErgonPDF local desktop daemon (`127.0.0.1:8074`). The attacker's script rebinds DNS to localhost and attempts to execute HTTP calls to read local documents.
- **Mitigation:**
  - `installer/serve.cjs` enforces strict loopback Host validation:
    ```javascript
    const hostHeader = (req.headers.host || '').split(':')[0].toLowerCase();
    if (hostHeader && hostHeader !== '127.0.0.1' && hostHeader !== 'localhost') {
      res.writeHead(403);
      res.end('403 Forbidden: Invalid Host Header (DNS Rebinding Guard)\n');
      return;
    }
    ```
  - Any request bearing a forged Host header is rejected immediately with `403 Forbidden`.

### Threat 3: Directory Traversal via Loopback Daemon
- **Attack Vector:** An attacker crafts requests like `http://127.0.0.1:8074/../../Windows/System32/drivers/etc/hosts`.
- **Mitigation:**
  - `installer/serve.cjs` strips directory traversal sequences (`normalize().replace(/^(\.\.[/\\])+/, '')`).
  - Access outside `dist/` is blocked and returns `404 Not Found`.

### Threat 4: Forensically Incomplete Redaction
- **Attack Vector:** Redactions that simply draw black rectangles on top of text allow attackers to select and copy the underlying sensitive text.
- **Mitigation:**
  - ErgonPDF redacts documents at the binary stream level: text tokens, font coordinates, and drawing instructions are physically removed from the PDF object streams prior to saving.

### Threat 5: Malformed or Weaponized PDF Exploits
- **Attack Vector:** PDFs containing malicious JavaScript, launch actions, or buffer overflow payloads intended to exploit desktop PDF readers.
- **Mitigation:**
  - PDF rendering is isolated in Mozilla PDF.js inside a restricted browser sandbox.
  - Script actions (`/JavaScript`, `/Launch`) are ignored and not executed during standard rendering.

---

## 3. Cryptographic Implementation Details

- **Algorithm:** AES-256 (Advanced Encryption Standard with 256-bit keys)
- **Specification:** ISO 32000-2 Rev 6 (PDF 2.0 Standard)
- **Key Derivation:** PBKDF2 with SHA-256 HMAC and random salt
- **Engine:** Native browser `crypto.subtle` (WebCrypto API) hardware-accelerated instructions.
