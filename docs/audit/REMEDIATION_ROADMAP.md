# Engineering Remediation Roadmap & Release Readiness Strategy

## Executive Mandate
This engineering roadmap establishes the tactical release plan to remediate all P0 blockers, harden application security, eliminate misleading placeholder implementations, and upgrade ErgonPDF into a verified, commercial-grade local-first workstation.

---

## 1. Prioritized Remediation Sprints

```mermaid
gantt
    title Remediation Sprints & Release Progression
    dateFormat X
    axisFormat Sprint %s
    section Sprint 1 (P0 Blockers)
    P0-01: True Vector Redaction Purge      : 0, 7
    P0-02: Upgrade pdfjs-dist (CVE-2024-4367) : 0, 3
    P0-06: Bundle Offline OCR Models & Workers: 3, 7
    P1-01: Reconnect Metadata Scrubber        : 5, 8
    P1-02: DNS Rebinding Host Validation       : 2, 4
    section Sprint 2 (Core Formats)
    P0-03: Authentic DOCX Export (docx.js)    : 7, 14
    P0-04: Tabular XLSX Engine (SheetJS)      : 9, 16
    P0-05: VeraPDF-Compliant ISO PDF/A Engine : 12, 19
    P1-03: Fix Page Tree Node Reorder Crash   : 8, 11
    section Sprint 3 (Desktop & Architecture)
    P1-04: Non-Destructive QPDF WASM Repair   : 14, 21
    P2-01: Compression Safeguards             : 16, 18
    P2-03: Decryption Password Prompt         : 18, 21
    Native Desktop Packaging (Tauri v2)       : 21, 28
```

---

## 2. Sprint 1: Critical Security & Integrity Remediation (Immediate / v1.2.1)

### Priority P0 Objectives
1. **Fix P0-01: True Vector Redaction Purge (`redact-pdf`)**:
   - Rewrite `PDFEngineService.applyRedactions()`:
     - Detect all text and drawing operators (`Tj`, `TJ`, `Do`, `re`) intersecting the blackout rectangle.
     - Physically strip these operators from the content stream so text cannot be copied, searched, or extracted.
     - As an immediate defense-in-depth, rasterize the redacted page section into an opaque bitmap canvas, permanently burning the blackout pixels.
   - **Acceptance Criterion**: Running `extractFullText()` on a redacted document confirms zero instances of redacted text strings.
2. **Fix P0-02: Upgrade `pdfjs-dist` to Patch CVE-2024-4367**:
   - Update `package.json` dependency: `"pdfjs-dist": "^4.2.67"`.
   - Update worker script in `public/pdf.worker.min.js`.
   - Ensure `isEvalSupported: false` is configured on all PDF.js loading tasks.
   - **Acceptance Criterion**: `npm audit` reports zero high-severity vulnerabilities.
3. **Fix P0-06: Bundle Tesseract OCR Workers & Models Locally**:
   - Download official `tesseract.js` worker (`worker.min.js`), WebAssembly core (`tesseract-core.wasm`), and `eng.traineddata.gz`.
   - Store them locally in `public/tesseract/`.
   - Configure `OCRService.recognizeImage` to pass explicit local file paths.
   - **Acceptance Criterion**: OCR text recognition succeeds with 100% accuracy when external network interfaces are disabled.
4. **Fix P1-01: Reconnect Metadata Scrubber**:
   - Update `src/components/UniversalWorkspace.tsx:handleExportPDF()` to pass `metadataFields` into `PDFEngineService.reorderAndTransformPages()`.
   - Set Title, Author, Subject, and Keywords in the PDF info dictionary prior to `doc.save()`.
   - **Acceptance Criterion**: Exported PDF contains updated metadata fields in Document Properties.
5. **Fix P1-02: Prevent DNS Rebinding in `serve.cjs`**:
   - Add Host header check at top of `handleRequest()` in `installer/serve.cjs`:
     ```javascript
     const host = (req.headers.host || '').split(':')[0].toLowerCase();
     if (host !== '127.0.0.1' && host !== 'localhost') {
       res.writeHead(403, { 'Content-Type': 'text/plain' });
       res.end('403 Forbidden: Invalid Host Header');
       return;
     }
     ```
   - **Acceptance Criterion**: Requests with `Host: evil.com` return 403 Forbidden.

---

## 3. Sprint 2: High-Fidelity Local Conversions (v1.3.0)

### Priority P0 & P1 Objectives
1. **Fix P0-03: Authentic Microsoft Word (DOCX) Generation**:
   - Add `docx` (`docx.js`) dependency.
   - Parse PDF.js text items with font sizes and marked content.
   - Assemble authentic OpenXML paragraph and run structures into a modern `.docx` zip package.
   - **Acceptance Criterion**: Exported `.docx` opens in Microsoft Word without format or extension mismatch warnings.
2. **Fix P0-04: Authentic Microsoft Excel (XLSX) Generation**:
   - Add SheetJS (`xlsx`) dependency.
   - Implement spatial 2D coordinate clustering algorithm to group text items into rows and columns.
   - Export binary `.xlsx` spreadsheet workbooks.
   - **Acceptance Criterion**: Invoices and tabular reports open in Excel with clean multi-column layouts.
3. **Fix P0-05: VeraPDF-Compliant ISO PDF/A Archival Engine**:
   - Embed standard sRGB ICC color profile as an `/OutputIntent`.
   - Validate that all font glyphs are embedded in the PDF document.
   - Inject standardized XMP metadata packet with official `pdfaid` namespace.
   - **Acceptance Criterion**: Exported PDF/A passes official VeraPDF CLI validator with 0 compliance errors.
4. **Fix P1-03: Resilient Page Tree Reordering**:
   - Add sanitization loop resolving indirect page object pointers in `PDFEngineService.reorderAndTransformPages()`.
   - **Acceptance Criterion**: Reordering pages in complex multi-page documents executes without `undefined (reading 'node')` errors.

---

## 4. Sprint 3: Native Desktop Architecture & Packaging (v1.4.0)

### Architectural Transformation
1. **Migrate from Batch Script to Tauri v2 Desktop Bundle**:
   - Build a lightweight native desktop binary for Windows (`.msi` / `.exe`), macOS (`.dmg`), and Linux (`.AppImage`).
   - Bundle size <15 MB. Zero external runtime dependencies (eliminates Node.js prerequisite).
   - Direct OS file associations (double-click `.pdf` opens ErgonPDF).
2. **Integrate QPDF WebAssembly (`qpdf-wasm`)**:
   - Non-destructive PDF repair: rebuild corrupt XREF tables without rasterizing pages.
   - True ISO 32000 Fast Web View linearization with hint streams.
3. **Multi-Threaded Web Worker Pool**:
   - Move heavy PDF operations off the browser UI thread to maintain 60 FPS responsiveness during large operations.

---

## 5. Release Quality Gates & Verification Checklist

Before tagging and releasing any public version of ErgonPDF:

```bash
# 1. Zero Lint Errors
npm run lint

# 2. Strict Typecheck and Production Build
npm run build

# 3. Security Audit Pass
npm audit --omit=dev

# 4. Engine Feature Integrity Suite (20 core features)
npm run test-features

# 5. Comprehensive Local Smoke Test (85 points)
npm run smoke-test

# 6. Air-Gap Offline Verification
node scripts/test-offline.js
```

All 6 automated gates must exit with code 0 before any release artifact is published.
