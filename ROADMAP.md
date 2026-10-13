# ErgonPDF Engineering Roadmap

This document outlines the architectural and product roadmap for ErgonPDF. Horizons represent operational readiness and planned technical investment across near-term stabilization, medium-term capabilities, and long-term research initiatives.

---

## Strategic Principles

1. **Zero-Server Ingestion**: All document manipulation, cryptographic hashing, and rendering must execute strictly within the client runtime (browser WebAssembly and Web Workers).
2. **Deterministic Processing**: Document transformations must yield repeatable, ISO-compliant output adhering strictly to PDF specifications (ISO 32000-1 and PDF/A ISO 19005).
3. **Hardware-Efficient Execution**: Memory management must explicitly clean object URLs, revoke canvas contexts, and prevent garbage collection pressure during large-file pagination.
4. **Accessible and Standardized**: The user interface must comply with WCAG 2.1 AA standards and support full keyboard navigation.

---

## Horizon 1: Core Modularization and Usability (v1.2.x - v1.3.x)

Focus: Refactoring monolithic modules into composable components, finalizing client settings persistence, hardening keyboard accessibility, and improving text extraction pipelines.

| Feature | Description | Complexity | Status |
| :--- | :--- | :--- | :--- |
| Workspace Tool Decomposition | Split 3,000+ line monolithic workspace into isolated tool panels under `src/components/workspace/` with typed property interfaces. | High | Completed |
| Native Drag-and-Drop Reordering | Implement HTML5 drag-and-drop page reordering in the thumbnail sidebar with real-time positional updates. | Medium | Completed |
| AI Extraction Pipeline Wiring | Connect AI Studio directly to `PDFEngineService.extractFullText()` for real document semantic analysis and raw text inspection. | Medium | Completed |
| Settings DPI Persistence | Persist user rendering DPI configurations to `localStorage` via `StorageService` and apply dynamically to export pipelines. | Low | Completed |
| Universal Tool Grid Routing | Route all 43 registered tools (including blank PDF creation, webcam scanner, URL converter, and image converters) through direct actions. | Medium | Completed |
| WCAG 2.1 AA Accessibility | Implement ARIA roles, live regions, combobox semantics, focus-visible outlines, and screen-reader utility classes. | Medium | Completed |
| Automated Engine Integrity Suite | Expand `scripts/test-features.js` to assert structural validity and byte integrity across all static engine methods. | Medium | Completed |

---

## Horizon 2: Advanced Document Intelligence and Vector Annotation (v1.4.x - v1.6.x)

Focus: True vector-level annotations, client-side cryptographic certificate generation, multi-language OCR models, and in-viewer search.

| Feature | Description | Complexity | Status |
| :--- | :--- | :--- | :--- |
| In-Viewer Text Search & Highlight | Real-time full-text search with regex support across rendered canvas viewports using PDF.js text layer mapping. | High | Planned |
| Native PDF Vector Annotations | Replace full-page raster composite annotations with standard PDF annotation dictionaries (`/Highlight`, `/Underline`, `/Square`, `/Text`). | High | Planned |
| Multi-Language Tesseract OCR | Expand OCR worker to dynamically load language packs (German, French, Spanish, Japanese, Simplified Chinese) with cache quotas. | Medium | Planned |
| WebCrypto Digital Signatures | Self-sovereign PKI signing using browser WebCrypto API to generate X.509 certificates and embed standard cryptographic signature dictionaries. | High | Planned |
| Graphic Watermark Insertion | Support vector SVG and raster PNG/JPEG watermark overlays with adjustable opacity, rotation, and tile configurations. | Medium | Planned |
| Custom Imposition and Dimensions | Allow arbitrary millimeter and point dimensions for crop, resize, and booklet impositions beyond standard DIN/ANSI presets. | Medium | Planned |
| Automated Form Field Generation | Heuristic detection of underlined lines and rectangular boxes to automatically propose interactive AcroForm fields. | High | Planned |

---

## Horizon 3: Platform Extensibility and High-Performance WASM (v2.0+)

Focus: Native offline PWA operation, compiled Ghostscript integration, collaborative workflows, and plugin architecture.

| Feature | Description | Complexity | Status |
| :--- | :--- | :--- | :--- |
| WebAssembly Ghostscript Engine | Compile modern Ghostscript or MuPDF to WebAssembly via Emscripten for advanced font subsetting and PostScript-to-PDF translation. | Very High | Research |
| Offline Progressive Web Application | Service Worker caching strategy for 100% offline document processing without network connectivity. | Medium | Planned |
| Local P2P Document Collaboration | WebRTC data-channel synchronization for real-time multi-user document review and comment tracking without central server storage. | High | Research |
| Third-Party Tool Extension API | Pluggable tool registry allowing developers to write sandboxed Web Worker modules with standardized input/output interfaces. | High | Planned |
| Mobile-First Touch Interface | Dedicated touch gesture handling (pinch-to-zoom, swipe-to-reorder) optimized for tablet and mobile viewports. | Medium | Planned |
| Differential Redaction Engine | Deep syntactic content stream parsing to remove underlying text and vector paths beneath black-box redactions. | High | Research |

---

## Feedback and RFC Process

Proposals for new features or architectural modifications should be submitted as an Issue or Discussion using the standard Request for Comments (RFC) template on GitHub. All submissions must demonstrate compliance with the project's zero-server-upload privacy contract.
