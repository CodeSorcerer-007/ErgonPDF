# ErgonPDF Beta Testing Guide

Welcome to the ErgonPDF Beta Testing program. This guide provides structured test protocols to help you validate functionality, performance, and privacy safeguards across ErgonPDF's 126 client-side PDF tools.

---

## 🔒 The Privacy Invariant: Verify It First!

Before testing any PDF tools, verify our core architectural promise: **Zero Data Leaves Your Machine**.

1. Launch ErgonPDF at `http://127.0.0.1:8074` or `http://localhost:5173`.
2. Open your browser's Developer Tools (`F12` or `Ctrl + Shift + I`).
3. Switch to the **Network** tab.
4. Check **Offline** (or disconnect your machine's Wi-Fi / Ethernet entirely).
5. Execute any tool: Merge, Split, OCR, Redact, Sign, or AI Document Studio.
6. **Result**: Every tool continues to operate at 100% capacity with **0 network requests**.

---

## 🧪 Structured Test Vectors (By Category)

### 1. Organize & Layout
- **Merge PDF**:
  - Test with 2 standard PDFs, then test with 10+ PDFs.
  - Re-order files via drag-and-drop before clicking Merge.
  - Verify merged document retains all pages in the specified order.
- **Halve Pages / Booklet**:
  - Load a landscape 2-page document.
  - Execute **Halve Spreads** and verify output has 4 portrait pages.
  - Test **Booklet Creator** and verify saddle-stitch signature order (e.g. pages 8 & 1, 2 & 7).
- **Alternate & Mix**:
  - Interleave two 5-page PDFs (simulating duplex scan front & back sides).

### 2. Convert & Transform
- **PDF to Word / Excel / Text**:
  - Load `public/samples/sample_report.pdf`.
  - Convert to `.docx` and open in Word or LibreOffice.
  - Convert to `.csv` or `.xlsx` and verify table grid alignment.
- **Images to PDF**:
  - Drag 5 high-resolution JPG/PNG images.
  - Set margins and page orientation; compile into a single PDF.

### 3. Edit & Annotate
- **Digital Signatures**:
  - Open **Sign PDF**.
  - Draw a freehand signature, type a signature with custom script font, or upload an image signature.
  - Position signature on page 2, adjust size and opacity, and download.
- **Watermark & Page Numbers**:
  - Apply custom diagonal watermark (`"CONFIDENTIAL"`).
  - Apply sequential footer numbering (`"Page {n} of {total}"`).
  - Verify crisp vector rendering without text distortion.

### 4. Security & Privacy
- **AES-256 Encryption**:
  - Set a User password (`UserPass123!`) and Owner password (`AdminPass456!`).
  - Restrict printing and content extraction permissions.
  - Open the resulting PDF in Acrobat or browser—verify prompt for password.
- **Permanent Redaction**:
  - Select a text phrase (e.g., account number or names).
  - Apply Redaction.
  - Download and re-open the redacted PDF: attempt to select text (`Ctrl + A`) or search (`Ctrl + F`). The redacted text must be **completely absent** from the underlying document stream.

### 5. Compress & Optimize
- **Adaptive Compression**:
  - Test standard compression vs maximum raster downsampling.
  - Inspect byte size reduction in the output toast notification.
- **Convert to Grayscale & Dark Mode Inversion**:
  - Convert full-color document to monochrome.
  - Invert color scheme for dark-mode reading.

### 6. OCR & Text Recognition
- **Local Tesseract OCR**:
  - Load a scanned image-only PDF (no selectable text).
  - Select English (`eng`) or target language.
  - Monitor local worker progress bar.
  - Verify extracted plaintext accuracy.

### 7. AI Document Studio (Local Heuristics)
- Open **AI Document Studio**.
- Load `public/samples/sample_contract.pdf`.
- Verify:
  - Document genre classification (e.g. "Legal Contract / Agreement").
  - Discovered financial values and entity extraction.
  - Semantic Q&A: Query `"What are the payment terms?"` and check cited page numbers.

---

## ⚡ Stress Testing & Boundary Scenarios

Testers with high-end or resource-constrained hardware are invited to test extreme boundary conditions:

1. **Large Document Stress**:
   - Load a 200+ page PDF (or a 100MB+ high-resolution scan).
   - Perform Split and N-Up operations.
   - Monitor browser memory in Task Manager—verify RAM usage does not exceed 1.5 GB and frees immediately after download.
2. **Corrupted Stream Handling**:
   - Truncate a PDF file in a hex editor or use a damaged PDF.
   - Run the **Repair PDF** tool.
   - Verify graceful recovery or helpful user-facing error message (no unhandled JavaScript crashes).
3. **Password Rejection**:
   - Enter incorrect credentials on an encrypted PDF; confirm user-friendly retry prompt.

---

## 📝 Submitting Feedback

When you discover an anomaly or have an enhancement recommendation:
1. Copy the template from **[BETA_FEEDBACK_TEMPLATE.md](BETA_FEEDBACK_TEMPLATE.md)**.
2. Fill out the reproduction steps, environment details, and expected vs. actual outcomes.
3. Open a GitHub Issue or submit your report directly to the release team.
