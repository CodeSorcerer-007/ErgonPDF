# Application Security & Threat Modeling Audit

## Executive Summary
This security audit provides an empirical threat assessment of the ErgonPDF application across both its client-side React/WASM execution environment and its local desktop loopback HTTP server (`installer/serve.cjs`).

All threat vectors were evaluated using actual proof-of-concept payloads, vulnerability scanners (`npm audit`), and code forensics.

---

## 1. Vulnerability Findings & Severity Matrix

| Finding ID | Vulnerability Description | CWE | Severity | Exploitability | User Impact |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **SEC-01** | **Fake Redaction Vulnerability**: Blackout rectangle overlay leaves underlying text stream extractable. | CWE-212 | **P0 - Critical** | **Trivial** | Massive data breach: users believe sensitive data is sanitized, but text is 100% readable. |
| **SEC-02** | **Arbitrary Code Execution in PDF.js (CVE-2024-4367)**: Outdated `pdfjs-dist@3.11.174` executes malicious font scripts. | CWE-94 | **P0 - Critical** | **High** | Malicious PDF opened by user can execute arbitrary JavaScript in the application sandbox. |
| **SEC-03** | **DNS Rebinding Vulnerability in `serve.cjs`**: Missing `Host` header validation on local HTTP server. | CWE-350 | **P1 - High** | **Medium** | Malicious website in another browser tab can query the local ErgonPDF server. |
| **SEC-04** | **Permissive CSP `connect-src https:`**: Incomplete exfiltration containment. | CWE-1021 | **P1 - High** | **Medium** | Allows exfiltration of data over HTTPS if any dependency is compromised via supply chain. |
| **SEC-05** | **Client-Side DoS via Decompression / Memory Exhaustion**: Processing 1GB+ PDF crashes browser tab. | CWE-400 | **P2 - Medium** | **Medium** | Browser tab crashes due to V8 heap allocation limits (`ArrayBuffer` exhaustion). |
| **SEC-06** | **Dead Code in Local Storage**: Orphaned storage descriptors. | CWE-561 | **P3 - Low** | **None** | Minor code hygiene issue; no security impact. |

---

## 2. In-Depth Technical Forensics

### 2.1 SEC-01: The "Fake Redaction" Vulnerability (CWE-212: Improper Removal of Sensitive Information)
- **Severity**: **P0 (Critical Security Flaw)**
- **File Reference**: `src/services/pdfEngine.ts:581-608`
- **Vulnerable Code**:
  ```typescript
  page.drawRectangle({
    x: boxX,
    y: boxY,
    width: boxWidth,
    height: boxHeight,
    color: rgb(0, 0, 0),
  });
  ```
- **Exploitation & Proof-of-Concept**:
  1. Open a PDF containing sensitive text (e.g. `Social Security Number: 123-45-6789`).
  2. Select the Redact tool, draw a black blackout box over the SSN, and export the document.
  3. The resulting document displays an opaque black rectangle visually.
  4. Open the exported PDF in Adobe Acrobat, Chrome, or run `pdftotext output.pdf -`.
  5. Select the black region with the cursor and press `Ctrl+C`, or inspect the text stream.
  6. The string `Social Security Number: 123-45-6789` is copied to the clipboard!
- **Exploitability**: **Trivial**. Any recipient who selects all text (`Ctrl+A`) and copies it recovers the full unredacted contents immediately.
- **Recommended Remediation**:
  - Implement genuine content stream rewriting: parse content stream token operators (`Tj`, `TJ`, `cm`), calculate character bounding boxes, and completely strip text tokens that intersect the redaction rectangle.
  - As an immediate emergency fallback, burn the page region into a flattened opaque raster image canvas, permanently replacing the vector text stream with black pixels.

---

### 2.2 SEC-02: Known RCE Vulnerability in `pdfjs-dist` (CVE-2024-4367)
- **Severity**: **P0 (Critical Vulnerability)**
- **File Reference**: `package.json:48` (`"pdfjs-dist": "3.11.174"`)
- **Vulnerability Details**:
  - `pdfjs-dist` versions prior to 4.2.67 are vulnerable to **Arbitrary JavaScript Execution** upon opening a malicious PDF file (GHSA-wgrm-67xf-hhpq / CVE-2024-4367).
  - A crafted Type 1 or TrueType font matrix evaluated in PDF.js font parsing escapes the parser sandbox and executes arbitrary JavaScript in the application window context.
- **Exploitability**: **High**. An attacker sends a crafted PDF to an ErgonPDF user; when the user opens it in the Viewer or any workspace tool, malicious code executes immediately.
- **Recommended Remediation**:
  - Upgrade `pdfjs-dist` to version `4.2.67` or higher immediately.
  - Set `isEvalSupported: false` in PDF.js loading parameters.

---

### 2.3 SEC-03: DNS Rebinding Vulnerability in `serve.cjs` (CWE-350)
- **Severity**: **P1 (High Severity)**
- **File Reference**: `installer/serve.cjs:86-105`
- **Vulnerability Details**:
  - `serve.cjs` binds to `127.0.0.1:8074`, which correctly prevents inbound connections from other physical machines on the LAN.
  - However, when handling incoming HTTP requests, line 87 reads:
    ```javascript
    const urlObj = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    ```
  - The server **does not validate the HTTP `Host` header**.
- **Exploitation Scenario**:
  1. A user running ErgonPDF Desktop visits an external website `attacker.com` in their web browser.
  2. `attacker.com` resolves via DNS with a very low TTL (1 second).
  3. Subsequent JavaScript requests from `attacker.com` rebind the domain to `127.0.0.1:8074`.
  4. The user's browser sends an HTTP request with `Host: attacker.com` to `127.0.0.1:8074`.
  5. `serve.cjs` accepts the request, serving ErgonPDF assets and responding to endpoints without restriction.
- **Recommended Remediation**:
  - Validate the `Host` header at the top of `handleRequest()`:
    ```javascript
    const host = (req.headers.host || '').split(':')[0].toLowerCase();
    if (host !== '127.0.0.1' && host !== 'localhost') {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden: Invalid Host Header');
      return;
    }
    ```

---

### 2.4 SEC-04: Permissive Content-Security-Policy (CSP)
- **Severity**: **P1 (High Severity)**
- **File Reference**: `nginx.conf:24`
- **Vulnerability Details**:
  - `connect-src 'self' blob: https:;`
  - Including `https:` in `connect-src` allows client-side code to make arbitrary outbound HTTPS requests (`fetch()`, `XMLHttpRequest`, `navigator.sendBeacon`) to any external domain on the public internet.
- **Impact**: Completely compromises the "zero document leakage" defense-in-depth model. If any npm dependency contains a malicious payload, it can exfiltrate document text to an external server without violating the browser's CSP.
- **Recommended Remediation**:
  - Bundle all OCR models and worker scripts locally in `public/tesseract/`.
  - Tighten CSP to: `connect-src 'self' blob:;`.

---

### 2.5 Path Traversal Audit on `serve.cjs` (CWE-22)
- **Severity**: **Evaluated — Safe with Hardening Recommended**
- **File Reference**: `installer/serve.cjs:128-135`
- **Audit Findings**:
  - Lines 129–132 sanitize paths using:
    ```javascript
    let safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
    ```
  - Automated tests attempting path escapes (`GET /..%2f..%2fpackage.json`, `GET /%2e%2e/%2e%2e/`, `GET /foo/../../package.json`) were safely contained within `baseDir` or returned 404.
  - **Defensive Improvement**: Add an explicit `path.resolve` boundary check:
    ```javascript
    const resolvedPath = path.resolve(baseDir, safePath);
    if (!resolvedPath.startsWith(path.resolve(baseDir))) {
      res.writeHead(403);
      res.end('403 Forbidden');
      return;
    }
    ```

---

## 3. Dependency Vulnerability Audit (`npm audit`)

Automated audit of the 23 installed npm packages revealed **4 High-Severity Vulnerabilities**:

| Package | Affected Versions | Advisory URL | Vulnerability Type | Status in ErgonPDF |
| :--- | :--- | :--- | :--- | :---: |
| `pdfjs-dist` | `<=4.1.392` | GHSA-wgrm-67xf-hhpq | Arbitrary Code Execution (CVE-2024-4367) | 🚨 **Active in Bundle** |
| `vite` | `8.2.0 - 8.2.2` | GHSA-698v-4r3x-3vcv | Windows command execution in `launch-editor` | ⚠️ DevDependency |
| `brace-expansion`| `<=1.1.20` | GHSA-q2hr-2g5m-vwhr | Quadratic CPU DoS / stack exhaustion | ⚠️ Transitive Dev |
| `source-map-js` | `1.0.0 - 1.2.1` | GHSA-68fv-2mgg-jv7q | Event-loop Denial of Service | ⚠️ Transitive Dev |

---

## 4. Security Action Checklist

- [ ] **SEC-01**: Rewrite `applyRedactions()` to permanently purge vector text stream operators and rasterize underlying content.
- [ ] **SEC-02**: Upgrade `pdfjs-dist` to `>=4.2.67` to eliminate arbitrary code execution (CVE-2024-4367).
- [ ] **SEC-03**: Add `Host` header validation (`localhost` / `127.0.0.1` only) to `installer/serve.cjs`.
- [ ] **SEC-04**: Eliminate `https:` from `connect-src` in `nginx.conf` and inject strict CSP into `serve.cjs`.
- [ ] **SEC-05**: Add memory allocation bounds and cancellation tokens for documents >100MB to prevent browser tab freezing.
