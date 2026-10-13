# ErgonPDF

**The Open-Source, Privacy-First Client-Side Document Workspace.**

ErgonPDF is a comprehensive document utility suite that processes, optimizes, secures, and analyzes PDF files entirely within the user's browser runtime. By executing document transformations via WebAssembly and Web Workers, ErgonPDF eliminates file uploads to remote servers, providing total data confidentiality and instant operational performance.

---

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![TypeScript: Strict](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Processing: 100% Local](https://img.shields.io/badge/Processing-100%25%20Local%20(WASM)-10b981?style=flat-square)](https://webassembly.org/)
[![Docker: Ready](https://img.shields.io/badge/Docker-Ready-2496ed?style=flat-square&logo=docker)](Dockerfile)
[![Engine Integrity: 100% Pass](https://img.shields.io/badge/Engine%20Tests-20%2F20%20Pass-brightgreen.svg?style=flat-square)](scripts/test-features.js)
[![Smoke Tests: 85 Endpoints](https://img.shields.io/badge/Smoke%20Tests-85%2F85%20Pass-brightgreen.svg?style=flat-square)](scripts/smoke-test.js)

---

## Table of Contents

- [Overview](#overview)
- [Privacy Guarantee](#privacy-guarantee)
- [Feature Directory](#feature-directory)
- [User & Deployment Guide](docs/HOW_TO_USE.md)
- [Quickstart](#quickstart)
- [Architecture](#architecture)
- [Usage Examples](#usage-examples)
- [API Documentation](#api-documentation)
- [Self-Hosting and Container Deployment](#self-hosting-and-container-deployment)
- [Verification and Testing](#verification-and-testing)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Traditional online PDF services require users to transmit sensitive legal contracts, tax records, medical charts, and financial statements to remote cloud infrastructure. This model introduces substantial data compliance risks, bandwidth bottlenecks, arbitrary file size caps, queue delays, and commercial subscription gating.

ErgonPDF takes a fundamentally different engineering approach:

- **100% Client-Side Execution**: Every document transformation, page split, rasterization, OCR recognition pass, and cryptographic hash is computed directly in local machine memory using WebAssembly, Web Workers, and HTML5 Canvas.
- **Hardware-Efficient Performance**: Operations execute with zero network transit overhead, providing near-instantaneous page manipulation and download delivery.
- **Offline Capable**: Once assets are cached by the browser, the application operates independently without an active internet connection.
- **Zero User Tracking**: No accounts, authentication walls, watermarked output, analytics trackers, or usage throttles.
- **Integrated Document Intelligence**: In-memory heuristic NLP classification, entity extraction, executive summaries, actionable item parsing, study flashcard generation, and citation-backed question answering.

---

## Privacy Guarantee

ErgonPDF guarantees complete data sovereignty:

1. **Zero Server Ingestion**: Document bytes never traverse external networks or cloud APIs. All buffers exist temporarily in browser memory and are reclaimed upon session termination.
2. **Zero Persistent Tracking**: No centralized databases, third-party analytics scripts, tracking beacons, or telemetry services exist in the code.
3. **Local Cryptographic Isolation**: File protection, user and owner passwords, and AES-256 encryption keys are derived and applied locally via standard WebCrypto primitives and WebAssembly cryptographic implementations.

---

## Feature Directory

ErgonPDF organizes 43 precision utilities across six operational intent groups:

| Workflow Category | Included Utilities | Processing Engine & Execution Mode |
| :--- | :--- | :--- |
| **Assemble & Arrange** | Merge PDFs, Split Page Ranges, Drag-and-Drop Page Reordering, Rotate (90°, 180°, 270°), Delete Pages, Duplicate Pages, Reverse Sequences | 100% In-Browser (pdf-lib) |
| **Imposition & Print** | 2-in-1 Page Halving, N-Up Sheet Imposition (2, 4, 9, 16 per page), Saddle-Stitch Booklet Assembly, Margin Crop, Dimension Standardization (A4, A3, Letter, Legal) | 100% In-Browser (pdf-lib) |
| **Compress & Optimize** | Lossless Optimization (stream defragmentation and metadata purging), Adaptive Raster Downsampling (Balanced 144 DPI, Compact 96 DPI, Grayscale), Linearized Fast Web View | 100% In-Browser (Canvas + pdf-lib) |
| **Sign, Annotate & Watermark** | Freehand Drawing Pad, Stylized Typographic Signature Generator, Transparent Stamp Overlay, Semi-Transparent Text Watermarks, Dynamic Header/Footer Page Numbering | 100% In-Browser (Canvas + pdf-lib) |
| **Security & Privacy** | AES-256 Encryption & Permission Restrictions, Metadata Scrubbing, Permanent Visual Blackout Redaction, Cryptographic Passphrase Generation | 100% In-Browser (@pdfsmaller/pdf-encrypt + WebCrypto) |
| **Convert & Extract** | High-Resolution Image Export (PNG, JPEG, WebP), Multi-Image to PDF Builder, Microsoft Word Export (`.doc`), Tabular Stream to Structured CSV, Vector Text Stream Dump | 100% In-Browser (PDF.js + JSZip) |
| **Intelligence & Capture** | Multi-Threaded Tesseract OCR, Webcam Document Capture, Sandboxed HTML/Webpage Converter, Heuristic NLP Summarization, Entity Parser, Interactive Q&A Citations | 100% In-Browser (Tesseract.js Worker + Heuristic NLP) |

---

## Quickstart

### Prerequisites
- **Node.js**: Version 18.0.0 or higher (Node 20 or 22 LTS recommended)
- **npm**: Version 9.0.0 or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/CodeSorcerer-007/ErgonPDF.git
   cd ErgonPDF
   ```

2. Install pinned dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. Compile for production:
   ```bash
   npm run build
   npm run preview
   ```
   The compiled distribution will be hosted locally at `http://localhost:4173`.

---

## Architecture

ErgonPDF employs a layered frontend architecture that strictly decouples UI state from binary transformation services.

```text
+---------------------------------------------------------------+
|                        Browser Runtime                        |
|                     React 19 + TypeScript                     |
+---------------------------------------------------------------+
                                |
        +-----------------------+-----------------------+
        |                                               |
        v                                               v
+-------------------------------+               +-------------------------------+
|      Universal Workspace      |               |        Command Palette        |
|  - Viewport & Canvas Layers   |               |  - Ctrl/Cmd + K Intent Parser |
|  - Modular Tool Action Panels |               |  - Global Action Dispatcher   |
|  - Drag-and-Drop Thumbnails   |               |  - Direct Tool Navigation     |
+-------------------------------+               +-------------------------------+
        |                                               |
        +-----------------------+-----------------------+
                                |
                                v
+---------------------------------------------------------------+
|                   Engine Service Abstraction                  |
|                                                               |
|  PDFEngineService (Static, Stateless Document Transformations)|
|  AIService        (In-Memory NLP & Entity Recognition)        |
|  OCRService       (Sandboxed Tesseract Web Worker Engine)     |
|  StorageService   (Namespaced Local Storage & DPI Preference) |
|  QRGenerator      (Two-Dimensional Matrix Rendering)          |
+---------------------------------------------------------------+
                                |
                                v
+---------------------------------------------------------------+
|                   Core Binary Libraries (WASM)                |
|                                                               |
|  • pdf-lib               : Structural Assembly & Mutation     |
|  • pdfjs-dist            : Canvas Rendering & Text Extraction |
|  • @pdfsmaller/pdf-encrypt: AES-256 Permissions Handler       |
|  • tesseract.js          : Optical Character Recognition      |
|  • jszip                 : Binary Archive Packaging           |
+---------------------------------------------------------------+
```

For detailed architecture diagrams, component trees, data flow lifecycles, and security headers, consult [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Usage Examples

### 1. Document Merging (UI Workflow)
1. Navigate to the application home screen.
2. Select **Merge PDF** from the directory or press `Ctrl + K` and enter `merge`.
3. Select or drop multiple PDF files into the modal dropzone.
4. Drag individual file cards to configure the desired output order.
5. Click **Merge PDFs** to instantly synthesize and download the combined document.

---

### 2. Programmatic Processing via `PDFEngineService` (TypeScript)
`PDFEngineService` exposes over 30 static methods that can be integrated into custom workflows:

```typescript
import { PDFEngineService } from './src/services/pdfEngine';

// Step A: Concatenate multiple document buffers
const mergedBytes: Uint8Array = await PDFEngineService.mergeDocuments([
  sourceBufferA,
  sourceBufferB,
]);

// Step B: Apply dynamic page numbers and watermarks
const numberedBytes: Uint8Array = await PDFEngineService.addPageNumbers(
  mergedBytes.buffer,
  {
    position: 'bottom-center',
    format: 'Page {n} of {total}',
    fontSize: 10,
    startFrom: 1,
  }
);

// Step C: Compress lossless with metadata removal
const compressedBytes: Uint8Array = await PDFEngineService.compressLossless(
  numberedBytes.buffer,
  true // Strip document metadata
);

// Step D: Apply AES-256 password protection
const protectedBytes: Uint8Array = await PDFEngineService.encryptDocument(
  compressedBytes,
  'UserPassphrase123!',
  'OwnerAdminPassphrase456!'
);
```

---

### 3. Client-Side OCR Extraction (TypeScript)
Perform Optical Character Recognition on image documents without transmitting data to external APIs:

```typescript
import { OCRService } from './src/services/ocrService';

const ocrResult = await OCRService.recognizeImage(
  scannedImageBlob,
  'eng',
  (status: string, progress: number) => {
    console.log(`OCR Progress: ${(progress * 100).toFixed(0)}% [${status}]`);
  }
);

console.log(`Extraction Confidence: ${ocrResult.confidence}%`);
console.log('Extracted Plaintext:', ocrResult.text);
```

---

### 4. Document Intelligence & Semantic Q&A (TypeScript)
```typescript
import { PDFEngineService } from './src/services/pdfEngine';
import { AIService } from './src/services/aiService';

// Extract unicode text stream from PDF
const { fullText, pageTexts } = await PDFEngineService.extractFullText(documentBuffer);

// Run local heuristic classification and entity parsing
const analysis = AIService.analyzeDocumentLocally(fullText, pageTexts);
console.log(`Document Genre: ${analysis.documentType}`);
console.log('Actionable Tasks:', analysis.actionItems);
console.log('Discovered Financial Entities:', analysis.entities.filter(e => e.type === 'amount'));

// Execute citation-backed question answering
const queryResult = AIService.answerQuery('What are the termination liabilities?', pageTexts);
console.log('Generated Response:', queryResult.answer);
console.log('Referenced Page Numbers:', queryResult.pageReferences);
```

---

## API Documentation

ErgonPDF maintains a complete OpenAPI 3.0.3 specification documenting all document processing operations, schemas, input bounds, and error models.

- **Specification File**: [docs/openapi.yaml](docs/openapi.yaml)
- **Supported Operations**:
  - `POST /pdf/inspect`: Extract metadata catalog, page counts, and dimension previews.
  - `POST /pdf/merge`: Concatenate arbitrary arrays of PDF streams.
  - `POST /pdf/split`: Partition documents into discrete page ranges.
  - `POST /pdf/compress`: Lossless object defragmentation and raster downsampling.
  - `POST /pdf/watermark`: Stamp rotated semi-transparent text banners.
  - `POST /pdf/page-numbers`: Inject sequential pagination headers or footers.
  - `POST /pdf/halve`: Bisect landscape dual-page spreads into portrait sheets.
  - `POST /pdf/nup`: Impose multi-page grids onto standard sheets.
  - `POST /pdf/booklet`: Saddle-stitch booklet signature generation.
  - `POST /pdf/crop`: Margin adjustments via `/MediaBox` and `/CropBox`.
  - `POST /pdf/resize`: Scale pages proportionally to standard dimensions.
  - `POST /pdf/alternate-mix`: Interleave duplex document streams.
  - `POST /pdf/encrypt`: Apply AES-256 standard encryption handlers.
  - `POST /pdf/repair`: Reconstruct corrupted cross-reference tables.
  - `POST /pdf/web-optimize`: Linearize streams for Fast Web View.
  - `POST /pdf/pdfa`: Embed ISO 19005-1 (PDF/A-1b) archival metadata profiles.
  - `POST /ocr/recognize`: Multi-threaded Web Worker OCR text extraction.
  - `POST /ai/analyze`: Local heuristic document classification and entity discovery.
  - `POST /ai/query`: Semantic document search with page citations.
  - `GET /health`: Operational readiness probe.

---

## Self-Hosting and Container Deployment

ErgonPDF can be self-hosted in any intranet, air-gapped laboratory, or containerized cloud environment. For complete deployment strategies (including Cloudflare Pages, Vercel, Netlify, and custom Nginx setups), consult the [User & Deployment Guide](docs/HOW_TO_USE.md).

### Using Docker Compose
```bash
docker compose up -d
```
The application will be accessible at `http://localhost:8080`.

### Using the Docker CLI
```bash
# Build production image
docker build -t ergonpdf:1.2.0 .

# Execute container under non-root unprivileged user
docker run -d -p 8080:80 --name ergonpdf ergonpdf:1.2.0
```

### Container Health Probes
- **Liveness Probe**: `GET http://localhost:8080/healthz` (returns `200 OK`)
- **Engine Status**: `GET http://localhost:8080/api/health` (returns JSON status payload)

---

## Verification and Testing

ErgonPDF enforces a multi-tiered verification pipeline to ensure mathematical precision and stream integrity across all document transformations.

```bash
# 1. Static lint analysis with zero warnings tolerance
npm run lint

# 2. Strict TypeScript compilation and Vite production bundling
npm run build

# 3. PDF Engine Feature Integrity Suite (20 end-to-end engine tests)
npm run test-features

# 4. HTTP Application Smoke Test Suite (85 endpoint assertions)
npm run smoke-test
```

### Automated Benchmark Verification
To measure execution throughput, memory stability, and transformation latency:
```bash
node scripts/calculate-accuracy-and-efficiency.js
```

---

## Contributing

We welcome contributions from developers, designers, and documentation authors. Please review [CONTRIBUTING.md](CONTRIBUTING.md) for development workflows, branch naming conventions, and pull request criteria. All participants are expected to adhere to our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

Security inquiries should follow the protocols outlined in [SECURITY.md](SECURITY.md).

---

## License

ErgonPDF is open-source software licensed under the [MIT License](LICENSE).
