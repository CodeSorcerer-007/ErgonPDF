# ADR 006: Centralized Single-Source Tool Registry & Universal Workspace Pattern

**Status:** `ACCEPTED`  
**Date:** November 2026  
**Deciders:** ErgonPDF Core Architecture Team & Frontend Engineers  

---

## Context

Managing a suite of 126 individual document tools introduces significant code organization and routing challenges:
1. **Route Explosion**: Hardcoding 126 distinct React page routes or navigation handlers creates massive bundle bloat, redundant boilerplate, and fragile route synchronizations.
2. **Search & Command Palette Coupling**: The global search bar, category filters, and keyboard shortcut intent parser (`Ctrl + K`) need consistent metadata (name, description, category, tags, keywords, icon).
3. **Workspace Inconsistency**: If every tool implements its own bespoke canvas viewer, document loader, page navigator, and download banner, the UI feels fragmented and difficult to maintain.

---

## Decision

We establish two foundational architectural patterns:
1. **Centralized Single-Source-of-Truth Registry (`src/config/toolsRegistry.ts`)**:
   - Every tool is declared as a strongly-typed `ToolDefinition` containing `id`, `name`, `description`, `category`, `icon`, `intents`, and display badges.
   - All navigation components (Category directory, Search filter, Command Palette, Workspace mode selector, and Smoke Test suites) consume this single registry.
2. **Universal Workspace Pattern (`src/components/UniversalWorkspace.tsx`)**:
   - A unified document canvas orchestrator providing standardized file ingestion, drag-and-drop loading, multi-page canvas rendering, thumbnail grids, page reordering, zoom controls, and export banners.
   - Tools are implemented as modular, stateless action controllers (`ToolActionPanel`) plugged directly into the Universal Workspace context or rendered in specialized modals (`MergeModal`, `SplitModal`, `CameraScanModal`).

```text
               +---------------------------------------------+
               |        src/config/toolsRegistry.ts          |
               |     (Single Source of Truth - 126 Tools)    |
               +---------------------------------------------+
                                      |
         +----------------------------+----------------------------+
         |                            |                            |
         v                            v                            v
+------------------+         +------------------+         +------------------+
| Command Palette  |         | Home Directory   |         | Universal        |
| (Ctrl+K Intent)  |         | & Category Tabs  |         | Workspace Router |
+------------------+         +------------------+         +------------------+
                                                                   |
                                      +----------------------------+
                                      |
                                      v
                      +-------------------------------+
                      |      Universal Workspace      |
                      |  - Shared Document Viewport   |
                      |  - Synchronized Thumbnails    |
                      |  - Unified Export Action Bar  |
                      +-------------------------------+
                                      |
                      +---------------+---------------+
                      |                               |
                      v                               v
          +-----------------------+       +-----------------------+
          | Modular Action Panels |       | Modal Workflows       |
          | (Watermark, N-Up,     |       | (Merge, Split,        |
          |  Booklet, Encrypt...) |       |  Camera Scan...)      |
          +-----------------------+       +-----------------------+
```

---

## Consequences

### Positive
- **Scalability**: Adding a new tool requires only registering its metadata in `toolsRegistry.ts` and wiring its action handler.
- **Flawless Search Discovery**: Users searching by synonym (e.g. searching "shrink" finds "Compress PDF", searching "lock" finds "Encrypt PDF") immediately discover the relevant tool via registered `intents`.
- **Automated Test Auditability**: The test harness (`scripts/smoke-test.js` and `scripts/audit-tools.js`) dynamically verifies that all 126 registry entries resolve to functional UI handlers.

### Negative & Mitigations
- **Registry Schema Discipline**: All contributors must adhere to strict TypeScript interfaces (`ToolDefinition`) and avoid adding ad-hoc metadata.  
  *Mitigation*: TypeScript compiler checks and oxlint rules enforce schema compliance.
