# Evidence, Technical Artifacts & Endpoint Index

## Overview
This index compiles all raw empirical evidence, network traces, source code references, scraped DOM selectors, endpoint schemas, and benchmark measurements gathered during the competitor reverse-engineering investigation of **PDF24**, **iLovePDF**, and **ErgonPDF**.

---

## 1. Competitor URL & Target Directory

| Target Entity | Canonical Web Address | Scraped / Inspected Artifact Path | Primary Technology |
| :--- | :--- | :--- | :--- |
| **PDF24 Tools** | `https://tools.pdf24.org/en/` | `scratch/pdf24_all_tools.html` | PHP, Ghostscript, QPDF, Tesseract, Geek Software (Germany). |
| **PDF24 All Tools** | `https://tools.pdf24.org/en/all-tools` | `scratch/pdf24_parsed.json` | 124 distinct tools; categorized cards with `data-tool` and `data-tags`. |
| **iLovePDF** | `https://www.ilovepdf.com/` | `scratch/ilovepdf_home.html` | Vue.js, Node.js, AWS S3, Redis, Solid Documents SDK. |
| **iLovePDF Pricing** | `https://www.ilovepdf.com/pricing` | `scratch/ilove_parsed_pricing.json` | 139 tiered feature limits; 15MB Office/OCR free cap, $84/yr Pro. |
| **ErgonPDF Repo** | Local Git (`E:\Github\ErgonPDF`) | `src/config/toolsRegistry.ts` | React 19, TypeScript, `pdf-lib`, PDF.js, Vite, Node loopback. |

---

## 2. Live HTTP Endpoint & Script Evidence

### 2.1 PDF24 Ingestion & Worker Traces
- **Observed File Upload Formats**:
  ```html
  <a class="toolLink mergePdf" title="Combine several PDFs, images or Word files into one PDF" href="/en/merge-pdf" data-tool="mergePdf" data-tags="merge, combine, join, concatenate, assemble, connect, mergePdf">
      <div class="icon" data-lazy-bg-src="/static/img/pageIcons/svg/merge-pdf.svg?v=5ca75609"></div>
      <div class="label">Merge PDF</div>
  </a>
  ```
- **JavaScript Worker Allocation**:
  - Found in `pdf24_merge-pdf.html`:
    - `workerServer`: Ingress routing to backend processing nodes.
    - `dropzone.getServerFiles()`: Ephemeral file manifest tracker.
    - `srcPage.data('serverFile')`: Server-side file descriptor binding.
- **Privacy & Hosting Statements**:
  - *"Security is important at PDF24. SSL secure."*
  - *"Servers are located in Germany."*
  - *"Your files and results will be deleted from the PDF24 server within 1 hour."*

### 2.2 iLovePDF Task Routing & Tier Interception
- **Observed Task Allocation**:
  - Found in `ilove_compress_pdf.html` and `ilove_pdf_to_word.html`:
    - Variable `taskId = '...'`: 32-character hexadecimal token.
    - Variable `server = 'v4.ilovepdf.com'`: Dedicated load-balanced processing node.
- **Client Tier Gate Extraction (`scratch/ilove_parsed_pricing.json`)**:
  - PDF to Word / Excel / PPT file size limit: **15 MB** (Free) vs **4 GB** (Premium).
  - Batch processing limit: **1 file** (Free) vs **10 files** (Premium) for Office/OCR tasks.
  - OCR PDF: Free tier restricted to basic text; Advanced OCR locked behind paywall.
  - Smart Split / Smart Redaction: Hard ceiling of **200 pages** per task.
  - AI Credits: **67 pages/month** quota on Advanced AI translation/summarization.
- **Third-Party Telemetry Beacons**:
  - `www.google-analytics.com/analytics.js`
  - `www.googletagmanager.com/gtm.js`
  - `static.hotjar.com/c/hotjar-*.js` (Session video recording and heatmaps)
  - `stats.g.doubleclick.net` (Ad tracking)

---

## 3. ErgonPDF Source Code Inspection Traces

### 3.1 Trace A: Redaction Security Flaw
- **File**: `E:\Github\ErgonPDF\src\services\pdfEngine.ts`
- **Lines**: 581–608
- **Evidence**:
  ```typescript
  redactions.forEach((box) => {
    if (box.pageNumber < 1 || box.pageNumber > pages.length) return;
    const page = pages[box.pageNumber - 1];
    const { width, height } = page.getSize();
    const boxWidth = (box.widthPercent / 100) * width;
    const boxHeight = (box.heightPercent / 100) * height;
    const boxX = (box.xPercent / 100) * width;
    const boxY = height - (box.yPercent / 100) * height - boxHeight;

    page.drawRectangle({
      x: boxX,
      y: boxY,
      width: boxWidth,
      height: boxHeight,
      color: rgb(0, 0, 0),
    });
  });
  return await doc.save();
  ```
- **Finding**: Draws a black box over the coordinate. Does not purge the underlying text content stream.

### 3.2 Trace B: Pseudo-Word DOCX Generation
- **File**: `E:\Github\ErgonPDF\src\services\pdfEngine.ts`
- **Lines**: 1423–1454
- **Evidence**:
  ```typescript
  let htmlContent = `<!DOCTYPE html>
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  ...
  return new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
  ```
- **Finding**: Raw HTML string masquerading as Microsoft Word document.

### 3.3 Trace C: Fake Webpage Ingestion
- **File**: `E:\Github\ErgonPDF\src\components\WebpageToPdfModal.tsx`
- **Lines**: 59–80
- **Evidence**:
  ```typescript
  if (activeTab === 'url') {
    renderHtml = `<!DOCTYPE html>
    <html>...
    <div class="header">
      <h1 style="color: #0f172a; margin: 0;">Captured Webpage Snapshot</h1>
      <div class="url">Source: ${urlInput}</div>
      <div class="url">Captured Date: ${new Date().toLocaleDateString()}</div>
    </div>
    <p style="font-size: 14px; line-height: 1.6; color: #334155;">
      Offline snapshot of <strong>${urlInput}</strong> generated securely inside ErgonPDF.
    </p>
    </body></html>`;
  }
  ```
- **Finding**: Emits static dummy template; never fetches the target URL.

### 3.4 Trace D: Disconnected Metadata Scrubber
- **File**: `E:\Github\ErgonPDF\src\components\UniversalWorkspace.tsx`
- **Lines**: 134, 453–560
- **Evidence**:
  `metadataFields` is managed in React state, but inside `handleExportPDF()`, `metadataFields` is never passed to any engine function or saved to `finalBytes`.

---

## 4. Controlled Benchmark Measurements

Measurements conducted on `sample_contract.pdf` (Input: 2,251 bytes, 2 pages) via Node.js runtime:

| Benchmark Operation | Measured Duration (ms) | Input Size (bytes) | Output Size (bytes) | Delta (%) | Status | Observed Anomaly / Finding |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Merge PDF** | 57.2 ms | 2,251 B | 1,348 B | -40.1% | PASS | Clean in-memory merge. |
| **Split PDF** | 16.4 ms | 2,251 B | 987 B | -56.2% | PASS | Clean single-page extraction. |
| **Compress PDF** | 448.1 ms | 2,251 B | 2,528 B | **+12.3%** | PASS | **Size increased** on small vector file due to uncompressed font stream re-saving. |
| **PDF to Word** | 29.5 ms | 2,251 B | 769 B | -65.8% | PASS | Warning: `FormatError: Page dictionary kid reference points to wrong type of object.`; outputs HTML. |
| **PDF to Excel** | 12.1 ms | 2,251 B | 10 B | -99.6% | PASS | Failed to detect table structure; outputs 10 bytes (`# Page 1\n\n# Page 2\n\n`). |
| **Images to PDF** | N/A | 2,251 B | 0 B | N/A | **FAIL** | Threw `undefined` in headless Node environment missing browser DOM canvas globals. |
| **Watermark** | 47.3 ms | 2,251 B | 3,006 B | +33.5% | PASS | Clean text stamp. |
| **Page Numbers** | 46.1 ms | 2,251 B | 2,934 B | +30.3% | PASS | Clean header/footer stamp. |
| **Protect PDF** | 168.0 ms | 2,251 B | 4,327 B | +92.2% | PASS | Authentic AES-256 encryption. |
| **Unlock PDF** | 10.2 ms | 2,251 B | 987 B | -56.2% | PASS | Only handles unencrypted files; fails on password-locked documents. |
| **Redact PDF** | 17.5 ms | 2,251 B | 2,861 B | +27.1% | PASS | Blackout rectangle overlay; underlying text 100% extractable. |
| **Organize PDF** | N/A | 2,251 B | 0 B | N/A | **FAIL** | Threw `Cannot read properties of undefined (reading 'node')` on page tree reordering. |
| **Extract Text** | 9.4 ms | 2,251 B | 14 B | N/A | PASS | Clean plain text string extraction. |
| **Repair PDF** | 242.0 ms | 2,251 B | 2,528 B | +12.3% | PASS | Clean load; fallback to raster scan untested on corrupt file. |
| **PDF to PDF/A** | 4.2 ms | 2,251 B | 2,588 B | +15.0% | PASS | Title/Producer tag only; zero ISO 19005-1 compliance. |
| **Web Optimize** | 4.1 ms | 2,251 B | 2,528 B | +12.3% | PASS | Standard save; lacks ISO 32000 linearization hint streams. |

---

## 5. REA Reverse-Engineering Skill Logs & Tool Outputs
- `rea analyze-javascript-application`: Verified client-side static reconstruction capabilities.
- `rea capture-browser-scenario`: Playwright-backed headless browser scenario runner.
- `rea analyze-web-bundle`: Static bundle and source-map inspector.
- All scratch scripts and raw scraped pages are archived under:
  `C:\Users\sivak\.gemini\antigravity\brain\ff43335d-6790-45d7-9e6e-8699aaca9176\scratch\`
