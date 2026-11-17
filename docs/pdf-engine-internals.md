# PDF Engine Architecture & Internals

ErgonPDF achieves its privacy and speed advantages through a dual-engine architecture combined with WebAssembly and WebCrypto primitives.

This document details the internal design of `PDFEngineService`, `AIService`, and `OCRService`.

---

## 1. Dual PDF Engine Model: `pdf-lib` + `pdfjs-dist`

PDF processing involves two fundamentally different workloads: **document manipulation** (modifying structure, streams, pages) and **document rendering** (rasterizing vector paths, parsing fonts, rasterizing to HTML5 canvas). 

ErgonPDF segregates these roles into specialized engines:

```
+─────────────────────────────────────────────────────────────+
│                       ErgonPDF UI                           │
+──────────────────────────────┬──────────────────────────────+
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
     [pdf-lib Core Engine]           [pdfjs-dist View Engine]
     - Structural mutation           - Canvas rasterization
     - Merge, Split, Reorder         - Page thumbnail rendering
     - N-up imposition               - Vector text layer extraction
     - Watermarking & Bates          - Font fallback synthesis
     - AES-256 WebCrypto lock        - PDF/A profile validation
               │                               │
               └───────────────┬───────────────┘
                               ▼
               [In-Memory ArrayBuffer Output]
               (Zero disk spill, zero network)
```

### Why Not Use a Single Library?
- `pdfjs-dist` (Mozilla's PDF.js) is the industry standard for faithful document rendering and text layer geometry extraction, but it has no native capabilities for modifying or writing PDF binary streams.
- `pdf-lib` is an exceptional, zero-dependency pure JavaScript library for binary manipulation, object tree traversal, and low-level stream creation, but it lacks a canvas renderer.
- By binding them cooperatively in `src/services/pdfEngine.ts`, ErgonPDF achieves both pixel-accurate rendering and lossless structural document generation.

---

## 2. Advanced Imposition Algorithms

### 2.1 2-Up Imposition (`nUpImposition`)
To combine multiple pages onto a single sheet:
1. Calculates target canvas aspect ratios based on page dimensions.
2. Scales each page using affine transform matrices:
   $$\begin{bmatrix} x' \\ y' \end{bmatrix} = \begin{bmatrix} s & 0 \\ 0 & s \end{bmatrix} \begin{bmatrix} x \\ y \end{bmatrix} + \begin{bmatrix} t_x \\ t_y \end{bmatrix}$$
3. Embeds source pages as XObjects onto the consolidated destination page.

### 2.2 Saddle-Stitch Booklet Imposition (`createBooklet`)
For multi-page signature printing:
1. Pads input page count to a multiple of 4 with blank pages.
2. Orders pages in standard booklet signature sequences ($4n, 1, 2, 4n-1, 4n-2, 3 \dots$).
3. Renders left and right halves onto landscape sheets ready for double-sided folding.

---

## 3. Irreversible Redaction Architecture

Traditional PDF editors frequently create dangerous "pseudo-redactions" by drawing a black rectangle over sensitive text, leaving underlying text tokens extractable via copy-paste.

ErgonPDF enforces **true irreversible redactions**:
1. Locates text coordinates via `pdfjs-dist` text content streams.
2. Identifies all PDF content streams intersecting the designated bounding box.
3. Overwrites and excises text operators (`Tj`, `TJ`, `Do`) from the object stream.
4. Draws opaque blackout vector rectangles over the area.
5. Emits a defragmented PDF where the underlying text bytes no longer exist anywhere in the binary output.

---

## 4. Hardware-Accelerated AES-256 Encryption

Document encryption complies with **ISO 32000-2 Rev 6 (PDF 2.0)**:
- Uses browser native `crypto.subtle` (WebCrypto API) for PBKDF2 key derivation and AES-256-CBC/GCM cryptographic operations.
- Emits standard `/Encrypt` dictionaries with 256-bit keys.
- Requires no server-side OpenSSL binaries or external encryption services.

---

## 5. Offline Heuristic Document Intelligence

ErgonPDF includes an in-memory document intelligence engine (`src/services/aiService.ts`):
- **Classification:** Heuristic keyword weighting and document structure analysis to classify contracts, financial statements, medical records, and technical specifications.
- **Entity Extraction:** Deterministic regex parsing for currency amounts, dates, email addresses, and key clauses.
- **Semantic Q&A:** In-memory vector-less inverted index providing grounded answers with exact page citations.
- **100% Offline:** Does not call OpenAI, Anthropic, or any remote LLM endpoint.
