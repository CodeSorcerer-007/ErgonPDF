# ErgonPDF User & Deployment Guide

This document provides a comprehensive operational guide for ErgonPDF, detailing recommended platform usage (Desktop vs. Mobile), step-by-step feature workflows, production deployment strategies, and operational troubleshooting.

---

## Table of Contents

1. [Platform Recommendation: Desktop vs. Mobile](#1-platform-recommendation-desktop-vs-mobile)
   - [Why Desktop is Recommended](#why-desktop-is-recommended)
   - [Using on Mobile and Tablets](#using-on-mobile-and-tablets)
   - [Packaging as a Native Desktop App (Tauri / Electron)](#packaging-as-a-native-desktop-app-tauri--electron)
2. [Essential Usage Workflows](#2-essential-usage-workflows)
   - [Global Navigation & Command Palette](#global-navigation--command-palette)
   - [Document Ingestion](#document-ingestion)
   - [Assemble & Arrange (Merge, Split, Reorder)](#assemble--arrange-merge-split-reorder)
   - [Imposition & Print (N-Up, Halve, Booklet)](#imposition--print-n-up-halve-booklet)
   - [Optimization & Downsampling (Compress)](#optimization--downsampling-compress)
   - [Signatures, Annotations & Watermarks](#signatures-annotations--watermarks)
   - [Document Security & Redaction](#document-security--redaction)
   - [Conversions & Optical Character Recognition (OCR)](#conversions--optical-character-recognition-ocr)
   - [Document Intelligence (Local NLP & Q&A)](#document-intelligence-local-nlp--qa)
3. [Deployment Guide](#3-deployment-guide)
   - [Deployment Architecture Overview](#deployment-architecture-overview)
   - [Method 1: Docker & Containerization (Recommended for Self-Hosting)](#method-1-docker--containerization-recommended-for-self-hosting)
   - [Method 2: Static CDN Hosting (Cloudflare Pages, Vercel, Netlify)](#method-2-static-cdn-hosting-cloudflare-pages-vercel-netlify)
   - [Method 3: Traditional Linux / Nginx Web Server](#method-3-traditional-linux--nginx-web-server)
   - [Method 4: Air-Gapped / Intranet Local Deployment](#method-4-air-gapped--intranet-local-deployment)
4. [Performance & Troubleshooting](#4-performance--troubleshooting)
   - [Handling Large Files (100MB+ or 500+ Pages)](#handling-large-files-100mb-or-500-pages)
   - [Browser Compatibility & Web Worker Isolation](#browser-compatibility--web-worker-isolation)
   - [Memory & Cache Cleanup](#memory--cache-cleanup)

---

## 1. Platform Recommendation: Desktop vs. Mobile

ErgonPDF is built as a **client-side Single Page Application (SPA)** using React 19, TypeScript, and WebAssembly (WASM). All document manipulations run entirely in the browser memory of the client device.

### Why Desktop is Recommended

**The primary and optimal way to use ErgonPDF is on a Desktop or Laptop web browser** (Chrome, Edge, Firefox, Brave, Safari).

1. **Hardware Memory & Multi-Threading**:
   - Client-side PDF parsing (`pdf-lib`, `pdfjs-dist`) and OCR (`tesseract.js`) execute in Web Workers and allocate multi-megabyte binary buffers in browser memory.
   - Mobile operating systems (iOS and Android) impose strict per-tab memory quotas (often 250MB–500MB) and will abruptly reload tabs during heavy processing (e.g., rasterizing a 60-page PDF or running OCR).
   - Desktop operating systems allow multi-gigabyte memory allocations and utilize multi-core CPU threading for high-speed WASM execution.

2. **Pointer & Keyboard Precision**:
   - The workspace incorporates interactive tools requiring fine cursor control:
     - Drag-and-drop page thumbnail reordering.
     - Precise freehand signature vector capture.
     - Blackout redaction box selection.
     - Crop margin adjustments.
   - Keyboard productivity features like the global Command Palette (`Ctrl + K` or `Cmd + K`) and pagination shortcuts are tailored for desktop workflows.

3. **Screen Real Estate**:
   - Side-by-side split viewports, multi-column imposition previews (2-Up, 4-Up, Booklet spreads), and thumbnail reels are designed for standard desktop resolutions ($1280 \times 720$ and above).

### Using on Mobile and Tablets

ErgonPDF includes responsive styling and can be accessed on mobile or tablet devices:

- **Suitable Mobile Use Cases**:
  - Quick document viewing and single-page text inspection.
  - Adding a signature touch stroke using a phone screen or tablet stylus (Apple Pencil / S-Pen).
  - Quick single-document conversions or metadata inspection.
- **Current Limitations on Mobile**:
  - Drag-and-drop thumbnail reordering requires mouse pointers on some older mobile browsers.
  - Large PDF files (>50MB) may cause memory pressure on low-RAM smartphones.
  - *Note*: Dedicated touch gesture mechanics (pinch-to-zoom, swipe gestures) and installable Progressive Web App (PWA) offline manifests are scheduled for Horizon 3 in the project roadmap.

### Packaging as a Native Desktop App (Tauri / Electron)

Because ErgonPDF compiles into pure static HTML, CSS, JavaScript, and WebAssembly assets (`dist/`), it can be wrapped into a standalone desktop application (`.exe`, `.dmg`, `.deb`):

- **Tauri (Recommended)**:
  - Produces an ultra-lightweight binary (~15MB installer) using the OS native webview.
  - Preserves 100% offline isolation without bundling Chromium.
- **Electron**:
  - Packages Chromium and Node.js for guaranteed cross-platform rendering consistency.

---

## 2. Essential Usage Workflows

### Global Navigation & Command Palette

- **Command Palette**: Press `Ctrl + K` (Windows/Linux) or `Cmd + K` (macOS) at any time to open the fuzzy search bar. Type any tool name (e.g., `merge`, `compress`, `encrypt`, `watermark`) to navigate directly.
- **Favorites Bar**: Star frequently used tools on the dashboard to pin them to your primary quick-action ribbon.

### Document Ingestion

1. **Drag-and-Drop**: Drag one or more PDF files from your file manager directly into the workspace dropzone.
2. **File Picker**: Click the central dropzone button to select documents via the native system dialog.
3. **Capture via Camera**: Select the **Camera Scan** tool to capture physical receipts, invoices, or ID cards directly from your webcam.
4. **Blank Document**: Choose **Create Blank PDF** to generate an empty canvas, lined paper, or grid sheet.

### Assemble & Arrange (Merge, Split, Reorder)

- **Merge PDFs**: Select multiple files in the Merge dialog, drag file cards to order them, and click **Merge PDFs**.
- **Reorder Pages**: In the left sidebar thumbnail reel, click and drag any page thumbnail to change its sequence in real time.
- **Rotate Pages**: Click the rotation button on individual thumbnails to rotate 90°, 180°, or 270°, or apply bulk rotation across all pages in the **Rotate** tool panel.
- **Split & Extract**: Specify single pages or ranges (e.g., `1, 3-5, 8`) to partition the active document into separate files or download targeted subsets.

### Imposition & Print (N-Up, Halve, Booklet)

- **2-in-1 Page Halving**: Bisects scanned dual-page landscape spreads into sequential single-page portrait sheets.
- **N-Up Multi-Page Sheets**: Combines 2, 4, 9, or 16 pages onto a single sheet for presentation handouts or print conservation.
- **Saddle-Stitch Booklet**: Automatically re-sequences pages into folded signatures so the printed stack can be folded in half and stapled as a booklet.
- **Margin Crop & Standardize**: Crop whitespace margins or conform pages to DIN/ANSI presets (A4, A3, Letter, Legal).

### Optimization & Downsampling (Compress)

ErgonPDF provides two optimization strategies in the **Compress** panel:

1. **Lossless Optimization**: Purges unreferenced PDF objects, deduplicates internal font streams, strips redundant XML metadata, and defragments cross-reference tables without altering visual image fidelity.
2. **Adaptive Raster Downsampling**: Re-renders embedded images at configurable target DPI profiles:
   - *Compact (96 DPI)*: Smallest file footprint, ideal for email attachments.
   - *Balanced (144 DPI)*: Standard readability for screen viewing.
   - *High-Fidelity (300 DPI)*: Clean rendering for archival and printing.

### Signatures, Annotations & Watermarks

- **Signature Studio**:
  - *Draw*: Draw a signature using a mouse, touchpad, or tablet stylus.
  - *Type*: Generate stylized typographic signatures using calligraphic font templates.
  - *Stamp*: Place the signature onto any page, resize, and position before burning into the document.
- **Watermarking**: Stamp diagonal semi-transparent text banners across pages with configurable opacity, color, and font scale.
- **Page Numbers**: Add sequential headers or footers with customizable templates (e.g., `Page {n} of {total}`).

### Document Security & Redaction

- **AES-256 Encryption**:
  - Set a **User Password** required to open the document.
  - Set an **Owner Password** to enforce granular permission flags (disable printing, copy/paste, or modification).
- **Permanent Blackout Redaction**:
  - Draw blackout rectangles over confidential information (SSNs, banking details, personal names).
  - The redaction permanently burns the blackout into the canvas and purges underlying vector text and glyph coordinates.
- **Metadata Scrubbing**: Clears creator software, author names, modification timestamps, and hidden camera EXIF data with a single click.

### Conversions & Optical Character Recognition (OCR)

- **PDF to Images**: Export pages as high-resolution PNG, JPEG, or WebP files, packaged into a single `.zip` archive via JSZip.
- **Images to PDF**: Convert scanned photos, receipts, or diagrams into an ISO-standard PDF document.
- **PDF to Word (`.doc`) & CSV**: Extract text streams into formatted Word-compatible documents or parse table rows into CSV spreadsheets.
- **Client-Side OCR**:
  - Powered by sandboxed multi-threaded Tesseract.js Web Workers.
  - Extracts text from scanned PDFs or images directly in local memory.
  - Displays real-time progress percentages and character confidence ratings.

### Document Intelligence (Local NLP & Q&A)

ErgonPDF incorporates an in-memory heuristic NLP engine that operates without calling external cloud AI endpoints:

- **Executive Summary**: Generates word frequency distributions, reading time estimates, and key excerpt summaries.
- **Entity Discovery**: Extracts currency amounts, legal dates, email addresses, and phone numbers.
- **Citation-Backed Q&A**: Ask natural language questions against the active document. The engine searches page text vectors and returns verified answers with clickable page number citations.

---

## 3. Deployment Guide

### Deployment Architecture Overview

Because ErgonPDF does not require a backend runtime (no Node.js server, Python backend, or database in production), deployment consists of serving compiled static files (`dist/`) via a web server or CDN.

```text
[Client Browser] ──(HTTPS)──> [Static File Server / CDN]
                                 ├── index.html
                                 ├── assets/*.js (React + WASM loaders)
                                 └── assets/*.css
```

Once the static assets are loaded, **all compute occurs locally in the user's browser**.

---

### Method 1: Docker & Containerization (Recommended for Self-Hosting)

The repository includes a multi-stage [Dockerfile](file:///e:/Github/ErgonPDF/Dockerfile) and [docker-compose.yml](file:///e:/Github/ErgonPDF/docker-compose.yml) based on unprivileged Nginx Alpine.

#### Quick Launch with Docker Compose

```bash
# Clone the repository
git clone https://github.com/CodeSorcerer-007/ErgonPDF.git
cd ErgonPDF

# Start container in detached mode
docker compose up -d
```

The application is immediately accessible at `http://localhost:8080`.

#### Build and Run with Docker CLI

```bash
# 1. Build the production image
docker build -t ergonpdf:1.2.0 .

# 2. Run the container on port 8080
docker run -d \
  --name ergonpdf \
  -p 8080:80 \
  --restart unless-stopped \
  ergonpdf:1.2.0
```

#### Health Probes for Kubernetes / Container Orchestrators

- **Liveness Probe**: `http://localhost:8080/healthz` (returns `200 OK`)
- **API Status Probe**: `http://localhost:8080/api/health` (returns JSON status payload)

---

### Method 2: Static CDN Hosting (Cloudflare Pages, Vercel, Netlify)

Hosting on a global CDN provides ultra-fast asset loading and zero server costs.

#### Universal Build Configuration

| Setting | Value |
| :--- | :--- |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Node Version** | `20.x` or `22.x` |

#### Platform-Specific Notes

- **Cloudflare Pages**:
  - Connect your GitHub repository.
  - Framework Preset: `Vite`.
  - Build command: `npm run build`, output: `dist`.
  - Add a single SPA rewrite in `_redirects`:
    ```text
    /*    /index.html   200
    ```

- **Vercel**:
  - Import repository.
  - Framework Preset: `Vite`.
  - Output directory: `dist`.
  - SPA routing is detected automatically.

- **Netlify**:
  - Connect repository.
  - Publish directory: `dist`.
  - Create a `public/_redirects` file with:
    ```text
    /*    /index.html   200
    ```

- **GitHub Pages**:
  - Use GitHub Actions to build `npm run build` and deploy the `dist/` directory to the `gh-pages` branch.

---

### Method 3: Traditional Linux / Nginx Web Server

If deploying to an existing Ubuntu / Debian / RHEL virtual private server (VPS):

1. **Build the production bundle**:
   ```bash
   npm ci
   npm run build
   ```

2. **Copy the build output to your web root**:
   ```bash
   sudo mkdir -p /var/www/ergonpdf
   sudo cp -r dist/* /var/www/ergonpdf/
   ```

3. **Deploy the Nginx Configuration**:
   Use the pre-configured [nginx.conf](file:///e:/Github/ErgonPDF/nginx.conf) provided in the repository, which includes:
   - Gzip compression for JavaScript, CSS, and WASM binaries.
   - Long-lived caching headers (`1y`) for static hashed assets.
   - Strict Content Security Policy (CSP) permitting local WASM evaluation (`wasm-unsafe-eval`) and Web Worker blobs (`worker-src blob:`).
   - SPA route fallback (`try_files $uri $uri/ /index.html;`).

4. **Reload Nginx**:
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

---

### Method 4: Air-Gapped / Intranet Local Deployment

For defense, healthcare, or financial environments requiring strict air-gapping:

1. Build the production package on a workstation with internet access:
   ```bash
   npm ci
   npm run build
   ```
2. Archive the repository including the `dist/` folder:
   ```bash
   tar -czvf ergonpdf-production.tar.gz dist/
   ```
3. Transfer the archive to the air-gapped server.
4. Serve the `dist/` folder using any internal HTTP server, Nginx instance, or Docker container.
5. Because ErgonPDF downloads no runtime dependencies or third-party fonts during execution, all 43 document tools will function completely offline.

---

## 4. Performance & Troubleshooting

### Handling Large Files (100MB+ or 500+ Pages)

- **Memory Management**: When processing massive files, close extraneous browser tabs to give the browser access to more RAM.
- **Batch Processing**: For multi-hundred-page documents, use the **Split** or **Extract Pages** utility to break the document into smaller chapters before running intensive rasterization or OCR passes.
- **Canvas Revocation**: ErgonPDF automatically revokes unused canvas contexts and blob URLs to mitigate browser memory leaks.

### Browser Compatibility & Web Worker Isolation

| Browser | Support Level | Minimum Recommended Version |
| :--- | :--- | :--- |
| **Google Chrome / Chromium** | Tier 1 (Optimal) | Version 110+ |
| **Microsoft Edge** | Tier 1 (Optimal) | Version 110+ |
| **Mozilla Firefox** | Tier 1 (Optimal) | Version 115+ |
| **Brave** | Tier 1 (Optimal) | Version 1.50+ |
| **Apple Safari (macOS / iPadOS)** | Tier 2 (Supported) | Safari 16.4+ (WebAssembly & WebCrypto required) |

### Memory & Cache Cleanup

If you encounter unexpected rendering artifacts or memory limits:
1. Reload the tab to allow the browser garbage collector to reclaim allocated buffers.
2. In the top navigation bar, open **Settings** to inspect local storage quotas or adjust default rendering DPI (set to 96 or 144 DPI for faster processing).
