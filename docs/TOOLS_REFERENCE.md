# ErgonPDF Tools Reference Manual

> Exhaustive technical and functional reference for all 43 built-in PDF tools in ErgonPDF.  
> Every tool runs 100% locally in your browser memory via WebAssembly and JavaScript.

---

## Table of Contents
1. [Organize & Arrange (13 Tools)](#1-organize--arrange)
2. [Compress & Optimize (4 Tools)](#2-compress--optimize)
3. [Edit, Annotate & Sign (5 Tools)](#3-edit-annotate--sign)
4. [Create & Capture (5 Tools)](#4-create--capture)
5. [Convert & Extract (7 Tools)](#5-convert--extract)
6. [Security & Privacy (5 Tools)](#6-security--privacy)
7. [OCR & Scan (1 Tool)](#7-ocr--scan)
8. [View & Compare (2 Tools)](#8-view--compare)
9. [AI Document Studio (1 Tool)](#9-ai-document-studio)

---

## 1. Organize & Arrange

### `merge-pdf` — Merge PDF
- **Description**: Combine two or more PDF documents into a single consolidated document.
- **Inputs**: Multiple `.pdf` files.
- **Output**: Single combined `.pdf`.
- **Options**: Drag-and-drop reordering of file sequence before merge.
- **Engine**: `pdf-lib` document catalog copying.

### `split-pdf` — Split & Extract
- **Description**: Break a multi-page PDF into multiple individual files or custom-chunked documents.
- **Inputs**: Single `.pdf`.
- **Output**: Single or multiple `.pdf` files (or downloadable ZIP).
- **Options**: Split by range (e.g. `1-3, 5, 8-12`), extract every page into separate files, or split into equal page chunks.

### `reorder-pages` — Organize Pages
- **Description**: Visual grid showing thumbnails of every page in the document.
- **Inputs**: Single `.pdf`.
- **Output**: Reordered `.pdf`.
- **Options**: Drag-and-drop thumbnail reordering, per-page rotation (90° increments), page duplication, and instant deletion.

### `rotate-pdf` — Rotate Pages
- **Description**: Rotate all or selected pages to fix upside-down or sideways orientation.
- **Inputs**: Single `.pdf`.
- **Output**: Rotated `.pdf`.
- **Options**: Rotate 90° Clockwise, 180°, or 90° Counterclockwise; apply to All Pages, Odd Pages Only, or Even Pages Only.

### `remove-pages` — Remove Pages
- **Description**: Rapidly select and excise unwanted pages from a document.
- **Inputs**: Single `.pdf`.
- **Output**: Cleaned `.pdf`.
- **Options**: Click-to-select thumbnails or input page numbers / ranges (e.g., `4, 7-9`).

### `extract-pages` — Extract Pages
- **Description**: Pull a subset of pages into a new standalone document while preserving the original.
- **Inputs**: Single `.pdf`.
- **Output**: New standalone `.pdf`.
- **Options**: Page range selection or thumbnail multiselect.

### `halve-pdf` — Halve PDF Pages
- **Description**: Splits 2-in-1 scanned book spreads down the center into two individual sequential pages.
- **Inputs**: Single `.pdf` with landscape two-page spreads.
- **Output**: Portrait single-page `.pdf` with doubled page count.
- **Options**: Vertical split (left-to-right or right-to-left for RTL languages) or horizontal split.

### `pages-per-sheet` — Pages per Sheet (N-Up)
- **Description**: Imposes multiple document pages onto a single sheet of paper to save printing costs.
- **Inputs**: Single `.pdf`.
- **Output**: Imposed `.pdf`.
- **Options**: Layout options: 2-Up, 4-Up (2x2 grid), 9-Up (3x3 grid), or 16-Up; optional thin border divider between pages.

### `booklet-pdf` — Booklet Creator
- **Description**: Rearranges pages according to saddle-stitch imposition for double-sided booklet printing.
- **Inputs**: Single `.pdf`.
- **Output**: Booklet-ordered `.pdf`.
- **Options**: Automatic padding with blank pages to nearest multiple of 4; binding margin adjustment.

### `alternate-mix` — Alternate & Mix PDFs
- **Description**: Interleaves pages from two documents into a single alternating file (e.g., Document A has odd pages, Document B has even pages).
- **Inputs**: Two `.pdf` files.
- **Output**: Single interleaved `.pdf`.
- **Options**: Standard alternate (A1, B1, A2, B2...) or Reverse alternate (A1, Bn, A2, Bn-1... for reverse-feed scanner output).

### `crop-pdf` — Crop PDF
- **Description**: Trims margins, removes header/footer regions, or zooms in on specific document coordinates.
- **Inputs**: Single `.pdf`.
- **Output**: Cropped `.pdf`.
- **Options**: Visual drag-box cropping or explicit margin padding (top, right, bottom, left in points/mm).

### `resize-pdf` — Resize Page Dimensions
- **Description**: Standardizes page dimensions across a document.
- **Inputs**: Single `.pdf`.
- **Output**: Standardized `.pdf`.
- **Options**: Target presets: ISO A4, A3, A5, US Letter, US Legal, Executive; proportional scaling vs. margin letterboxing.

### `remove-blank-pages` — Remove Blank Pages
- **Description**: Scans document pages and removes empty or accidental blank scanner pages.
- **Inputs**: Single `.pdf`.
- **Output**: Cleaned `.pdf`.
- **Options**: White-pixel sensitivity threshold (95% to 99.9%).

---

## 2. Compress & Optimize

### `compress-pdf` — Compress PDF
- **Description**: Reduces document file size while preserving legibility.
- **Inputs**: Single `.pdf`.
- **Output**: Compressed `.pdf`.
- **Options**: Compression tiers: Lossless Stream De-duplication, Balanced (moderate downsampling), and Maximum Compression.

### `flatten-pdf` — Flatten / Rasterize PDF
- **Description**: Bakes interactive form fields, annotations, and vector layers into fixed page bitmaps.
- **Inputs**: Single `.pdf`.
- **Output**: Flattened `.pdf`.
- **Options**: Render DPI (150 DPI for screens, 300 DPI for print). Prevents any further editing or form tampering.

### `repair-pdf` — Repair Damaged PDF
- **Description**: Reconstructs corrupted object trees, fixes damaged cross-reference (XREF) tables, and recovers salvageable pages.
- **Inputs**: Corrupted or unopenable `.pdf`.
- **Output**: Repaired `.pdf`.
- **Options**: Deep stream recovery pass.

### `web-optimize` — Web Optimize (Linearize)
- **Description**: Defragments streams and reorganizes PDF objects for Fast Web View (page-at-a-time progressive streaming).
- **Inputs**: Single `.pdf`.
- **Output**: Linearized `.pdf`.

---

## 3. Edit, Annotate & Sign

### `sign-pdf` — Sign & Fill
- **Description**: Embeds signatures, initials, dates, and text notes onto any page.
- **Inputs**: Single `.pdf`.
- **Output**: Signed `.pdf`.
- **Options**: Draw signature with mouse/stylus, type signature with handwriting fonts, or upload signature PNG with background transparency.

### `annotate-pdf` — Annotate & Draw
- **Description**: Freehand markup canvas overlaid on PDF pages.
- **Inputs**: Single `.pdf`.
- **Output**: Annotated `.pdf`.
- **Options**: Highlighter pen with opacity, colored pens, rectangular/circular callouts, arrows, and sticky comment text.

### `watermark-pdf` — Watermark PDF
- **Description**: Overlays text or graphic watermarks across pages.
- **Inputs**: Single `.pdf`.
- **Output**: Watermarked `.pdf`.
- **Options**: Custom text (e.g. "CONFIDENTIAL", "DRAFT"), font size, color, opacity (0–100%), rotation angle (e.g., 45°), and under-content vs. over-content placement.

### `page-numbers` — Page Numbers
- **Description**: Stamps page numbering, headers, and footers onto documents.
- **Inputs**: Single `.pdf`.
- **Output**: Paginated `.pdf`.
- **Options**: Formatting (`Page {n} of {total}`, Roman numerals `{i}`, bare digits); position (top/bottom, left/center/right); skip cover page.

### `overlay-pdf` — PDF Overlay & Underlay
- **Description**: Merges a background or foreground template (such as official company letterhead) onto every page.
- **Inputs**: Target `.pdf` + Background/Overlay `.pdf`.
- **Output**: Composited `.pdf`.

---

## 4. Create & Capture

### `create-pdf` — Create Blank PDF
- **Description**: Generates new blank or patterned PDF canvases.
- **Output**: New `.pdf`.
- **Options**: Blank white, lined legal notebook, 5mm grid graph paper, or dot-grid bullet journal styling. Page count selector.

### `camera-scan` — Scan with Camera
- **Description**: Connects to your computer webcam or smartphone camera to snap photos of physical documents and convert them into PDF.
- **Inputs**: Live video feed / Camera snapshots.
- **Output**: Scanned `.pdf`.
- **Options**: Multi-page capture, contrast enhancement, auto-cropping, and B&W document filter.

### `webpage-to-pdf` — Webpage to PDF
- **Description**: Converts online articles, HTML snippets, or rich text into formatted PDF pages.
- **Inputs**: Raw HTML or text content.
- **Output**: Formatted `.pdf`.
- **Options**: Paper orientation, margins, custom CSS print styling.

### `create-form` — Create PDF Form
- **Description**: Interactive visual form builder to insert fillable fields into an existing or blank document.
- **Inputs**: Base `.pdf` or new document.
- **Output**: Fillable interactive `.pdf`.
- **Options**: Add single-line text inputs, multi-line text areas, checkboxes, radio buttons, and submit buttons.

### `qr-code-pdf` — Add QR Code
- **Description**: Generates high-resolution vector QR codes and stamps them onto document pages.
- **Inputs**: Single `.pdf`.
- **Output**: `.pdf` with embedded QR code.
- **Options**: Link URL, WiFi credentials, or text payload; adjustable size and coordinates.

---

## 5. Convert & Extract

### `pdf-to-images` — PDF to Images
- **Description**: Renders each page of a PDF into high-resolution image files.
- **Inputs**: Single `.pdf`.
- **Output**: Individual image files or `.zip` archive.
- **Options**: Format (PNG, JPEG, WebP); rendering density (1x, 2x, 3x for ultra-sharp text).

### `images-to-pdf` — Images to PDF
- **Description**: Combines multiple photos, graphics, or scanned receipts into a single PDF document.
- **Inputs**: `.jpg`, `.png`, `.webp`, `.bmp` files.
- **Output**: Consolidated `.pdf`.
- **Options**: Page size matching image aspect ratio vs. standardized A4/Letter sizing with auto-rotation.

### `extract-images` — Extract Images from PDF
- **Description**: Inspects internal PDF object streams and extracts embedded raster images at their native resolution without re-encoding quality loss.
- **Inputs**: Single `.pdf`.
- **Output**: `.zip` file containing extracted JPEG and PNG images.

### `extract-text` — Extract Text
- **Description**: Pulls all selectable plain text and paragraph structures out of the document.
- **Inputs**: Single `.pdf`.
- **Output**: Plain text `.txt` or `.md` file download.

### `pdf-to-word` — PDF to Word (DOCX)
- **Description**: Converts layout, headings, and text blocks into an editable Microsoft Word document.
- **Inputs**: Single `.pdf`.
- **Output**: `.docx` file.

### `pdf-to-excel` — PDF to Excel / CSV
- **Description**: Identifies grid tables and structured columns in the document and exports them into spreadsheets.
- **Inputs**: Single `.pdf`.
- **Output**: `.xlsx` or `.csv` file.

### `pdf-to-pdfa` — PDF to PDF/A
- **Description**: Converts standard PDFs into ISO 19005 compliant PDF/A archival documents with embedded color profiles and device-independent fonts.
- **Inputs**: Single `.pdf`.
- **Output**: ISO-compliant `.pdf`.

---

## 6. Security & Privacy

### `protect-pdf` — Protect & Encrypt
- **Description**: Encrypts document with AES-256 or AES-128 encryption.
- **Inputs**: Single `.pdf`.
- **Output**: Encrypted `.pdf`.
- **Options**: Set User Password (required to view) and Owner Password (restricts copying, modifying, and printing).

### `unlock-pdf` — Unlock PDF
- **Description**: Decrypts a password-protected PDF and strips owner permission restrictions.
- **Inputs**: Protected `.pdf` + Password.
- **Output**: Decrypted, unrestricted `.pdf`.

### `redact-pdf` — Redact & Blackout
- **Description**: Permanently burns out sensitive text, credit cards, or Social Security numbers.
- **Inputs**: Single `.pdf`.
- **Output**: Redacted `.pdf`.
- **Features**: True redaction: deletes underlying font and character data under the blackout area to prevent clipboard extraction.

### `metadata-scrubber` — Sanitize Metadata
- **Description**: Displays hidden document metadata (author name, creation software, edit timestamps, camera EXIF, GPS tags) and wipes them clean.
- **Inputs**: Single `.pdf`.
- **Output**: Sanitized `.pdf`.

### `password-generator` — Password Generator
- **Description**: Generates cryptographically secure, high-entropy passwords directly in-browser using Web Crypto `crypto.getRandomValues`.
- **Output**: Strong passphrase string with entropy indicator.

---

## 7. OCR & Scan

### `ocr-pdf` — OCR & Make Searchable
- **Description**: Optical Character Recognition powered by WebAssembly Tesseract.
- **Inputs**: Scanned or image-based `.pdf`.
- **Output**: Text extraction / Searchable layer.
- **Options**: Language model selection (English default, multi-language extensible). Completely client-side.

---

## 8. View & Compare

### `compare-pdf` — Compare Documents
- **Description**: Loads two versions of a document side-by-side with synchronized zoom and scroll for visual diff verification.
- **Inputs**: Two `.pdf` files (Original vs. Modified).
- **Features**: Synchronized scrolling, difference highlighting.

### `view-pdf` — PDF Reader & Viewer
- **Description**: High-performance reader featuring continuous scroll, page jumps, text search, and night/dark mode reading comfort.
- **Inputs**: Single `.pdf`.

---

## 9. AI Document Studio

### `ai-chat` — AI Document Studio
- **Description**: Intelligent document assistant for quick insights, summaries, and structural queries.
- **Inputs**: Single `.pdf`.
- **Features**: Local heuristic analysis for contract risk identification, clause extraction, key term search, and zero-telemetry local operation.
