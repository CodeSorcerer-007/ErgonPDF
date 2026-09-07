<p align="center">
  <img src="public/favicon.svg" alt="ErgonPDF Logo" width="80" height="80" />
</p>

<h1 align="center">ErgonPDF</h1>

<p align="center">
  <strong>The Open-Source, Privacy-First All-in-One PDF Workspace.</strong><br>
  <em>Organize, edit, compress, sign, convert, and understand documents with zero server uploads and lightning-fast local performance.</em>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quickstart">Quickstart</a> •
  <a href="#-usage-examples">Usage Examples</a> •
  <a href="#-api-documentation">API Docs</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-docker--self-hosting">Self-Hosting</a> •
  <a href="#-verification--testing">Testing</a> •
  <a href="CHANGELOG.md">Changelog</a> •
  <a href="LICENSE">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License: MIT" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Processing-100%25%20Local%20(WASM)-10b981?style=flat-square" alt="100% Local" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ed?style=flat-square&logo=docker" alt="Docker Ready" />
  <img src="https://img.shields.io/badge/Tests-84%20Smoke%20%7C%2019%20Engine-brightgreen.svg?style=flat-square" alt="Tests: 100% Pass" />
</p>

---

## 🌟 Overview

Most online PDF utilities require you to upload sensitive contracts, tax returns, medical charts, and financial statements to third-party cloud servers. They often impose restrictive file size limits, rate limits, countdown timers, and intrusive advertisements.

**ErgonPDF is built differently.**

ErgonPDF executes **100% in your web browser**. Your documents are never uploaded to any remote server. Every PDF mutation, page split, OCR scan, watermark, and cryptographic operation is computed in memory using WebAssembly, Web Workers, and HTML5 Canvas.

### Why Choose ErgonPDF?
- 🔒 **100% Client-Side Privacy**: Zero files or byte buffers ever leave your machine.
- ⚡ **Instant & Offline**: Operates without network connectivity once loaded in your browser cache.
- 🛡️ **Zero Tracking & No Accounts**: No sign-ups, subscriptions, watermarks on output, or paywalls.
- 🎨 **Modern Human-Centered Design**: Fluid Obsidian dark & Slate light themes, responsive layout, drag-and-drop workflow, and instant command palette (`Ctrl/Cmd + K`).
- 🧠 **Built-in AI & Document Intelligence**: Instant summaries, contract risk highlights, action item extraction, flashcard generator, and interactive Q&A citations.

---

## 🛠️ Features

| Category | Available Tools | Engine Processing |
| :--- | :--- | :--- |
| **Organize** | Merge PDFs, Split into Ranges, Visual Drag-and-Drop Page Reorder, Rotate (90°/180°/270°), Delete Pages, Duplicate, Reverse Pages | 100% Local (pdf-lib) |
| **Layout & Print** | 2-in-1 Page Halving, N-Up Multi-Page Imposition (2, 4, 9, 16 per sheet), Saddle-Stitch Booklet Creator, Crop Margins, Resize (A4, A3, Letter, Legal) | 100% Local (pdf-lib) |
| **Compression** | Lossless (stream defragmentation & metadata purge), Balanced (144 DPI), Max (96 DPI), Grayscale downsampler with automatic size safety fallback | 100% Local |
| **Sign & Fill** | Smooth digital signature drawing pad, stylized cursive font generator, PNG signature upload, interactive text boxes & checkboxes | 100% Local |
| **Security & Privacy** | AES-256 password encryption, permissions locking (prevent print/copy), metadata sanitizer, permanent blackout redaction | 100% Local (AES-256) |
| **Conversion** | PDF to high-res PNG / JPEG / WebP, Multi-Image photos to PDF builder, PDF to Microsoft Word (`.doc`), Tabular data to CSV | 100% Local |
| **Stamps & Numbers** | Diagonal/horizontal text watermarks (custom color, opacity, angle), formatted sequential page numbers (headers/footers), dynamic QR codes | 100% Local |
| **OCR & Scan** | In-browser Tesseract Web Worker OCR to extract searchable text from scanned images and PDFs without server leaks | 100% Local (WASM OCR) |
| **AI Studio** | Local heuristic document classifier (contracts, invoices, resumes, academic), executive summary, action items, flashcards, semantic QA with page citations | 100% In-Memory |

---

## 🚀 Quickstart

### Prerequisites
- **Node.js**: Version 18 or higher (Node 20 or 22 LTS recommended)
- **Package Manager**: `npm`, `pnpm`, or `yarn`

### 1. Clone the Repository
```bash
git clone https://github.com/CodeSorcerer-007/ErgonPDF.git
cd ErgonPDF
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
npm run preview
```
The production bundle is compiled into the `dist/` folder and served locally at `http://localhost:4173`.

---

## 🐳 Docker & Self-Hosting

You can run ErgonPDF as a self-contained web container on your home lab, internal enterprise intranet, or private VPS:

### Using Docker Compose (Recommended)
```bash
docker compose up -d
```
The workspace will immediately be accessible at `http://localhost:8080`.

### Using the Docker CLI
```bash
# Build Docker image
docker build -t ergonpdf:latest .

# Run container on port 8080
docker run -d -p 8080:80 --name ergonpdf ergonpdf:latest
```

---

## 💡 Usage Examples

### Example 1: Merge Multiple PDFs (UI)
1. Launch ErgonPDF in your browser.
2. Click **Merge PDF** on the homepage or press `Ctrl + K` and type `merge`.
3. Drag and drop your PDF files into the modal.
4. Drag files to adjust their order or remove unwanted documents.
5. Click **Merge PDFs** — your unified document downloads immediately.

---

### Example 2: Programmatic Usage with `PDFEngineService` (TypeScript)
You can directly import and use the underlying engine in your own frontend or Node applications:

```typescript
import { PDFEngineService } from './services/pdfEngine';

// 1. Merge two PDF ArrayBuffers
const mergedPdfBytes = await PDFEngineService.mergeDocuments([
  fileBufferA,
  fileBufferB,
]);

// 2. Compress a PDF with automatic size safeguard
const { data, originalSize, compressedSize, savingsPercent } = 
  await PDFEngineService.compressDocument(fileBuffer, {
    level: 'balanced',
    removeMetadata: true,
  });
console.log(`Saved ${savingsPercent}%: ${originalSize}B -> ${compressedSize}B`);

// 3. Encrypt a PDF with AES-256
const encryptedBytes = await PDFEngineService.encryptDocument(
  fileBuffer,
  'SecretPassword123!', // User password
  'AdminPassword456!'  // Owner permissions password
);

// 4. Add a Watermark
const watermarkedBytes = await PDFEngineService.addWatermark(fileBuffer, {
  text: 'CONFIDENTIAL',
  fontSize: 48,
  opacity: 0.3,
  rotation: 45,
  color: 'red',
  pages: 'all',
});

// 5. Impose 2 pages per sheet (N-Up printing)
const nUpBytes = await PDFEngineService.nUpImposition(fileBuffer, {
  pagesPerSheet: 2,
  orientation: 'auto',
  addBorder: true,
});
```

---

### Example 3: In-Browser Local OCR (TypeScript)
Extract searchable text from image scans without sending data to any external API:

```typescript
import { OCRService } from './services/ocrService';

const result = await OCRService.recognizeImage(
  imageBlobOrCanvas,
  'eng',
  (status, progress) => {
    console.log(`OCR Progress: ${(progress * 100).toFixed(0)}% (${status})`);
  }
);

console.log(`Recognized text (${result.confidence}% confidence):`);
console.log(result.text);
```

---

### Example 4: Document Intelligence & Semantic QA (TypeScript)
```typescript
import { AIService } from './services/aiService';

// Extract full text from PDF
const { text, pages } = await PDFEngineService.extractFullText(pdfBuffer);

// Analyze document type, extract amounts, dates, action items
const analysis = AIService.analyzeDocumentLocally(text);
console.log(`Document Type: ${analysis.type} (${analysis.confidence * 100}% confidence)`);
console.log('Action Items:', analysis.actionItems);
console.log('Financial Entities:', analysis.financialEntities);

// Query the document with page citations
const response = AIService.answerQuery('What are the payment terms?', pages);
console.log(response.answer);
console.log('Cited Pages:', response.pageReferences);
```

---

## 📖 API Documentation

ErgonPDF provides an OpenAPI 3.0.3 specification documenting all client engine operations and self-hosted microservice endpoints.

- **OpenAPI Specification**: [`docs/openapi.yaml`](docs/openapi.yaml)
- **Available Operations**:
  - `POST /pdf/inspect`: Extract metadata, page count, and page thumbnails.
  - `POST /pdf/merge`: Concatenate multiple PDFs into a unified file.
  - `POST /pdf/split`: Extract specified page ranges or individual pages.
  - `POST /pdf/compress`: Adaptive lossless or raster downsampling with size safeguard.
  - `POST /pdf/watermark`: Apply diagonal/horizontal text stamps.
  - `POST /pdf/page-numbers`: Stamp headers/footers (`Page 1 of n`, `- 1 -`).
  - `POST /pdf/halve`: Split 2-in-1 scanned spreads down the center.
  - `POST /pdf/nup`: Impose 2, 4, 9, or 16 pages onto single sheets.
  - `POST /pdf/booklet`: Saddle-stitch booklet imposition layout.
  - `POST /pdf/crop`: Non-destructive percentage-based page margin trimming.
  - `POST /pdf/resize`: Standardize to A4, A3, Letter, or Legal dimensions.
  - `POST /pdf/alternate-mix`: Interleave odd/even pages from duplex scans.
  - `POST /pdf/encrypt`: AES-256 password protection & permission locking.
  - `POST /pdf/repair`: Reconstruct corrupted cross-reference streams.
  - `POST /pdf/web-optimize`: Linearize streams for Fast Web View.
  - `POST /pdf/pdfa`: ISO 19005-1 compliant PDF/A-1b metadata stamping.
  - `POST /ocr/recognize`: In-browser Tesseract OCR text extraction.
  - `POST /ai/analyze`: Heuristic document classification and entity extraction.
  - `POST /ai/query`: Semantic QA with page citation snippets.
  - `GET /health`: Engine status and readiness probe.

---

## 🏗️ Architecture

```
                                +---------------------------+
                                |      Browser Client       |
                                |  (React 19 + TypeScript)  |
                                +---------------------------+
                                              |
                   +--------------------------+--------------------------+
                   |                                                     |
                   v                                                     v
      +-------------------------+                           +-------------------------+
      |   Universal Workspace   |                           |    Command Palette      |
      |   - Canvas Rendering    |                           |    - Cmd/Ctrl + K       |
      |   - Signature Placement |                           |    - Intent Search      |
      |   - Redaction Layers    |                           |    - Tool Navigation    |
      +-------------------------+                           +-------------------------+
                   |                                                     |
                   +--------------------------+--------------------------+
                                              |
                                              v
      +--------------------------------------------------------------------------------+
      |                         ErgonPDF Engine Layer (WASM/JS)                        |
      |                                                                                |
      |  • pdf-lib               : DOM parsing, page mutations, stamping, booklet      |
      |  • pdfjs-dist            : Canvas rasterization, viewport scaling, text layer  |
      |  • @pdfsmaller/pdf-encrypt: AES-256 cryptographic security & permissions       |
      |  • tesseract.js          : Multi-threaded Web Worker OCR                       |
      |  • jszip                 : Multi-file batch bundling and archive exports       |
      +--------------------------------------------------------------------------------+
                                              |
                                              v
                              +--------------------------------+
                              |      Zero Network Leakage      |
                              |  100% In-Memory RAM Execution  |
                              +--------------------------------+
```

---

## 🧪 Verification & Testing

ErgonPDF includes a comprehensive automated testing suite:

```bash
# 1. Run linter with zero warnings tolerance
npx oxlint --deny-warnings

# 2. Run TypeScript build verification
npm run build

# 3. Run PDF Engine Feature Integrity Suite (19 tests)
node scripts/test-features.js

# 4. Run Accuracy & Efficiency Benchmark
node scripts/calculate-accuracy-and-efficiency.js

# 5. Run Full Application Smoke Test Suite (84 endpoints and tests)
node scripts/smoke-test.js
```

### Test Suite Results
- **Engine Feature Suite**: 19/19 tests passed (100%)
- **Application Smoke Suite**: 84/84 tests passed (100%)
- **Accuracy Benchmark**: 100.0% precision, 50.81ms mean latency

---

## 🤝 Contributing

We welcome community contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for development practices, pull request workflows, and coding standards.

```bash
# 1. Fork and clone the repository
git clone https://github.com/CodeSorcerer-007/ErgonPDF.git

# 2. Create your feature branch
git checkout -b feature/awesome-feature

# 3. Commit your changes
git commit -m "feat: add awesome-feature"

# 4. Push to branch and open a Pull Request
git push origin feature/awesome-feature
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
