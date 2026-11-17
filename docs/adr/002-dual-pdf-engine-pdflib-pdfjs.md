# ADR 002: Dual-Engine Architecture: pdf-lib for Mutation, PDF.js for Rendering

**Status:** `ACCEPTED`  
**Date:** November 2026  
**Deciders:** ErgonPDF Core Architecture Team  

---

## Context

Manipulating PDF documents in the browser presents two fundamentally distinct engineering requirements:
1. **Low-Level Binary Object Mutation**: Constructing valid PDF dictionary trees, modifying `/MediaBox` coordinates, splicing `/Contents` streams, injecting AcroForm interactive form fields, and saving optimized, spec-compliant PDF bytes.
2. **High-Fidelity Visual Rasterization**: Rendering complex PostScript vector paths, interpreting Type 1 / TrueType / CFF embedded fonts, evaluating blend modes, and generating pixel-perfect Canvas representations for thumbnails and previews.

No single JavaScript library excels at both:
- `pdf-lib` is exceptional at structural manipulation, fast document synthesis, and stream rewriting, but lacks a rendering engine to convert pages into Canvas bitmaps or image formats.
- `pdfjs-dist` (Mozilla PDF.js) is the industry benchmark for parsing, font extraction, and canvas rasterization, but is strictly read-only and cannot serialize, modify, or output modified PDF documents.

---

## Decision

We adopt a **Dual-Engine Decoupled Architecture**:

```text
               +---------------------------------------------+
               |              ErgonPDF Workflows             |
               +---------------------------------------------+
                                      |
                    +-----------------+-----------------+
                    |                                   |
                    v                                   v
    +-------------------------------+   +-------------------------------+
    |       pdf-lib Engine          |   |       pdfjs-dist Engine       |
    | (Structural Mutation Engine)  |   | (Visual Rasterization Engine) |
    +-------------------------------+   +-------------------------------+
    | • Document Assembly & Merge   |   | • Canvas Viewport Rendering   |
    | • Page Splitting & Insertion  |   | • High-DPI Thumbnail Cache    |
    | • N-Up & Booklet Imposition   |   | • Font & Glyph Parsing        |
    | • CropBox / MediaBox Mutation |   | • Positional Text Layer Extraction|
    | • AcroForm & Field Injection  |   | • Visual Diff Comparisons     |
    | • Watermark & Number Stamping |   | • Local OCR Worker Bridge     |
    +-------------------------------+   +-------------------------------+
                    |                                   |
                    +-----------------+-----------------+
                                      v
               +---------------------------------------------+
               |     Standardized Uint8Array Binary Stream   |
               +---------------------------------------------+
```

1. **`pdf-lib`** handles all stateful structural mutations: `mergeDocuments`, `splitDocument`, `halvePages`, `nUpImposition`, `createBooklet`, `cropDocument`, `resizeDocument`, `addWatermark`, `addPageNumbers`, and AcroForm field creation.
2. **`pdfjs-dist`** handles read-only inspection and rasterization: `inspectDocument`, page thumbnail generation, full-text extraction (`extractFullText`), table extraction, and image conversion (`convertToImages`).
3. For raster-based transformations (e.g. `raster-compress`, `grayscale-pdf`, `flatten-pdf`), `pdfjs-dist` renders pages onto an offscreen HTML5 Canvas, transforms pixel data, and re-embeds the resulting images into a fresh `pdf-lib` document.

---

## Consequences

### Positive
- **Best-in-Class Fidelity**: Combines the rock-solid PDF syntax compliance of `pdf-lib` with the world-class rendering accuracy of Mozilla's `pdfjs-dist`.
- **Decoupled Concerns**: Engine bugs in rendering do not corrupt the structural mutation pipeline, and vice versa.
- **Strict Typing**: Both engines are wrapped behind static, stateless TypeScript service classes (`PDFEngineService`).

### Negative & Mitigations
- **Bundle Weight**: Including both libraries increases raw bundle size (~500KB for `pdf-lib`, ~300KB for `pdfjs-dist`).  
  *Mitigation*: Chunks are split using Vite/Rolldown manual chunks (`vendor-pdflib` and `vendor-pdfjs`), loaded asynchronously, and cached permanently.
