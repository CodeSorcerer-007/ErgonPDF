# Building ErgonPDF from Source

This guide provides technical specifications for the ErgonPDF compilation pipeline, bundler configuration, manual chunking strategy, and static asset distribution.

---

## 1. Toolchain & Build Dependencies

- **Bundler**: Vite 8.2 (with Rolldown / Rollup bundler core)
- **Language**: TypeScript 6 / 5.9 with strict type checking (`tsc -b`)
- **CSS Framework**: Tailwind CSS with CSS variables
- **Linter**: Oxlint (ultra-fast Rust-based static analyzer)
- **Node.js Target**: Node.js 18+ (Node 20 or 22 LTS recommended)

---

## 2. Compilation Pipeline

When you run `npm run build`, the pipeline executes:

1. **TypeScript Type Verification (`tsc -b`)**:
   - Performs project-wide type checking across all files in `src/`.
   - Rejects implicit `any`, unresolved imports, and broken interface contracts.
2. **Vite Production Bundling (`vite build`)**:
   - Treeshakes unused code.
   - Splits heavy vendor dependencies into isolated, cacheable chunks.
   - Inlines critical CSS.
   - Copies static assets from `public/` into `dist/`.

---

## 3. Manual Chunking Strategy

To prevent massive single JavaScript bundles and optimize browser caching, `vite.config.ts` defines explicit manual chunk boundaries:

| Chunk Name | Included Libraries | Typical Size (Gzipped) | Caching Lifecycle |
| :--- | :--- | :---: | :--- |
| **`vendor-pdflib`** | `pdf-lib`, `@pdfsmaller/pdf-encrypt` | ~211 kB | Immutable / Long-term |
| **`vendor-pdfjs`** | `pdfjs-dist` | ~88 kB | Immutable / Long-term |
| **`vendor-tesseract`** | `tesseract.js` | ~7.3 kB | Immutable / Long-term |
| **`vendor-react`** | `react`, `react-dom`, `lucide-react` | ~66 kB | Immutable / Long-term |
| **`index.js`** | Application code, UI modals, workspace components | ~83 kB | Versioned |

---

## 4. Static Asset Copying & Worker Loading

Certain libraries require standalone worker scripts that must not be bundled into the main chunk:

1. **PDF.js Web Worker**:
   - `public/pdf.worker.min.js` is served as a static asset.
   - Initialized in code via:
     ```typescript
     pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
     ```
2. **Local Font Assets**:
   - `public/fonts/` contains local WOFF2 font files for `Inter` and `JetBrains Mono`.
   - Never referenced from external Google Fonts CDNs.

---

## 5. Build Verification

After compiling:

```bash
# Preview the production build locally
npm run preview
```
Visit `http://localhost:4173` to test the minified production distribution.

Run the automated smoke test against the build:
```bash
npm run smoke-test
```
