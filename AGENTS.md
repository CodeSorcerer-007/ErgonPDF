# AGENTS.md — AI Agent Guidelines & Architecture Invariants

> Instructions, architectural constraints, and quality gates for AI agents (Claude, GPT, Gemini, Copilot, Antigravity) working within the ErgonPDF repository.

---

## 1. The Core Architectural Invariant

Whenever an AI agent generates, refactors, or reviews code in ErgonPDF, it **MUST NEVER** violate the following rule:

> 🚨 **NON-NEGOTIABLE PRIVACY INVARIANT**:
> **Zero document data or telemetry may leave the client device.**
> All PDF transformations, conversions, text recognition (OCR), redactions, and encryptions must execute strictly inside client memory via WebAssembly or pure JavaScript.
> 
> Never introduce backend processing servers, remote upload endpoints, telemetry loggers, or analytics trackers.

---

## 2. Repository Structure

```
ErgonPDF/
├── public/                 # Static assets, fonts (WOFF2), icons, sample PDFs, PDF.js worker
├── src/
│   ├── components/         # React UI modals, workspace components, header, error boundary
│   │   └── workspace/      # Dedicated tool view components
│   ├── config/
│   │   └── toolsRegistry.ts# Central single-source-of-truth for all 43 registered tools
│   ├── services/
│   │   ├── pdfEngine.ts    # Core pdf-lib / WebAssembly document manipulation functions
│   │   └── aiService.ts    # Client-side heuristic document analysis & query engine
│   ├── types/              # TypeScript interface definitions
│   ├── App.tsx             # Root application orchestrator
│   └── index.css           # Tailwind / CSS variables & design system
├── installer/              # Windows desktop installer system (Node.js serve.cjs, .bat files)
├── scripts/                # Automated verification suites: smoke-test.js, test-features.js, packaging
└── docs/                   # Architecture, Privacy, FAQ, Tools reference, Comparison guides
```

---

## 3. How to Add or Modify a PDF Tool

When implementing a new tool or enhancing an existing one:

1. **Registry Registration**:
   - Register the tool in `src/config/toolsRegistry.ts` with a unique `id`, `name`, `category`, and relevant search `intents`.
2. **Engine Implementation**:
   - Add the underlying PDF processing method to `src/services/pdfEngine.ts`.
   - Ensure the method accepts a `Uint8Array` or `ArrayBuffer` and returns a `Uint8Array` (or download blob).
   - Wrap operations in robust `try...catch` blocks with human-readable error messages.
3. **UI Integration**:
   - Implement or update the workspace component under `src/components/workspace/` or trigger through `src/components/UniversalWorkspace.tsx`.
4. **Verification**:
   - Add a unit test to `scripts/test-features.js`.
   - Verify registry and route discovery in `scripts/smoke-test.js`.

---

## 4. Verification & Quality Gates

Before declaring any task or PR complete, run the following verification commands:

```bash
# 1. Lint check
npm run lint

# 2. Strict TypeScript typecheck & production build
npm run build

# 3. PDF Engine Feature Integrity suite (20 core features)
npm run test-features

# 4. Comprehensive 85-point smoke test (HTTP, Engine, UI routes)
npm run smoke-test
```

All 4 steps must exit with code 0.

---

## 5. Coding Standards & Best Practices

- **Strict TypeScript**: Do not use `any` unless dealing with untyped third-party legacy APIs. Use explicit interfaces.
- **Offline Assets**: All fonts must be loaded locally from `/fonts/` via `@font-face` in `src/index.css`. Never load Google Fonts or CDNs over the network.
- **Clean Console Output**: Do not commit extraneous `console.log()` statements. Use `console.error` only inside caught exception handlers.
- **Cross-Platform Installer**: When modifying scripts in `installer/` or `scripts/`, ensure backward compatibility across Windows PowerShell, `cmd.exe`, and POSIX environments.
