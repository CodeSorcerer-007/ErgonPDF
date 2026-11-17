# ErgonPDF Developer Getting Started Guide

Welcome to the ErgonPDF developer guide. This document walks you through setting up your local environment, understanding the repository architecture, creating a new tool, and running the verification pipeline.

---

## 1. Prerequisites

Before starting, ensure your machine has the following tools installed:

- **Node.js**: Version 18.0.0 or higher (Node 20 or 22 LTS recommended).
- **npm**: Version 9.0.0 or higher.
- **Git**: Latest version.
- **Optional**: `just` command runner (`cargo install just` or `choco install just`).

---

## 2. Environment Setup

```bash
# 1. Clone repository
git clone https://github.com/CodeSorcerer-007/ErgonPDF.git
cd ErgonPDF

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser. Any edits made in `src/` will hot-reload automatically.

---

## 3. Project Architecture Tour

```text
ErgonPDF/
├── src/
│   ├── config/
│   │   └── toolsRegistry.ts    # Single source of truth for all 126 tools
│   ├── services/
│   │   ├── pdfEngine.ts        # Core pdf-lib & WASM transformation functions
│   │   ├── aiService.ts        # In-memory heuristic NLP & entity parser
│   │   ├── ocrService.ts       # Local Tesseract.js Web Worker manager
│   │   └── storageService.ts   # Local browser preference persistence
│   ├── components/
│   │   ├── UniversalWorkspace.tsx # Central canvas workspace & action router
│   │   ├── workspace/          # Tool panels (Watermark, NUp, Booklet, etc.)
│   │   └── modals/             # Specialized modal dialogs (Merge, Split, etc.)
│   ├── types/                  # TypeScript interface contracts
│   └── App.tsx                 # Root application layout & route state
├── installer/                  # Windows desktop launcher daemon & scripts
├── scripts/                    # Verification suites (test-features.js, smoke-test.js)
└── docs/                       # Architecture, ADRs, and operational guides
```

---

## 4. How to Add a New PDF Tool

To add a new tool, follow this 4-step workflow:

### Step 1: Register in `toolsRegistry.ts`
Open `src/config/toolsRegistry.ts` and append your tool definition:
```typescript
{
  id: 'my-custom-tool',
  name: 'Custom Processor',
  description: 'Applies specialized transformations to PDF streams.',
  category: 'organize',
  icon: 'Wrench',
  intents: ['custom', 'processor', 'transform'],
  tags: ['experimental']
}
```

### Step 2: Implement Engine Logic in `pdfEngine.ts`
Add a static method to `PDFEngineService`:
```typescript
static async myCustomTransform(buffer: Uint8Array): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer);
  // Perform page modifications...
  return await doc.save();
}
```

### Step 3: Wire UI Action in `UniversalWorkspace.tsx`
Add your tool panel to `src/components/workspace/` or bind an action button in `UniversalWorkspace.tsx`.

### Step 4: Verify with Tests
1. Add an integrity assertion in `scripts/test-features.js`.
2. Run `npm run smoke-test` to confirm the route is registered and discovered.

---

## 5. Running the Verification Quality Gates

ErgonPDF enforces four non-negotiable verification gates before any PR can be merged:

```bash
# Gate 1: Linter
npm run lint

# Gate 2: Strict Typecheck & Build
npm run build

# Gate 3: Engine Integrity (25 Core Features)
npm run test-features

# Gate 4: HTTP & Route Smoke Test (168 Points)
npm run smoke-test
```

All four gates must exit with code `0`.
