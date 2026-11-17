# ErgonPDF Programmatic API Reference & TypeScript Contracts

This document provides exhaustive type-safe specifications for the core client-side processing services in ErgonPDF: `PDFEngineService`, `AIService`, `OCRService`, and `StorageService`.

All operations execute strictly in local memory and return standardized binary `Uint8Array` streams or structured data interfaces.

---

## 1. `PDFEngineService` (`src/services/pdfEngine.ts`)

The central static service orchestrating document mutations, page transformations, and security handlers.

### 1.1 Document Inspection
```typescript
static async inspectDocument(
  buffer: ArrayBuffer | Uint8Array
): Promise<DocumentMetadata>
```
- **Description**: Parses PDF structure and returns metadata, page count, dimension bounds, and encryption status.
- **Parameters**:
  - `buffer`: Raw binary PDF buffer.
- **Returns**:
  ```typescript
  interface DocumentMetadata {
    pageCount: number;
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
    isEncrypted: boolean;
    pageSize: { width: number; height: number };
  }
  ```
- **Error Handling**: Throws `Error('Input PDF buffer cannot be empty')` if buffer length is 0.

---

### 1.2 Document Concatenation (Merge)
```typescript
static async mergeDocuments(
  buffers: (ArrayBuffer | Uint8Array)[]
): Promise<Uint8Array>
```
- **Description**: Concatenates multiple PDF buffers into a unified document stream.
- **Parameters**:
  - `buffers`: Array of valid PDF byte arrays (minimum 1 document).
- **Returns**: `Uint8Array` of the synthesized PDF.
- **Example**:
  ```typescript
  const mergedBytes = await PDFEngineService.mergeDocuments([fileABytes, fileBBytes]);
  ```

---

### 1.3 Document Partitioning (Split & Page Extraction)
```typescript
static async splitDocument(
  buffer: ArrayBuffer | Uint8Array
): Promise<Uint8Array[]>
```
- **Description**: Slices an N-page PDF into an array of N single-page standalone documents.

```typescript
static async extractPageRanges(
  buffer: ArrayBuffer | Uint8Array,
  ranges: string
): Promise<Uint8Array>
```
- **Description**: Extracts non-contiguous page subsets according to standard range syntax.
- **Parameters**:
  - `ranges`: String formatted as `"1, 3-5, 8"`. 1-based page indices.

---

### 1.4 Imposition & Layout (Halve, N-Up, Booklet)
```typescript
static async halvePages(
  buffer: ArrayBuffer | Uint8Array
): Promise<Uint8Array>
```
- **Description**: Bisects landscape two-page spreads into individual portrait sheets, doubling the total page count.

```typescript
static async nUpImposition(
  buffer: ArrayBuffer | Uint8Array,
  pagesPerSheet: 2 | 4 | 9 | 16
): Promise<Uint8Array>
```
- **Description**: Scales and arranges multiple source pages onto single standard target sheets.

```typescript
static async createBooklet(
  buffer: ArrayBuffer | Uint8Array
): Promise<Uint8Array>
```
- **Description**: Re-orders and imposes pages in saddle-stitch signature order for folding into a printed booklet.

---

### 1.5 Geometry & Margins (Crop & Resize)
```typescript
static async cropDocument(
  buffer: ArrayBuffer | Uint8Array,
  margins: { top: number; bottom: number; left: number; right: number }
): Promise<Uint8Array>
```
- **Description**: Modifies `/MediaBox` and `/CropBox` vectors based on coordinate percentages.

```typescript
static async resizeDocument(
  buffer: ArrayBuffer | Uint8Array,
  targetSize: 'A3' | 'A4' | 'A5' | 'Letter' | 'Legal'
): Promise<Uint8Array>
```
- **Description**: Scales page contents proportionally to standard ISO or ANSI dimensional bounds.

---

### 1.6 Page Numbering & Watermarking
```typescript
static async addWatermark(
  buffer: ArrayBuffer | Uint8Array,
  options: {
    text: string;
    fontSize?: number;
    opacity?: number;
    rotation?: number; // In degrees (-180 to 180)
    color?: { r: number; g: number; b: number };
  }
): Promise<Uint8Array>
```

```typescript
static async addPageNumbers(
  buffer: ArrayBuffer | Uint8Array,
  options: {
    position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    format: string; // Token pattern: "Page {n} of {total}"
    fontSize?: number;
    startFrom?: number;
  }
): Promise<Uint8Array>
```

---

### 1.7 Cryptographic Security & Permissions
```typescript
static async encryptDocument(
  buffer: Uint8Array,
  userPassword?: string,
  ownerPassword?: string,
  permissions?: {
    printing?: 'highResolution' | 'lowResolution' | 'none';
    modifying?: boolean;
    copying?: boolean;
    annotating?: boolean;
    fillingForms?: boolean;
  }
): Promise<Uint8Array>
```
- **Description**: Applies AES-256 standard encryption handler (ISO 32000-2 Rev 6).

```typescript
static async unlockDocument(
  buffer: Uint8Array,
  password: string
): Promise<Uint8Array>
```
- **Description**: Authenticates owner or user password and strips encryption dictionary, returning clean decrypted PDF bytes.

---

### 1.8 Permanent Stream Redaction
```typescript
static async applyRedactions(
  buffer: Uint8Array,
  redactions: Array<{
    pageIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }>
): Promise<Uint8Array>
```
- **Description**: Eradicates text glyph objects and draws opaque black vector rectangles over target coordinates.

---

## 2. `AIService` (`src/services/aiService.ts`)

Zero-cloud, client-side heuristic semantic analysis and document classification engine.

### 2.1 Heuristic Document Analysis
```typescript
static analyzeDocumentLocally(
  fullText: string,
  pageTexts: string[]
): DocumentAnalysis
```
- **Returns**:
  ```typescript
  interface DocumentAnalysis {
    documentType: 'Legal Contract' | 'Financial Report' | 'Technical Manual' | 'Academic Paper' | 'General';
    summary: string;
    actionItems: string[];
    entities: Array<{ type: 'amount' | 'date' | 'email' | 'organization'; value: string }>;
    flashcards: Array<{ question: string; answer: string }>;
  }
  ```

### 2.2 Citation-Backed Semantic Q&A
```typescript
static answerQuery(
  query: string,
  pageTexts: string[]
): {
  answer: string;
  confidence: number;
  pageReferences: number[];
}
```
- **Description**: Keyword proximity search matching user queries against page text with exact page number citations.

---

## 3. `OCRService` (`src/services/ocrService.ts`)

Client-side optical character recognition via multi-threaded Tesseract.js Web Worker.

```typescript
static async recognizeImage(
  imageBlob: Blob | HTMLCanvasElement,
  language: string = 'eng',
  progressCallback?: (status: string, progress: number) => void
): Promise<{ text: string; confidence: number }>
```
- **Parameters**:
  - `language`: ISO language code (e.g. `'eng'`, `'deu'`, `'fra'`, `'spa'`).
  - `progressCallback`: Invoked on worker state transitions (`"loading tesseract core"`, `"recognizing text"`).

---

## 4. `StorageService` (`src/services/storageService.ts`)

Synchronous local browser persistence for user preferences.

```typescript
interface AppSettings {
  theme: 'system' | 'dark' | 'light';
  defaultDpi: number;
  recentTools: string[];
  customWatermarkHistory: string[];
}

static getSettings(): AppSettings;
static updateSettings(partial: Partial<AppSettings>): void;
static clearSettings(): void;
```
