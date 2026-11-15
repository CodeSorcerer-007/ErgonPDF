# ErgonPDF Privacy Policy & Architectural Security Manifesto

> **Last Updated:** November 2026  
> **Status:** Active & Enforced  
> **Core Guarantee:** 100% Local Processing. Zero Cloud Uploads. Zero Telemetry. Free & Open Source Forever.

---

## 1. Executive Summary

Most web-based PDF utilities (e.g., ILovePDF, SmallPDF, Sejda) require users to transmit documents to remote cloud servers for processing. This presents significant security, compliance, and confidentiality hazards for legal contracts, medical charts, financial audits, and intellectual property.

**ErgonPDF is engineered from the ground up on an uncompromising local-first paradigm.** When you open ErgonPDF—whether through the browser or via the offline Windows desktop application—your documents **never leave your machine**. 

Every computation (merging, splitting, redacting, converting, password encryption, and OCR optical character recognition) occurs directly within your client runtime memory using WebAssembly and pure JavaScript.

---

## 2. Zero-Transmission Architectural Invariant

```
Cloud PDF Converters:
[User Machine]  ──(Internet / Sensitive PDF Upload)──>  [Remote Cloud Server]  ──(Storage / Risk)

ErgonPDF:
[User Machine]
 ┌────────────────────────────────────────────────────────┐
 │ Browser Runtime / Isolated Sandbox                     │
 │   - WebAssembly Core (pdf-lib, pdfjs-dist, tesseract)  │
 │   - Local Memory Buffer (RAM only)                     │
 │   - Client-side File System Export                     │
 └────────────────────────────────────────────────────────┘
                       ✖ NO NETWORK EGRESS ✖
```

1. **No Remote Servers**: ErgonPDF has no operational backend API for processing files. The static server provided in the Windows installer serves only static HTML, CSS, JavaScript, and WebAssembly bundles on `127.0.0.1`.
2. **Zero Analytics or Telemetry**: ErgonPDF contains no Google Analytics, Segment, Mixpanel, Sentry, Clarity, Facebook Pixels, or external beacons.
3. **Zero Third-Party Ad Networks**: There are no advertisements, sponsor trackers, or affiliate scripts.
4. **Air-Gap Capability**: You can load ErgonPDF, completely disconnect from the Internet (or run in an air-gapped secure room), and every single tool continues to function without degradation.

---

## 3. Data Storage & Browser Persistence

| Storage Medium | What Is Stored | Lifespan | Sensitive Content Included? |
| :--- | :--- | :--- | :--- |
| **System RAM** | Active PDF byte buffers during processing | Cleared immediately on tool reset, navigation, or tab closure | **Temporary only** during active edit |
| **LocalStorage** | Theme preference (dark/light), favorite tools, UI layout | Persistent until manually cleared by user | **NO** (only UI preference strings) |
| **IndexedDB / CacheStorage** | Static application cache & offline OCR neural model weights | Persists for offline re-use | **NO** (only static code assets) |
| **SessionStorage** | Transient navigation breadcrumbs | Cleared on tab close | **NO** |

---

## 4. Third-Party Libraries & Engine Transparency

ErgonPDF uses exclusively vetted, open-source libraries that execute within the client engine:

- **pdf-lib**: Pure JavaScript / TypeScript PDF manipulation engine. Executes entirely in the main thread or Web Workers.
- **pdfjs-dist**: Mozilla's industry-standard PDF rendering and inspection engine.
- **tesseract.js**: WebAssembly port of the Tesseract OCR engine. Neural network language models (`eng.traineddata`) are cached in local browser storage after initial fetch, enabling full offline OCR.
- **@pdfsmaller/pdf-encrypt**: Local Web Crypto API-based AES-256 and RC4 encryption and decryption routines.
- **qrcode**: Client-side QR generation into in-memory SVG/PNG elements.
- **jszip**: Client-side ZIP packaging for batch extractions.

---

## 5. Regulatory Compliance & Enterprise Suitability

Because ErgonPDF does not collect, receive, store, or transmit any Protected Health Information (PHI), Personally Identifiable Information (PII), or confidential corporate records:

- **HIPAA**: Suitable for processing medical records and patient documents without requiring a Business Associate Agreement (BAA), because no third party ever touches the data.
- **GDPR / CCPA**: ErgonPDF is not a Data Controller nor a Data Processor of your document data under GDPR definitions; data processing is performed solely by the data subject on their own hardware.
- **Confidentiality & Non-Disclosure Agreements (NDAs)**: Complies with strict non-disclosure clauses forbidding the upload of proprietary material to third-party cloud services.
- **Legal & Financial Auditing**: Safe for tax returns, bank statements, client discovery exhibits, and deposition transcripts.

---

## 6. How to Verify Our Zero-Upload Guarantee

We encourage security teams and privacy-conscious users to independently verify our claims:

1. **Browser Network Inspector**:
   - Open your browser Developer Tools (`F12` or `Ctrl + Shift + I`).
   - Switch to the **Network** tab.
   - Load a large PDF into ErgonPDF and perform Merge, Split, or Redaction operations.
   - Observe that **zero POST or PUT requests** with file payloads are transmitted.
2. **Wireshark / Packet Capture**:
   - Run a packet analyzer while operating ErgonPDF via the Windows desktop installer (`install-ergonpdf.bat`).
   - Verify that all HTTP traffic is strictly constrained to `127.0.0.1` loopback.
3. **Open-Source Audit**:
   - Review our complete codebase on GitHub: [https://github.com/CodeSorcerer-007/ErgonPDF](https://github.com/CodeSorcerer-007/ErgonPDF).

---

## 7. Security Vulnerability Reporting

If you believe you have discovered a vulnerability or potential security risk in ErgonPDF, please consult our [SECURITY.md](../SECURITY.md) policy. We take security disclosures seriously and respond promptly.
