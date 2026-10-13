# ErgonPDF Architecture & Developer Reference

This document provides a comprehensive technical overview of the ErgonPDF architecture, runtime execution pipeline, component hierarchy, service APIs, build strategy, and security model.

---

## 1. Technology Stack

ErgonPDF operates entirely inside modern client web browsers using WebAssembly and Web Workers. No document data is sent to external servers.

| Library / Tool | Version | Operational Purpose |
| :--- | :--- | :--- |
| React | 19.x | Component lifecycle, declarative UI state, and rendering pipeline |
| TypeScript | 5.9+ / 6.x | Strict type safety, interface definitions, and static verification |
| Vite | 8.x | High-speed ESM bundler, dev server, and production chunk optimization |
| pdf-lib | 1.17.x | Low-level PDF document creation, modification, byte stream assembly, and form field generation |
| pdfjs-dist | 5.4.x | PDF page rendering to HTML5 Canvas contexts, viewport calculations, and text layer extraction |
| tesseract.js | 7.x | Client-side Optical Character Recognition (OCR) running in sandboxed Web Workers |
| jszip | 3.10.x | Client-side ZIP archive assembly for batch image exports and multi-document bundles |
| @pdfsmaller/pdf-encrypt | 0.0.x | AES-256 PDF encryption and permission-flag imposition |
| lucide-react | 1.16.x | Monochromatic utilitarian UI iconography |
| oxlint | 1.x | High-performance static code analysis and linting |

---

## 2. Component Hierarchy

The visual and functional layout flows from `App.tsx` down into specialized modals or the interactive workspace:

```text
App.tsx (Root Controller & Modal Dispatcher)
├── ErrorBoundary (Global Crash Recovery & Diagnostic Trace)
├── Header (Navigation, Brand, Global Search Trigger, Theme & Settings Toggles)
├── Main Viewport
│   ├── [State: No Active Document]
│   │   ├── HeroDropzone (Drag-and-Drop Ingestion, Native File Dialog, Quick Actions)
│   │   └── ToolsGrid (Categorized 43-Tool Directory, Favorites, Filter Input)
│   └── [State: Active Document Loaded]
│       └── UniversalWorkspace (Document Studio & Editing Controller)
│           ├── ThumbnailSidebar (Native Drag-and-Drop Page Reordering, Duplication, Deletion)
│           ├── Viewport Canvas (PDF.js Canvas Renderer with Dynamic Zoom and Page Navigation)
│           └── Tool Action Panels (Modular Workspace Components)
│               ├── CompressTool
│               ├── OrganizeTool
│               ├── RotateTool
│               ├── RemovePagesTool
│               ├── ExtractPagesTool
│               ├── SplitTool
│               ├── FlattenTool
│               ├── RepairTool
│               ├── WebOptimizeTool
│               ├── ProtectTool
│               ├── UnlockTool
│               ├── RedactTool
│               ├── MetadataTool
│               ├── PasswordGeneratorTool
│               ├── SignTool
│               ├── WatermarkTool
│               ├── PageNumbersTool
│               ├── OverlayTool
│               ├── QRCodeTool
│               ├── CreateFormTool
│               ├── HalveTool
│               ├── NUpTool
│               ├── BookletTool
│               ├── AlternateMixTool
│               ├── CropTool
│               ├── ResizeTool
│               ├── RemoveBlankPagesTool
│               ├── ExtractImagesTool
│               ├── PdfToExcelTool
│               ├── PdfToImagesTool
│               ├── PdfToWordTool
│               ├── PdfToPdfATool
│               ├── ExtractTextTool
│               ├── OcrTool
│               ├── AnnotateTool
│               └── ViewPdfTool
├── Footer (Architectural Status, License, Navigation Links)
└── Dedicated Workflow Modals (Portaled Dialogs)
    ├── MergeModal (Multi-file Drag-and-Drop Merge Pipeline)
    ├── CompareModal (Side-by-Side Dual Document Inspection)
    ├── BatchModal (Batch Optimization, Watermarking, and Extraction Queue)
    ├── CameraScanModal (Webcam MediaStream Capture to Multi-Page PDF)
    ├── WebpageToPdfModal (HTML / Webpage Conversion Canvas Sandbox)
    ├── PasswordGenModal (Cryptographically Secure Passphrase Generator)
    ├── SignatureModal (Canvas Drawing, Typography, and Stamp Generator)
    ├── AiStudioModal (Local Semantic Insights, Chat Q&A, Flashcards, Raw Text)
    ├── DocsModal (In-App Architecture Documentation Viewer)
    └── SettingsModal (DPI Preferences, Storage Management, UI Theme)
```

---

## 3. Runtime Data Flow

The document processing lifecycle enforces end-to-end client-side isolation:

1. **Ingestion**:
   - The user selects or drags files into `HeroDropzone` or an input file picker.
   - Files are converted directly to native `ArrayBuffer` instances using `File.arrayBuffer()`.
2. **Inspection**:
   - `PDFEngineService.inspectDocument(buffer)` invokes PDF.js (`pdfjsLib.getDocument`).
   - The engine parses document catalog objects, extracts page counts, extracts document metadata (Title, Author, CreationDate), and renders initial low-resolution (0.3 scale) thumbnail previews to off-screen canvases.
   - The state is committed into a reactive `PDFDocumentState` object in `App.tsx`.
3. **Workspace Activation**:
   - `UniversalWorkspace` mounts with the document buffer and page descriptor array (`PDFPageInfo[]`).
   - In parallel, background text extraction is dispatched to `PDFEngineService.extractFullText(buffer)`, populating `fullDocumentText` and `fullPageTexts` for immediate AI Studio availability.
4. **Interactive Manipulation**:
   - Page reorganizations (drag-and-drop reorder, rotations, deletions) update the local page configuration matrix without mutating the underlying source buffer.
   - Canvas-based tools (Signature placement, Redaction boxes, Drawing strokes) store relative coordinate bounding boxes.
5. **Transformation & Export**:
   - The user clicks the export button corresponding to the active tool.
   - `handleExportPDF` aggregates the source `ArrayBuffer`, the modified page configurations, and tool-specific parameters.
   - The requested static method on `PDFEngineService` executes in memory via `pdf-lib` and/or PDF.js.
   - The resulting `Uint8Array` is packaged into a `Blob` (`application/pdf`, `image/png`, `application/zip`, or `application/msword`).
   - A temporal Object URL (`URL.createObjectURL(blob)`) is generated, clicked via an offscreen `<a>` element, and promptly revoked to avoid browser memory leaks.

---

## 4. Engine API Reference: PDFEngineService

All PDF manipulations are encapsulated in `PDFEngineService` (`src/services/pdfEngine.ts`). Every method is stateless and static.

| Method | Parameters | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `inspectDocument` | `data: ArrayBuffer` | `Promise<{ pageCount: number; pages: PDFPageInfo[]; metadata: PDFMetadata }>` | Loads document catalog, extracts metadata attributes, and generates thumbnail previews. |
| `renderPageToCanvas` | `data: ArrayBuffer, pageNumber: number, canvas: HTMLCanvasElement, scale?: number` | `Promise<void>` | Renders a specific 1-indexed PDF page onto an HTML5 canvas context at specified DPI scale. |
| `mergeDocuments` | `buffers: ArrayBuffer[]` | `Promise<Uint8Array>` | Concatenates multiple PDF documents in index order into a single unified output stream. |
| `reorderAndTransformPages` | `buffer: ArrayBuffer, pageConfigs: { originalIndex: number; rotation: number; deleted?: boolean }[]` | `Promise<Uint8Array>` | Reorders, rotates, and deletes pages according to a configuration descriptor array. |
| `splitDocument` | `buffer: ArrayBuffer, ranges: { name: string; startPage: number; endPage: number }[]` | `Promise<{ name: string; bytes: Uint8Array }[]>` | Splits a document into multiple discrete PDF byte arrays matching specified page index ranges. |
| `compressLossless` | `buffer: ArrayBuffer, removeMetadata?: boolean` | `Promise<Uint8Array>` | Re-serializes objects, defragments unreferenced streams, and optionally strips metadata tags. |
| `downsampleRasterPages` | `buffer: ArrayBuffer, settings: CompressionSettings` | `Promise<Uint8Array>` | Re-encodes pages to JPEG raster images at configurable DPI and quality factors. |
| `compressDocument` | `buffer: ArrayBuffer, settings: CompressionSettings` | `Promise<Uint8Array>` | Unified router directing between lossless compression and lossy canvas raster downsampling. |
| `addWatermark` | `buffer: ArrayBuffer, settings: WatermarkSettings` | `Promise<Uint8Array>` | Overlays semi-transparent text watermarks with custom rotation, font size, and color. |
| `addPageNumbers` | `buffer: ArrayBuffer, settings: PageNumberSettings` | `Promise<Uint8Array>` | Stamps dynamic page numbers (e.g., "Page X of Y") at top/bottom corner or center positions. |
| `applySignatures` | `buffer: ArrayBuffer, signatures: PlacedSignature[]` | `Promise<Uint8Array>` | Embeds and draws PNG stamp/signature data URLs at calculated coordinates across designated pages. |
| `applyRedactions` | `buffer: ArrayBuffer, redactions: RedactionBox[]` | `Promise<Uint8Array>` | Draws opaque black masking rectangles over specified rectangular page coordinates. |
| `convertToImages` | `buffer: ArrayBuffer, format?: 'png' \| 'jpeg' \| 'webp', scale?: number` | `Promise<{ pageNumber: number; dataUrl: string }[]>` | Renders all pages as image data URLs at high fidelity. |
| `imagesToPDF` | `images: { name: string; buffer: ArrayBuffer; type: string }[]` | `Promise<Uint8Array>` | Packages image buffers (PNG, JPEG, WebP) into standard single-page or multi-page PDF documents. |
| `extractFullText` | `buffer: ArrayBuffer` | `Promise<{ fullText: string; pageTexts: { pageNumber: number; text: string }[] }>` | Extracts unicode text content streams from all pages via PDF.js text layer mapping. |
| `halvePages` | `buffer: ArrayBuffer` | `Promise<Uint8Array>` | Splits landscape dual-page spreads vertically down the center into individual portrait pages. |
| `nUpImposition` | `buffer: ArrayBuffer, settings?: NUpSettings` | `Promise<Uint8Array>` | Imposes 2, 4, 9, or 16 source pages onto individual output sheets with optional borders. |
| `createBooklet` | `buffer: ArrayBuffer` | `Promise<Uint8Array>` | Generates 4-up 2-sided saddle-stitch booklet imposition sequences suitable for duplex booklet printing. |
| `cropDocument` | `buffer: ArrayBuffer, settings: CropSettings` | `Promise<Uint8Array>` | Adjusts `/CropBox` and `/MediaBox` boundaries to trim specified margins from all pages. |
| `resizeDocument` | `buffer: ArrayBuffer, settings: ResizeSettings` | `Promise<Uint8Array>` | Scales pages proportionally to standard paper formats (A4, Letter, Legal, A3, A5). |
| `alternateMixDocuments` | `docABuffer: ArrayBuffer, docBBuffer: ArrayBuffer, reverseB?: boolean` | `Promise<Uint8Array>` | Interleaves odd pages from document A with even pages from document B (duplex scanner mix). |
| `removeBlankPages` | `buffer: ArrayBuffer, threshold?: number` | `Promise<Uint8Array>` | Detects and discards pages whose raster luminance histogram contains greater than 99% white pixels. |
| `extractImagesToZip` | `buffer: ArrayBuffer` | `Promise<Blob>` | Extracts embedded XObject raster images and packages them into a compressed ZIP archive. |
| `overlayDocument` | `docBuffer: ArrayBuffer, templateBuffer: ArrayBuffer, isUnderlay?: boolean` | `Promise<Uint8Array>` | Merges background stationery letterheads or foreground forms onto a target document. |
| `createBlankPDF` | `pattern?: 'blank' \| 'lines' \| 'grid', pageCount?: number` | `Promise<Uint8Array>` | Creates empty vector documents with optional notebook rulings or graph paper grids. |
| `flattenAndRasterize` | `buffer: ArrayBuffer, dpi?: number` | `Promise<Uint8Array>` | Converts interactive AcroForms, annotations, and vector elements into a flattened raster document. |
| `repairDocument` | `buffer: ArrayBuffer` | `Promise<Uint8Array>` | Rebuilds corrupted PDF cross-reference tables and regenerates missing root trailer dictionaries. |
| `extractTablesToCSV` | `buffer: ArrayBuffer` | `Promise<string>` | Discovers grid line coordinates and text spatial alignments to generate structured CSV tables. |
| `webOptimize` | `buffer: ArrayBuffer` | `Promise<Uint8Array>` | Linearizes PDF structure by reorganizing font dictionaries and cross-reference streams for Fast Web View. |
| `stampQRCode` | `buffer: ArrayBuffer, pageNum: number, qrText: string, settings: QRCodeSettings` | `Promise<Uint8Array>` | Renders a two-dimensional QR matrix and embeds the resulting PNG image at target page coordinates. |
| `addInteractiveFormFields` | `buffer: ArrayBuffer, fields: FormFieldDef[]` | `Promise<Uint8Array>` | Embeds native interactive AcroForm text fields and check box controls into PDF dictionary structures. |
| `convertToWordDoc` | `buffer: ArrayBuffer, title?: string` | `Promise<Blob>` | Generates a valid Microsoft Word XML/HTML document package preserving paragraph structure. |
| `convertToPdfA` | `buffer: ArrayBuffer` | `Promise<Uint8Array>` | Embeds ISO 19005-1 (PDF/A-1b) metadata schemas, OutputIntents, and DeviceRGB color profiles. |
| `extractPageRanges` | `buffer: ArrayBuffer, pageNumbers: number[]` | `Promise<Uint8Array>` | Copies an arbitrary subset of pages into a new standalone document. |
| `encryptDocument` | `buffer: ArrayBuffer \| Uint8Array, userPassword: string, ownerPassword?: string` | `Promise<Uint8Array>` | Encrypts document streams using AES-256 standard encryption handlers and custom access permissions. |

---

## 5. Intelligence & Auxiliary Services

### 5.1 AIService (`src/services/aiService.ts`)
Executes fast, deterministic NLP analysis entirely within client JavaScript:
- `analyzeDocumentLocally(documentText, pageTexts)`: Computes statistical metrics (reading time, word count, grade level readability) and extracts structured insights.
- `classifyDocumentType(text)`: Heuristic Bayesian-style classification determining document genre (Invoice, Legal Contract, Research Paper, Resume, Technical Manual).
- `extractEntities(text)`: Regular-expression entity extraction for ISO dates, monetary amounts, email addresses, and phone numbers.
- `extractSummariesAndActions(text)`: Extracts the top five semantically dense sentences (minimum 40 characters) and actionable task items.
- `answerQuery(query, pageTexts)`: Scans page text arrays to retrieve relevant paragraph snippets matching user queries with citation page indices.
- `generateFlashcards(pageTexts)`: Formulates study flashcards based on key declarative statements identified in the text.

### 5.2 StorageService (`src/services/storageService.ts`)
Manages browser `localStorage` under isolated key namespaces:
- `getDefaultDpi()` / `setDefaultDpi(dpi)`: Configures default rasterization fidelity (default: 150 DPI).
- `getRecentFiles()` / `addRecentFile(file)` / `clearRecentFiles()`: Tracks lightweight file session records (names, sizes, timestamps).
- `getFavoriteTools()` / `toggleFavorite(toolId)`: Manages quick-access starred tool IDs.
- `getTheme()` / `setTheme(theme)`: Synchronizes system, light, or dark visual color palettes.

### 5.3 QRGenerator (`src/services/qrGenerator.ts`)
- `generateDataUrl(text, size)`: Generates an off-screen HTML5 canvas, encodes text into standard QR Reed-Solomon error correction matrices, and exports a base64 PNG data URL.
- `createQRMatrix(text)`: Computes the 2D boolean grid matrix representing dark and light QR modules.

---

## 6. Tool Registration System

All tools are configured declaratively in `src/config/toolsRegistry.ts`.
- `TOOLS_REGISTRY`: An array of `PDFTool` definitions comprising `id`, `name`, `description`, `iconName`, `category`, `intents`, and optional `badge`.
- `CATEGORY_LABELS`: Human-readable categorizations driving tool navigation pills (`organize`, `compress`, `security`, `convert`, `edit`, `create`, `ocr`, `ai`, `view`).

The registry drives:
1. `ToolsGrid.tsx`: Dynamic generation of grouped intent sections and interactive cards.
2. `CommandPalette.tsx`: Fuzzy searching across tool names, descriptions, and user intent keywords (e.g., typing "shrink" maps to `compress-pdf`).
3. Routing: Selection in either interface triggers standard dispatch handlers in `App.tsx`.

---

## 7. Build Strategy & Code-Splitting

ErgonPDF uses Vite and Rollup with a fine-grained chunking configuration in `vite.config.ts` to maintain sub-second initial paint times:

```typescript
rollupOptions: {
  output: {
    manualChunks(id: string) {
      if (id.includes('pdfjs-dist')) return 'vendor-pdfjs';
      if (id.includes('tesseract.js')) return 'vendor-tesseract';
      if (id.includes('pdf-lib') || id.includes('@pdfsmaller') || id.includes('jszip')) return 'vendor-pdflib';
      if (id.includes('react') || id.includes('lucide-react')) return 'vendor-react';
    }
  }
}
```

### Chunk Allocation Rationale:
- **`vendor-react`** (~210 kB): Core React 19 runtime, DOM reconciler, and Lucide icons. Loaded on initial landing.
- **`vendor-pdflib`** (~535 kB): PDF binary serializer and AcroForm generator. Loaded only upon file ingestion or blank document creation.
- **`vendor-pdfjs`** (~305 kB): PDF parsing and viewport rendering engine.
- **`vendor-tesseract`** (~17 kB): Dynamic OCR worker bootstrap. Only loaded when the OCR panel is opened.

---

## 8. Security Model & Deployment Architecture

ErgonPDF produces purely static assets that can be served from any web server or CDN (Nginx, Cloudflare Pages, S3/CloudFront).

### 8.1 Content Security Policy (CSP)
Defined in `nginx.conf` and verified across staging environments:
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob:; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' blob: https:; frame-ancestors 'self';" always;
```

- `'wasm-unsafe-eval'`: Required by WebAssembly runtimes inside `pdfjs-dist` and `tesseract.js` for memory compilation.
- `worker-src 'self' blob:`: Required for sandboxed background execution of PDF rendering and OCR recognition.
- `frame-ancestors 'self'`: Prevents clickjacking by prohibiting external domains from embedding ErgonPDF in iframes.
- `Permissions-Policy "camera=(self), microphone=(), geolocation=()"`: Restricts camera access strictly to local origin for document scanning; disables microphone and location hardware entirely.

---

## 9. Extending ErgonPDF: Guide to Adding a New Tool

To introduce a new document utility:

1. **Register the Tool**:
   Add an entry to `TOOLS_REGISTRY` in `src/config/toolsRegistry.ts` specifying the unique `id`, human-readable `name`, `category`, and semantic `intents`.
2. **Implement Engine Logic**:
   Add a static method to `PDFEngineService` in `src/services/pdfEngine.ts` taking raw `ArrayBuffer` inputs and returning output buffers or typed structures.
3. **Build the Tool Panel**:
   Create a focused React component in `src/components/workspace/<ToolName>Tool.tsx` and export it through `src/components/workspace/index.ts`.
4. **Wire the Workspace**:
   In `src/components/UniversalWorkspace.tsx`, map the `currentToolTab === '<tool-id>'` case to render your new panel component and pass execution handlers to `handleExportPDF`.
5. **Add Automated Verification**:
   Add a test case in `scripts/test-features.js` to assert that the new method executes cleanly and generates valid PDF or binary output. Run `npm run test-features` to verify.
