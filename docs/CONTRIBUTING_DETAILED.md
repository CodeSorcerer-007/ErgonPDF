# Detailed Developer & Contributor Guide

> A comprehensive walkthrough for setting up your development environment, creating new PDF tools, testing engines, and submitting contributions to ErgonPDF.

---

## 1. Quick Start Development Environment

### Prerequisites
- **Node.js**: Version 18.0.0 or higher (Node 20+ LTS recommended)
- **Git**: Installed and configured
- **Operating System**: Windows, macOS, or Linux (Windows required to test the native batch installer)

### Setup
```bash
# 1. Clone repository
git clone https://github.com/CodeSorcerer-007/ErgonPDF.git
cd ErgonPDF

# 2. Clean install dependencies
npm ci

# 3. Start development server
npm run dev
```

The Vite dev server will spin up on `http://127.0.0.1:5173/`.

---

## 2. Architectural Blueprint

Every tool in ErgonPDF is defined across three modular tiers:

```
[Tool Registry (Metadata)] ──> [Workspace UI Component] ──> [PDF Engine Service (WASM/JS)]
  src/config/toolsRegistry.ts    src/components/workspace/     src/services/pdfEngine.ts
```

### 1. The Registry (`src/config/toolsRegistry.ts`)
Defines the tool ID, human-readable name, short name, description, category, Lucide icon, and search intents for the command palette.

### 2. The PDF Engine (`src/services/pdfEngine.ts`)
Encapsulates low-level byte manipulations using `pdf-lib`, Web Crypto, or Tesseract.js. Functions here should be pure, accept typed input buffers, and return updated byte arrays.

### 3. The UI Component (`src/components/workspace/`)
Provides interactive preview, parameter sliders, drop zones, progress indicators, and download triggers.

---

## 3. Step-by-Step Guide: Adding a New PDF Tool

Let's say you want to add a tool called **"Invert Colors"** (`invert-pdf`):

### Step 1: Register in `toolsRegistry.ts`
```typescript
{
  id: 'invert-pdf',
  name: 'Invert PDF Colors',
  shortName: 'Invert Colors',
  description: 'Invert page background and foreground colors for high-contrast dark reading.',
  category: 'edit',
  iconName: 'Moon',
  intents: ['invert', 'dark mode', 'high contrast', 'reverse colors'],
  processingMode: 'local',
}
```

### Step 2: Implement Method in `pdfEngine.ts`
```typescript
static async invertPdfColors(pdfBytes: Uint8Array): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  // Perform transformation logic...
  return await pdfDoc.save();
}
```

### Step 3: Wire into `UniversalWorkspace.tsx`
Create a dedicated component under `src/components/workspace/InvertPdfTool.tsx` and render it when `activeTool.id === 'invert-pdf'`.

### Step 4: Add Automated Unit Tests
Add an assertion in `scripts/test-features.js` to ensure the function produces valid PDF bytes without throwing errors.

---

## 4. Automated Testing & Verification

We enforce zero-regression test gates:

```bash
# Typecheck & build bundle
npm run build

# Fast linter audit
npm run lint

# Feature integrity suite (validates 20 core PDF engine operations)
npm run test-features

# Full 85-point smoke test (validates all 43 tools, UI routes, and health probes)
npm run smoke-test
```

---

## 5. Packaging the Windows Desktop Installer

To verify the standalone Windows desktop distribution package:

```bash
npm run package:windows
```

This compiles a clean release zip at `release/ErgonPDF-v1.2.0-Windows-Setup.zip` containing the installer scripts, local static server, and pre-built distribution assets.

---

## 6. Commit Message Conventions

We adhere to the [Conventional Commits](https://www.conventionalcommits.org/) standard:
- `feat(tool): add invert colors tool`
- `fix(ocr): handle multi-column bounding boxes`
- `docs(faq): document air-gap setup instructions`
- `perf(engine): optimize pdf-lib memory allocation during merge`
- `chore: update dependencies`

---

## 7. Submitting a Pull Request

1. Fork the repo and create a feature branch (`git checkout -b feat/my-new-tool`).
2. Implement your changes and verify with `npm run build && npm run smoke-test`.
3. Push to your branch and open a PR against `main`.
4. Complete the PR checklist defined in `.github/pull_request_template.md`.
