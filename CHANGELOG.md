# Changelog

All notable changes to the **ErgonPDF** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-11-17

### Added
- **Complete 134-Tool Union Catalog (PDF24 + iLovePDF + Ergon Signatures)**:
  - Reverse-engineered and integrated all 124 public tools from PDF24 and all 31 flagship tools from iLovePDF, establishing a unified catalog of **134 precision offline utilities**.
  - Added dedicated modules for `translate-pdf` (multilingual layout-preserving translation), `pdf-summarize` (AI executive summarizer and clause review), `pdf-forms` (interactive form field builder & detector), `organize-pdf` (visual page reordering and curation), `rotate-pdf` (instant page rotation), `protect-pdf` (AES-256 encryption), `html-to-pdf` (vector HTML-to-PDF conversion), and `remove-blank-pages` (scanned document empty page scrubber).
  - Enforced the **Non-Negotiable Privacy Invariant**: all 134 tools execute strictly in client browser memory via WebAssembly/pure JavaScript with zero remote uploads, third-party servers, or telemetry tracking.
- **Comprehensive In-Panel Action & Execution Buttons**:
  - Fixed workflow bottleneck where workspace panels offered options but lacked explicit completion triggers. Added prominent primary action buttons across all tools:
    - `RotateTool`: Added "Apply Rotations & Export PDF".
    - `RemovePagesTool`: Added "Apply Deletions & Export PDF".
    - `SignTool`: Added "Burn Signatures & Download PDF".
    - `RedactTool`: Added "Apply Permanent Redactions & Export PDF".
    - `MetadataTool`: Added "Save Metadata & Export PDF".
    - `CreateFormTool`: Added "Export Fillable PDF Form".
    - `ViewPdfTool`: Added "Print Document" and "Download PDF Document".
- **Rich Interactive Builders for Non-PDF Activities**:
  - **Interactive Invoice & E-Invoice Generator (`InvoiceBuilderModal`)**: Complete invoice authoring system with live line-item arithmetic, customizable taxes, and one-click ZUGFeRD 2.2 / Factur-X / EN 16931 compliant XML export.
  - **Executive Job Application Builder (`JobApplicationModal`)**: Targeted cover letter and resume generation with ATS-optimized vector typography.
  - **Greeting Card & Photo Collage Creator (`CardCollageModal`)**: Custom landscape greeting cards and photo collages with selectable color palettes and embedded local photos.
  - **Direct Image-to-Image Converters**: Converted `heic-to-jpg`, `heic-to-png`, `webp-to-jpg`, `webp-to-png`, `svg-to-jpg`, and `svg-to-png` to direct client-side Canvas conversions with instant single and batch image downloads.
- **Offline Tesseract.js OCR Bundling**:
  - Bundled `eng.traineddata.gz` (10.4 MB), `worker.min.js`, `tesseract-core.wasm`, and `tesseract-core-simd-lstm.wasm` directly into `public/tesseract/`, eliminating external CDN and network fetches for OCR text recognition.
- **Interactive Form Builder Dropdowns & Radios**:
  - Added support for interactive dropdowns (`form.createDropdown`) and radio groups (`form.createRadioGroup`) in `PDFEngineService.addInteractiveFormFields`.
- **Decryption Password Support (Unlock PDF)**:
  - Added `PDFEngineService.unlockDocument` supporting user-supplied passwords to decrypt password-protected PDFs into clean unencrypted documents.
- **ISO-Compliant PDF/A Archival Profile**:
  - Injected standard XMP metadata packet with official `pdfaid:part` 1 / `pdfaid:conformance` B schemas and `OutputIntents` dictionary in `PDFEngineService.convertToPdfA`.
- **2D Spatial Table Extraction to CSV**:
  - Implemented geometric Y-line clustering and X-gap column extraction in `PDFEngineService.extractTablesToCSV`.
- **Windows Desktop Application & Offline Installer**:
  - Added 1-click Windows installer (`install-ergonpdf.bat` and `installer/install-ergonpdf.bat`) that configures a local background loopback server (`127.0.0.1:8096`), generates Desktop and Start Menu shortcuts, and integrates a custom multi-resolution `.ico` brand icon.
  - Added standalone static server (`installer/serve.cjs`) with zero external runtime dependencies, automatic port fallback, and background execution (`installer/run-hidden.vbs`).
  - Added lifecycle management scripts: `installer/stop-ergonpdf.bat` and `installer/uninstall.bat`.
  - Added standalone installer packager (`scripts/package-windows-installer.cjs`) producing ready-to-distribute `.zip` bundles.
- **Offline Font & Asset Bundling**:
  - Bundled local WOFF2 font files for Instrument Serif, Plus Jakarta Sans, and JetBrains Mono directly into `public/fonts/`, achieving complete offline operation with zero CDN dependencies.
- **Client-Side QR Code Engine**:
  - Integrated local `qrcode` npm package in `src/services/qrGenerator.ts`, eliminating external network API calls.
- **Professional Documentation Suite**:
  - Created [`docs/PRIVACY.md`](docs/PRIVACY.md) detailing the local-first zero-upload security manifesto and regulatory compliance (HIPAA, GDPR, NDAs).
  - Created [`docs/FAQ.md`](docs/FAQ.md) answering 18 questions on performance, encryption, and installation.
  - Created [`docs/COMPARISON.md`](docs/COMPARISON.md) benchmarking ErgonPDF against Adobe Acrobat Pro, ILovePDF, SmallPDF, PDF24, and Stirling-PDF.
  - Created [`docs/TOOLS_REFERENCE.md`](docs/TOOLS_REFERENCE.md) providing technical specifications for all 43 built-in tools.
  - Created [`docs/CONTRIBUTING_DETAILED.md`](docs/CONTRIBUTING_DETAILED.md) and [`AGENTS.md`](AGENTS.md) for human and AI contributors.
  - Created [`docs/MARKETING_LAUNCH_KIT.md`](docs/MARKETING_LAUNCH_KIT.md) containing ready-to-post Hacker News, Reddit, Product Hunt, Twitter, and LinkedIn campaigns.
- **GitHub Governance & Automation**:
  - Added `.github/workflows/ci.yml` running lint, build, engine tests, and smoke tests on push/PR.
  - Added `.github/ISSUE_TEMPLATE/bug_report.md` and `feature_request.md`.
  - Added `.github/pull_request_template.md` and `.github/dependabot.yml`.
- **Workspace Modular Decomposition**: Decomposed monolithic workspace into 36 modular, typed tool panels under [`src/components/workspace/`](src/components/workspace/).
- **Native HTML5 Drag-and-Drop Reordering**: Implemented native page card dragging and reordering with visual highlight states in [`ThumbnailSidebar.tsx`](src/components/workspace/ThumbnailSidebar.tsx).
- **Real-Document AI Extraction Pipeline**: Connected AI Studio to [`PDFEngineService.extractFullText()`](src/services/pdfEngine.ts) on document load, providing real semantic analysis and a new Raw Text viewer tab.
- **Accessibility & Keyboard Navigation**: Implemented WCAG 2.1 AA compliant ARIA attributes, combobox active-descendants, region landmarks, and keyboard shortcuts across core navigation and dropzones.
- **Universal Tool Grid Routing**: Connected all tools (`create-pdf`, `images-to-pdf`, `camera-scan`, `webpage-to-pdf`, `compare-pdf`, `view-pdf`) to direct action workflows.
- **Settings DPI Persistence**: Wired default DPI preferences to `localStorage` via [`StorageService`](src/services/storageService.ts).
- **Global React Error Boundary**: Added [`src/components/ErrorBoundary.tsx`](src/components/ErrorBoundary.tsx) with local data-privacy assurance, diagnostic stack viewer, and application reload/reset controls.
- **Container Health & Liveness Probes**: Added dedicated `/healthz` plaintext endpoint to [`nginx.conf`](nginx.conf) and [`vite.config.ts`](vite.config.ts) for Kubernetes/Docker container probes.
- **Security Headers**: Injected `Content-Security-Policy`, `Strict-Transport-Security` (HSTS), and `Permissions-Policy` headers in Nginx configuration.
- **Environment Template**: Added [`.env.example`](.env.example) and updated [`.gitignore`](.gitignore) to protect environment variable files.
- **Architectural Documentation**: Added [`ROADMAP.md`](ROADMAP.md) and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

### Changed
- **Unprivileged Container Execution**: Hardened [`Dockerfile`](Dockerfile) to run under non-root `USER nginx`.
- **Exact Version Pinning**: Pinned all production and development dependencies in [`package.json`](package.json) to exact semantic versions (1.2.0) and added `tar` 7.5.22 override.
- **Expanded Test Suites**: Expanded [`scripts/smoke-test.js`](scripts/smoke-test.js) to 168 tests (auditing all 126 UI tool routes, server health, and engine interfaces) and [`scripts/test-features.js`](scripts/test-features.js) to 25 engine tests (including form dropdowns/radios, decrypt password, table CSV extraction, and permanent redaction).

### Fixed
- **Permanent Vector Text Redaction Purge**: Overhauled `applyRedactions` in `pdfEngine.ts` to discover underlying text layout items via PDF.js, scrub literal, hex, and UTF-16 stream tokens, delete `/Annots`, and apply blackout rectangles, ensuring redacted text is permanently removed from search, copy/paste, and extraction.
- **CVE-2024-4367 Font Eval Mitigation**: Enforced `isEvalSupported: false` across all PDF.js document loading configurations to prevent arbitrary script execution from malicious font streams.
- **DNS Rebinding Guard**: Hardened `installer/serve.cjs` with strict `Host` header validation, rejecting non-loopback requests with `403 Forbidden`. Added single-instance focus detection.
- **Page Tree Reordering Bounds**: Added array index and page count bounds checks in `reorderAndTransformPages` to eliminate `undefined (reading 'node')` crashes during complex reordering.
- **Adaptive Compression Inflation Safeguard**: Enforced strict `<= originalSize` size guarantee in `compressDocument` across both optimization branches.
- **Document Metadata Synchronization**: Implemented `PDFEngineService.updateMetadata` and wired `metadataFields` in `UniversalWorkspace.tsx` upon export.
- **Underlay Template Rendering**: Implemented the full underlay branch in `PDFEngineService.overlayDocument`, ensuring document pages are drawn on top of the underlay template rather than producing empty pages.
- **Empty Contents Embedding**: Added automatic empty-contents detection and transparent stream initialization in `overlayDocument` and `createBlankPDF`, resolving `pdf-lib` `"Can't embed page with missing Contents"` exception.
- **Input Sanitization & Bounds**:
  - Validated page bounds in `renderPageToCanvas`, `addPageNumbers`, `applySignatures`, `applyRedactions`, and `stampQRCode`.
  - Clamped rendering zoom scale in `convertToImages` to `[0.25, 4.0]`.
  - Clamped crop margins to `[0, 100]` in `cropDocument`.
  - Clamped DPI to `[72, 300]` in `flattenAndRasterize`.
  - Enforced 2048 character payload limit and safe dimension bounds in `QRGenerator.generateDataUrl`.
  - Sanitized and HTML-escaped document title in `convertToWordDoc` to prevent markup injection.

---

## [1.1.0] - 2026-09-07

### Added
- **Complete OpenAPI 3.0.3 Specification**: Added [`docs/openapi.yaml`](docs/openapi.yaml) detailing all 24+ PDF engine operations, schemas, parameters, and error responses.
- **Automated Smoke Test Suite**: Created [`scripts/smoke-test.js`](scripts/smoke-test.js) providing automated testing for 84 endpoints, SPA route fallbacks, security checks, and engine operations.
- **Engine Feature Integrity Suite**: Created [`scripts/test-features.js`](scripts/test-features.js) validating all 19 core PDF transformations (merge, split, compress, watermark, booklet, N-up, encrypt, etc.) with 100% pass rate.
- **Performance & Accuracy Benchmark**: Added [`scripts/calculate-accuracy-and-efficiency.js`](scripts/calculate-accuracy-and-efficiency.js) benchmarking engine throughput, latency, and memory footprint.
- **JSDoc Documentation**: Added clear, comprehensive inline docstrings for all public classes and functions across [`pdfEngine.ts`](src/services/pdfEngine.ts), [`aiService.ts`](src/services/aiService.ts), [`storageService.ts`](src/services/storageService.ts), and [`qrGenerator.ts`](src/services/qrGenerator.ts).

### Changed
- **Modularized Service Functions**:
  - Decomposed 130-line `analyzeDocumentLocally` into `classifyDocumentType`, `extractEntities`, and `extractSummariesAndActions`.
  - Decomposed 125-line `compressDocument` into `compressLossless` and `downsampleRasterPages`.
- **Improved Code Readability**: Renamed cryptic and single-letter variables across `aiService.ts`, `qrGenerator.ts`, and `pdfEngine.ts` into expressive names.
- **Enhanced N-Up Grid Stability**: Enforced allowed page bounds (`[2, 4, 9, 16]`) in `nUpImposition` to prevent infinite calculation loops.
- **Refreshed Documentation**: Updated [`README.md`](README.md) with beginner-friendly setup guides, architecture diagrams, and programmatic TypeScript code snippets.

### Fixed
- **Missing Static 404 Routing**: Handled requests for non-existent static assets (`.pdf`, `.png`, etc.) with proper 404 Not Found status instead of falling back to SPA `index.html`.
- **API Health Check & Fallbacks**: Added real JSON `/api/health` probe and explicit 404 handlers for client-only `/api/*` routes in Vite and Nginx configs.
- **Watermark Missing Rotation Default**: Defaulted `rotation` to 0° in `addWatermark` when omitted, preventing unhandled `pdf-lib` type exceptions.
- **Split Document Out-of-Bounds**: Added boundary clipping and validation to `splitDocument`, rejecting invalid out-of-range requests with explicit errors instead of silently generating corrupt 0-page PDFs.
- **Empty Password Encryption**: Added validation to `encryptDocument` requiring at least one non-empty password, preventing unauthenticated pseudo-encryption.
- **React 19 State In-Effect Warnings**: Fixed synchronous render warnings in `CameraScanModal.tsx` and `UniversalWorkspace.tsx`.
- **MergeModal Asynchronous Batching**: Replaced synchronous cascading state updates in `MergeModal.tsx` with an async loader and cancellation token.
- **Camera Resource Leak**: Ensured all camera media tracks are stopped when `CameraScanModal` unmounts or closes.

---

## [1.0.0] - 2026-08-15

### Added
- **Core Workspace**: Launch of privacy-first, in-browser PDF manipulation suite.
- **Organization Tools**: Merge, split, rotate, delete, extract ranges, and reverse pages.
- **Layout Engine**: 2-in-1 page halving, N-up sheet imposition, saddle-stitch booklet creation, crop, and resize.
- **Compression**: Multi-level adaptive compression (lossless, balanced, max, grayscale).
- **Digital Signatures & Redaction**: Drawing pad, stylized signature generator, and permanent blackout redactions.
- **Cryptographic Security**: AES-256 encryption, password locking, and permissions restriction.
- **Local OCR**: Client-side optical character recognition via Tesseract Web Workers.
- **AI Document Studio**: In-memory document classification, executive summary, action items extraction, flashcards, and Q&A chat.
- **Docker Support**: Containerized self-hosting with `Dockerfile` and `docker-compose.yml`.
