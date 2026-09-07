# Changelog

All notable changes to the **ErgonPDF** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-09-07

### Added
- **Global React Error Boundary**: Added [`src/components/ErrorBoundary.tsx`](src/components/ErrorBoundary.tsx) with local data-privacy assurance, diagnostic stack viewer, and application reload/reset controls.
- **Container Health & Liveness Probes**: Added dedicated `/healthz` plaintext endpoint to [`nginx.conf`](nginx.conf) and [`vite.config.ts`](vite.config.ts) for Kubernetes/Docker container probes.
- **Security Headers**: Injected `Content-Security-Policy`, `Strict-Transport-Security` (HSTS), and `Permissions-Policy` headers in Nginx configuration.
- **Environment Template**: Added [`.env.example`](.env.example) and updated [`.gitignore`](.gitignore) to protect environment variable files.

### Changed
- **Unprivileged Container Execution**: Hardened [`Dockerfile`](Dockerfile) to run under non-root `USER nginx`.
- **Exact Version Pinning**: Pinned all production and development dependencies in [`package.json`](package.json) to exact semantic versions and added `tar` 7.5.22 override.
- **Expanded Test Suites**: Expanded [`scripts/smoke-test.js`](scripts/smoke-test.js) to 85 tests (including `/healthz`) and [`scripts/test-features.js`](scripts/test-features.js) to 20 engine tests (including overlay and underlay templates).

### Fixed
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
