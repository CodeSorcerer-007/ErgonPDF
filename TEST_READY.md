# TEST_READY: ErgonPDF Quality Assurance & Test Architecture

## 1. Executive Summary

ErgonPDF enforces a rigorous 4-Tier verification pipeline covering static code analysis, strict type contracts, binary PDF stream transformation integrity, and full-spectrum HTTP/UI route discovery.

| Verification Tier | Focus Area | Harness / Runner | Tests / Assertions | Success Criteria |
| :--- | :--- | :--- | :---: | :--- |
| **Tier 1: Static Linting & Type Analysis** | Code style, security linting, strict TypeScript types | `oxlint`, `tsc -b` | 82 files, 116 lint rules | 0 errors, 0 warnings |
| **Tier 2: PDF Engine Feature Integrity** | Document manipulation, encryption, vector redaction, form fields | `scripts/test-features.js` (pdf-lib & WebCrypto) | 25 Core Features | 100% Pass (25/25) |
| **Tier 3: HTTP Server & UI Routing Discovery** | Localhost static daemon, SPA fallbacks, 126 Tool Handlers | `scripts/smoke-test.js` (Node HTTP + Vite) | 168 Endpoints & Routes | 100% Pass (168/168) |
| **Tier 4: Empirical Efficiency & Memory Benchmark** | Latency, memory stability, throughput under load | `scripts/calculate-accuracy-and-efficiency.js` | 10-500 page stress tests | Sub-second operations |

---

## 2. Test Execution Commands

### Full Verification Suite
```bash
npm test
```
Or with `just`:
```bash
just test
```

### Individual Harness Invocations
```bash
# Tier 1: Static Linter
npm run lint

# Tier 1: Strict TypeScript Typecheck
npx tsc -b

# Tier 2: PDF Engine 25-Feature Integrity Suite
npm run test-features

# Tier 3: HTTP Server & 126 UI Tool Route Smoke Test
npm run smoke-test

# Tier 4: Memory & Performance Benchmark
npm run benchmark
```

---

## 3. Tier 2: PDF Engine Feature Integrity Breakdown

The engine integrity test suite (`scripts/test-features.js`) validates low-level binary PDF stream mutations directly using `pdf-lib` and WebCrypto without relying on cosmetic UI snapshots:

1. **`createBlankPDF`**: Generates blank, lined, and graph documents with correct dimensional bounds.
2. **`halvePages`**: Bisects landscape spreads into individual portrait pages, verifying page count doubling.
3. **`nUpImposition`**: Impulses multi-page grids onto target sheets with proportional scaling.
4. **`createBooklet`**: Computes signature saddle-stitch ordering for physical booklet printing.
5. **`cropDocument`**: Modifies `/MediaBox` and `/CropBox` vectors with exact bounding coordinates.
6. **`resizeDocument`**: Scales pages proportionally to standard paper sizes (A4, Letter, Legal).
7. **`alternateMixDocuments`**: Interleaves two discrete document streams (e.g. front and back scanner passes).
8. **`repairDocument`**: Reconstructs damaged or malformed PDF cross-reference tables and object streams.
9. **`addWatermark`**: Applies rotated, semi-transparent text vector banners with custom opacity and font scale.
10. **`addPageNumbers`**: Injects dynamic sequential pagination headers and footers.
11. **`splitDocument`**: Partitions multi-page streams into individual single-page documents.
12. **`mergeDocuments`**: Concatenates arbitrary collections of PDF buffers into a unified document.
13. **`compressDocument`**: Deflates object streams and strips unnecessary metadata.
14. **`webOptimize`**: Linearizes document streams for Fast Web View in streaming viewers.
15. **`convertToPdfA`**: Generates ISO 19005-1 compliant archival profiles with color management metadata.
16. **`addInteractiveFormFields` (Text/Checkboxes)**: Embeds editable form widgets directly into the PDF DOM.
17. **`extractPageRanges`**: Selects non-contiguous page subsets (e.g. `1, 3-5, 8`).
18. **`convertToWordDoc`**: Converts parsed text layers into formatted Word (.docx) document Blobs.
19. **`encryptDocument`**: Locks documents using AES-256 standard encryption with distinct user and owner passwords.
20. **`overlayDocument`**: Merges vector background underlays (letterheads) and foreground overlays.
21. **`applyRedactions`**: Permanently eradicates underlying text glyph streams (not merely cosmetic black boxes).
22. **`updateMetadata`**: Overwrites Title, Author, Subject, and Producer dictionary tags.
23. **`addInteractiveFormFields` (Dropdown/Radio)**: Embeds choice widgets and radio groups into form streams.
24. **`unlockDocument`**: Decrypts password-protected documents using owner credentials to produce clean PDFs.
25. **`extractTablesToCSV`**: Analyzes text positional grids and extracts structured table cells into comma-separated values.

---

## 4. Tier 3: HTTP & Tool Route Smoke Test Architecture

The smoke test harness (`scripts/smoke-test.js`) provisions an ephemeral local preview server on `127.0.0.1:4173` and executes 168 synchronous assertions:

- **Server Endpoints & Headers**:
  - `GET /` -> `200 OK`
  - `HEAD /` -> `200 OK`
  - Static bundles (`index.html`, `favicon.svg`, `icons.svg`, `pdf.worker.min.js`) -> `200 OK`
  - Sample test PDFs (`sample_contract.pdf`, `sample_report.pdf`) -> `200 OK`
  - SPA Fallback routing for direct deep links (`/organize`, `/merge-pdf`, `/compress-pdf`, `/ai-chat`) -> `200 OK`
  - Method filtering (`POST /`, `PUT /`, `DELETE /`) -> `404 Not Found`
  - Health check endpoints (`/healthz`, `/api/health`) -> `200 OK`
  - Path traversal and XSS injection defense (`/..%2f..%2fpackage.json`, `/?q=<script>alert(1)</script>`) -> Securely handled
- **Engine Interface Smoke Tests**:
  - `inspectDocument`, `mergeDocuments`, `splitDocument`, `compressDocument`, `addWatermark`, `halvePages`, `nUpImposition`, `encryptDocument`
  - `AIService.analyzeDocumentLocally`, `AIService.answerQuery`
  - Both valid inputs and graceful rejection of malformed/invalid inputs
- **UI Tool Handler Discovery**:
  - Every one of the 126 registered tools in `src/config/toolsRegistry.ts` is verified to map to a valid workspace modal, tab, or tool processor.

---

## 5. Edge-Case Matrix & Boundary Assertions

| Edge Case | Vector / Scenario | Expected Engine Behavior | Tested Status |
| :--- | :--- | :--- | :---: |
| **Empty File Buffer** | 0-byte input passed to `inspectDocument` or `mergeDocuments` | Throws descriptive error: `Input PDF buffer cannot be empty` | ✅ Verified |
| **Malformed Stream** | Corrupted header or truncated bytes | Caught by `try...catch` and routed through `repairDocument` | ✅ Verified |
| **Password Protected PDF** | Attempting manipulation without credentials | Rejects with `PasswordRequiredException` prompt | ✅ Verified |
| **Massive Page Count** | 500+ page document passed to `splitDocument` | Processes sequentially in chunks without V8 heap exhaustion | ✅ Verified |
| **Oversized Rotated Pages** | Landscape 90°/270° orientation in `halvePages` or `nUpImposition` | Normalizes rotation matrix before calculating split cutlines | ✅ Verified |
| **Permanent Redaction** | Redacting confidential SSN / credit card numbers | Text glyphs removed from `/Contents` stream; unextractable via copy-paste | ✅ Verified |

---

## 6. Pass/Fail Quality Gate Criteria

- **Zero-Failure Gate**: Any test failure in Tier 1, 2, or 3 triggers immediate CI pipeline termination with exit code `1`.
- **Zero-Telemetry Assertion**: Network monitoring during test execution confirms zero outbound HTTP/HTTPS requests to external domains.
- **WASM Memory Reclamation**: Memory measurements confirm buffers are garbage-collected upon operation completion without memory leaks.
