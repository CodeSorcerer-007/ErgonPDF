# ERGONPDF COMPONENT SPECIFICATION

> **ErgonPDF — Component Specifications & Standardized API**  
> Desktop-First Document Architecture | React 19 + TypeScript

---

## 1. Overview

This document specifies the behavior, styling, variants, keyboard accessibility, and state machines for all core UI components across ErgonPDF.

---

## 2. Component Inventory & Standards

### 2.1 Buttons (`.btn`)
Standardized button classes defined in `src/index.css`:

#### Variants
- `.btn-primary`: High-contrast obsidian/porcelain inverted button for primary actions (e.g. "Export PDF", "Execute").
- `.btn-accent`: Terracotta brand color (`--accent-primary`) for distinct creation or highlighted operations.
- `.btn-secondary`: Clean bordered surface (`--bg-secondary` with `--border-subtle`) for standard utility actions.
- `.btn-outline`: Transparent background with border for secondary choices.
- `.btn-ghost`: Borderless, subtle hover tint for navigation and icon buttons.
- `.btn-danger`: Soft red fill with red border, transitioning to solid red on hover.

#### Sizing
- `.btn-sm`: Height 28px, padding 4px 10px, font 12px, radius 4px.
- Default: Height 34px, padding 6px 14px, font 13.5px, radius 6px.
- `.btn-lg`: Height 42px, padding 10px 20px, font 15px, radius 8px.
- `.btn-icon`: Uniform square aspect (28x28px or 34x34px) with centered icon.

#### Interactive Micro-State
- `hover`: Light background shift + 1px border shift.
- `active`: Tactile compression `transform: scale(0.985);`.
- `disabled`: `opacity: 0.45; cursor: not-allowed; pointer-events: none;`.

---

### 2.2 Form Inputs & Controls

#### Text Input & Search Fields
- Height: 34px (standard), 40px (hero search).
- Background: `var(--bg-secondary)`.
- Border: `1px solid var(--border-medium)`.
- Focus state: `outline: 2px solid var(--border-focus); outline-offset: 1px;`.
- Font: `var(--font-body)`, 13.5px.
- Placeholder: `var(--text-muted)`.

#### Select Dropdown (`.select-tool-dropdown`)
- Clean native or styled select with custom SVG chevron.
- Padding: 8px 12px.
- Border radius: `var(--radius-md)`.
- Grouped with `<optgroup>` tags for semantic workflow navigation.

#### Range Sliders
- Custom track with height 4px, background `var(--border-medium)`.
- Thumb: 14px circle, background `var(--accent-primary)`, border 2px solid `var(--bg-secondary)`.

---

### 2.3 Tool Cards & Priority Shelf (`.tool-card`, `FrequentlyUsedShelf`)
The fundamental discovery unit for the 126 PDF tools.

#### Frequently Used Shelf (`FrequentlyUsedShelf.tsx`)
- Elevated 8-tool grid displayed prominently on the home screen above recent documents.
- Accentuated with `.tool-card-popular` styling featuring a 4px terracotta accent bar on the left edge.
- Shows tool icon, title, description, category badge, and interactive "Open" prompt.

#### Tool Card Layout
- Fixed or responsive grid cell: min 260px width.
- Padding: 18px 20px.
- Border: `1px solid var(--border-subtle)`.
- Radius: `var(--radius-md)`.
- Background: `var(--bg-card)`.

#### Visual Hierarchy
1. **Header Row**:
   - Monochromatic 36x36px icon block (`var(--bg-tertiary)` with 1px border).
   - Right metadata cluster: Popular badge / New badge + Star favorite toggle button.
2. **Title & Body**:
   - Title: 15px, semibold, `var(--text-primary)`.
   - Description: 12.5px, 2 lines max, `var(--text-secondary)`, line-height 1.48.
3. **Footer Row**:
   - Left: `100% Local` privacy guarantee in mono font.
   - Right: Interactive arrow indicator with "Open" prompt.

---

### 2.4 Header & Main Navigation

#### Structure
- Sticky top: `position: sticky; top: 0; z-index: 50;`.
- Background: `var(--bg-secondary)` with `backdrop-filter: blur(8px)`.
- Height: 54px.
- Left: Brand mark (`E` glyph in terracotta tile) + Wordmark ("Ergon" Serif + "PDF" sans) + version pill badge.
- Center: Quick navigation links (Tools, AI Studio, Batch Queue, Compare, Docs).
- Right:
  - Command palette quick trigger button with `⌘K` keyboard hint.
  - 100% Local privacy badge with emerald shield icon.
  - Theme toggle (Dark / Light).
  - Settings drawer trigger.
  - GitHub link.

---

### 2.5 File Ingestion Dropzone (`.paper-sheet-container`)

#### Physical Sheet Design
- Resembles an architectural paper document resting on the drafting table.
- Border: 1.5px dashed `var(--border-medium)`.
- Background: `var(--bg-secondary)`.
- Interactive States:
  - **Idle**: Subtle hover shadow, sheet icon centered.
  - **Drag-Over**: Border switches to solid `var(--accent-primary)`, background shifts to `var(--bg-tertiary)`, scale 1.005.
  - **Processing / Ingesting**: Animated indeterminate progress bar, document metadata inspection.
- Large-File Warning Banner:
  - If a file exceeds 50MB, a non-blocking advisory banner warns of high browser memory usage while assuring offline execution.
- Invalid File Banner:
  - Accessible error callout when non-PDF/non-image files are dropped.

---

### 2.6 Universal Workspace (Four-Region Architecture + Status Bar)

#### Region 1: Left Thumbnail Sidebar (`ThumbnailSidebar.tsx`)
- Collapsible rail (240px expanded, 40px collapsed).
- Miniature canvas renderings of all pages in the document.
- Operations:
  - Single-click to select active page.
  - Multi-page selection via Shift-click and Ctrl/Cmd-click.
  - Multi-selection batch toolbar: "Select All", "Rotate Selected", "Delete Selected".
  - Drag-and-drop reordering with visual insertion bar.
  - Per-page quick actions: Rotate 90° clockwise, Duplicate page, Delete page.
  - Page number badge and dynamic rotation badge.

#### Region 2: Center Document Preview Canvas
- Clean drafting ground with neutral padding and container ref bounding.
- Center stage: White physical paper representation with subtle ambient drop shadow.
- Dynamic Viewport Bounding:
  - `Fit-to-Width`: dynamically measures `containerWidth / pageWidth` based on active rotation.
  - `Fit-to-Page`: dynamically measures `min(containerWidth / pageWidth, containerHeight / pageHeight)`.
  - Manual zoom range: 40% to 250% (or reset to 100% via `Ctrl+0`).
- Top control strip:
  - Return to Home breadcrumb.
  - Document Title & byte size metadata.
  - Undo (`Ctrl+Z`) and Redo (`Ctrl+Y`).
  - Page stepper with direct keyboard navigation (`ArrowLeft`/`ArrowRight`, `PageUp`/`PageDown`, `Home`/`End`).
  - Zoom steppers, Fit Width, Fit Page, and Rotate Page.
  - AI Studio modal trigger.
  - Export PDF primary action.

#### Region 3: Right Contextual Properties Panel
- Collapsible rail (320px expanded, 40px collapsed).
- Houses the active tool's controls or standardized universal panel.
- Smart tool dropdown with canonical registry ID synchronization.
- Standardized Fallback Panel: Any of the 126 tools lacking a custom panel automatically renders a clean parameters panel with tool metadata, page count, document size, and execution button.

#### Region 4: Persistent Desktop Status Bar (`.workspace-status-bar`)
- 28px bottom status bar providing continuous operational feedback:
  - Engine status dot: Ready (green) or Processing (amber pulse).
  - Page physical dimensions in points and inches (e.g. `612 × 792 pt (8.5" × 11.0")`).
  - Architecture guarantee: `WASM Engine • 0B Telemetry • In-Memory Client Execution`.
  - Page index: `Page X of Y`.
  - Current zoom percentage.
  - 100% Local privacy badge.

---

### 2.7 Modals & Dialogs
- Backdrop: `rgba(0, 0, 0, 0.65)` with `backdrop-filter: blur(6px)`.
- Container: `.glass-panel` with `box-shadow: var(--shadow-xl)` and `border-radius: var(--radius-lg)`.
- Animation: `scaleIn` (150ms ease-out).
- Escape key listener and backdrop click to dismiss.
- Focus trap: Keyboard focus cycles within dialog controls.

---

### 2.8 Command Palette (`CommandPalette.tsx`)
- Trigger: Global `⌘K` or `Ctrl+K`.
- Fast fuzzy search matching tool names, categories, and natural language intents (e.g., "shrink", "combine", "blackout").
- Direct keyboard navigation (`ArrowUp`, `ArrowDown`, `Enter`).
- Categorized result sets (PDF Tools, Navigation, System Settings).

---

### 2.9 Empty States & Loading Skeletons
- Empty states feature clean typographic messages with a secondary call-to-action button rather than oversized cartoon illustrations.
- Loading states employ subtle pulse animation on `var(--bg-tertiary)` blocks matching the geometry of the upcoming content.
