# Critical Findings, Vulnerabilities & Defect Catalog

## Overview & Severity Definitions
This catalog details every verified defect, architectural weakness, security vulnerability, and misleading implementation identified during the deep engineering audit of ErgonPDF v1.2.0.

- **P0 (Critical)**: Data leakage, destructive data corruption, severe security vulnerabilities, false redaction or encryption guarantees. Immediate release blocker.
- **P1 (High)**: Broken core PDF operations, incorrect document conversions, installation failures in standard environments.
- **P2 (Medium)**: Performance degradation, usability friction, browser compatibility issues, missing non-critical sub-features.
- **P3 (Low)**: Cosmetic improvements, code hygiene, orphaned variables, minor styling anomalies.

---

## 1. P0 (Critical Findings) — Release Blockers

### Finding P0-01: Fake Redaction Vulnerability (Underlying Text Stream Remains Intact)
- **Severity**: **P0 (Critical Security Flaw)**
- **File Reference**: `src/services/pdfEngine.ts:581-608` (`applyRedactions()`)
- **Evidence**:
  ```typescript
  page.drawRectangle({
    x: boxX,
    y: boxY,
    width: boxWidth,
    height: boxHeight,
    color: rgb(0, 0, 0),
  });
  ```
- **Reproduction Steps**:
  1. Open a document containing sensitive text (e.g. `Account: 9876-5432-1098`).
  2. Select Redact tool, draw a black blackout box over the account number, and click Export PDF.
  3. Open the resulting PDF in Google Chrome or Adobe Acrobat.
  4. Drag the mouse across the black box and press `Ctrl+C`.
  5. Paste into Notepad. The full unredacted account number is displayed.
- **User Impact**: Severe privacy and legal liability. Users believing they have sanitized classified, medical (HIPAA), or financial documents will inadvertently distribute unredacted sensitive data.
- **Recommended Fix**:
  1. Parse the PDF content stream token operators (`Tj`, `TJ`) and remove all text drawing operators whose bounding boxes intersect the redaction coordinates.
  2. Burn the redacted page area into an opaque raster bitmap, permanently destroying the vector text stream.
- **Regression Test**: Automated test that stamps a unique token, applies redaction, extracts all text using PDF.js, and asserts `extractedText.includes(token) === false`.

---

### Finding P0-02: Known Arbitrary Code Execution Vulnerability in `pdfjs-dist` (CVE-2024-4367)
- **Severity**: **P0 (Critical Security Flaw)**
- **File Reference**: `package.json:48` (`"pdfjs-dist": "3.11.174"`)
- **Evidence**: `npm audit` flags GHSA-wgrm-67xf-hhpq on `pdfjs-dist <= 4.1.392`.
- **Reproduction Steps**:
  1. Construct a PDF containing a malicious Type 1 / TrueType font matrix evaluated by PDF.js font parsing.
  2. Open the file in ErgonPDF Reader or Workspace.
  3. The malicious script escapes the parser sandbox and executes arbitrary JavaScript in the browser context.
- **User Impact**: Potential compromise of local browser storage, DOM manipulation, or arbitrary client-side code execution when viewing untrusted PDFs.
- **Recommended Fix**: Upgrade `pdfjs-dist` to version `>=4.2.67` or `>=5.0.0` immediately. Ensure `isEvalSupported: false` is configured.
- **Regression Test**: Run `npm audit` and assert zero high-severity vulnerabilities in production dependencies.

---

### Finding P0-03: Pseudo-Word DOCX Generation (HTML Disguised as DOC)
- **Severity**: **P0 (Core Functional Integrity)**
- **File Reference**: `src/services/pdfEngine.ts:1414-1455` (`convertToWordDoc()`)
- **Evidence**:
  ```typescript
  let htmlContent = `<!DOCTYPE html><html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>...`;
  return new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
  ```
- **Reproduction Steps**:
  1. Open a PDF document and select "PDF to Word (DOCX)".
  2. Click "Download Word Document".
  3. Attempt to open the resulting file in Microsoft Word 2021 or Word 365.
  4. Word displays an error: *"The file format and extension of document.doc do not match. The file could be corrupted or unsafe."*
- **User Impact**: ErgonPDF advertises genuine DOCX conversion; users receive an obsolete HTML snippet that triggers security warnings in enterprise Office suites.
- **Recommended Fix**: Integrate `docx` (`docx.js`) library to construct authentic Microsoft Word OpenXML (`word/document.xml`) zip packages.
- **Regression Test**: Test that the exported Blob begins with PKZip signature `0x50 0x4B 0x03 0x04` and contains `word/document.xml`.

---

### Finding P0-04: Pseudo-Excel Spreadsheet Export (Naive Whitespace Split)
- **Severity**: **P0 (Core Functional Integrity)**
- **File Reference**: `src/services/pdfEngine.ts:1276-1291` (`extractTablesToCSV()`)
- **Evidence**:
  ```typescript
  const cells = line.split(/\s{2,}|\t/).map((c) => `"${c.replace(/"/g, '""').trim()}"`);
  ```
- **Reproduction Steps**:
  1. Convert a PDF invoice or financial statement containing a table where columns are separated by single spaces or variable kerning.
  2. Export table data.
  3. The output collapses entire multi-column rows into single CSV cells or returns an empty file.
- **User Impact**: Tool completely fails on real-world invoices, receipts, and spreadsheets.
- **Recommended Fix**: Implement spatial coordinate table clustering using PDF.js text item bounding boxes (`x`, `y`, `width`, `height`) and export authentic `.xlsx` binary workbooks via SheetJS.
- **Regression Test**: Test against a multi-column invoice PDF and assert correct cell coordinate mapping across columns.

---

### Finding P0-05: Fake ISO PDF/A Archival Compliance
- **Severity**: **P0 (Core Functional Integrity)**
- **File Reference**: `src/services/pdfEngine.ts:1463-1472` (`convertToPdfA()`)
- **Evidence**:
  ```typescript
  static async convertToPdfA(buffer: ArrayBuffer): Promise<Uint8Array> {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    doc.setTitle('Archival PDF/A Compliant Document');
    doc.setProducer('ErgonPDF PDF/A Archival Engine (ISO 19005-1)');
    return await doc.save({ useObjectStreams: true });
  }
  ```
- **Reproduction Steps**:
  1. Convert a document using "PDF to PDF/A".
  2. Run the exported PDF through an industry-standard validator (VeraPDF or Adobe Acrobat Preflight).
  3. Validation fails with dozens of errors: missing OutputIntent, missing embedded ICC profile, non-embedded fonts, missing `pdfaid:part` XMP schema.
- **User Impact**: Legal and archival filings requiring ISO 19005-1 compliance (e.g. court filings, European patent submissions) will be rejected.
- **Recommended Fix**: Implement genuine PDF/A profile compilation: embed standardized sRGB ICC color profile, enforce font embedding, and inject complete XMP metadata packets.
- **Regression Test**: Validate output files using automated VeraPDF CLI assertion in CI.

---

### Finding P0-06: Offline OCR Failure (Remote CDN Dependency)
- **Severity**: **P0 (Privacy Invariant & Reliability)**
- **File Reference**: `src/services/ocrService.ts:18`
- **Evidence**: `const worker = await createWorker(language);` defaults to downloading worker scripts and language models from `https://cdn.jsdelivr.net`.
- **Reproduction Steps**:
  1. Disconnect network or enable Airplane Mode.
  2. Open a scanned document and select "OCR & Make Searchable".
  3. The operation hangs indefinitely, then crashes with network resolution error.
- **User Impact**: ErgonPDF advertises 100% offline local processing; users on airplanes, remote job sites, or air-gapped secure facilities cannot use OCR.
- **Recommended Fix**: Bundle Tesseract worker, WebAssembly core, and `eng.traineddata.gz` locally in `public/tesseract/`. Configure `workerPath`, `corePath`, and `langPath` to local URLs.
- **Regression Test**: Run automated OCR test with external network requests blocked and assert successful text extraction.

---

## 2. P1 (High Severity Findings)

### Finding P1-01: Disconnected Metadata Scrubber
- **Severity**: **P1 (Broken Workflow)**
- **File Reference**: `src/components/UniversalWorkspace.tsx:134, 453-560`
- **Evidence**: `metadataFields` state exists and is editable in `MetadataTool`, but is never passed to any engine function in `handleExportPDF`.
- **User Impact**: User spends time scrubbing author, title, and keywords; exported PDF silently retains the original unscrubbed metadata.
- **Recommended Fix**: Wire `metadataFields` into `PDFEngineService.reorderAndTransformPages()` and update document info dictionary upon export.

### Finding P1-02: DNS Rebinding Vulnerability in `serve.cjs`
- **Severity**: **P1 (Security / Local Server Exposure)**
- **File Reference**: `installer/serve.cjs:86-105`
- **Evidence**: Missing `Host` header validation on local loopback server.
- **User Impact**: Malicious websites in other browser tabs can query `127.0.0.1:8074` via DNS rebinding.
- **Recommended Fix**: Reject HTTP requests if `Host` header is not `127.0.0.1` or `localhost`.

### Finding P1-03: Page Tree Indexing Crash in `reorder-pages`
- **Severity**: **P1 (Reliability / Crash)**
- **File Reference**: `src/services/pdfEngine.ts:512-540`
- **Evidence**: Throws `Cannot read properties of undefined (reading 'node')` when page dictionary references conflict during reordering.
- **User Impact**: Application crashes with an unhandled exception when users reorder pages in complex documents.
- **Recommended Fix**: Add a sanitization step that resolves indirect page object pointers before reordering.

### Finding P1-04: Destructive Repair Fallback
- **Severity**: **P1 (Data Loss)**
- **File Reference**: `src/services/pdfEngine.ts:1256-1267`
- **Evidence**: When `PDFDocument.load()` fails on damaged files, fallback rasterizes pages to JPEG at 1.5x scale, destroying all vector text, links, and forms.
- **User Impact**: Repaired PDF is degraded to a low-res image scan with unselectable text.
- **Recommended Fix**: Integrate QPDF WebAssembly (`qpdf-wasm`) for non-destructive XREF and object stream reconstruction.

---

## 3. P2 (Medium Severity Findings)

### Finding P2-01: Compression Size Inflation on Vector Documents
- **Severity**: **P2 (Performance / Polish)**
- **File Reference**: `src/services/pdfEngine.ts:368-418`
- **Evidence**: Running `compressDocument()` on small vector documents increases file size by +12.3%. Fallback in catch block does not verify if compressed bytes are smaller than original.
- **Recommended Fix**: Add safeguard: if `bestData.byteLength >= originalSize`, return original untouched `ArrayBuffer`.

### Finding P2-02: Missing Radio Groups and Dropdowns in Form Builder
- **Severity**: **P2 (Incomplete Feature)**
- **File Reference**: `src/services/pdfEngine.ts:1376-1405`
- **Evidence**: Registry advertises radio groups and dropdowns; code only implements text and checkboxes.
- **Recommended Fix**: Implement `form.createDropdown()` and `form.createRadioGroup()` in `addInteractiveFormFields()`.

### Finding P2-03: Unhandled User Password Decryption in `unlock-pdf`
- **Severity**: **P2 (Incomplete Feature)**
- **File Reference**: `src/components/workspace/UnlockTool.tsx:9-52`
- **Evidence**: Tool has no password input prompt. Only removes permissions from unencrypted documents; fails on password-locked PDFs.
- **Recommended Fix**: Add a password input dialog and pass credentials to `PDFDocument.load({ password })`.

---

## 4. P3 (Low Severity Findings)

### Finding P3-01: Orphaned Recent Files Storage Code
- **Severity**: **P3 (Code Hygiene)**
- **File Reference**: `src/services/storageService.ts:43-78`
- **Evidence**: `addRecentFile` and `getRecentFiles` are declared but never invoked by any UI component.
- **Recommended Fix**: Either implement recent files list in Header / Welcome Modal or remove dead code.
