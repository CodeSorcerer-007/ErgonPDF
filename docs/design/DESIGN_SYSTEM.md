# ERGONPDF MASTER DESIGN SYSTEM SPECIFICATION

> **ErgonPDF — Professional Document Workstation**  
> Desktop-First · Minimal · Precision-Focused · 100% Client-Side Privacy  
> Version: 1.2.0 | Design Language: Porcelain & Obsidian (Warm Editorial Precision)

---

## 1. Executive Summary & Design Vision

ErgonPDF is engineered as a zero-telemetry, desktop-first PDF workstation. The visual direction balances the architectural clarity of **Linear**, the quick-launch productivity of **Raycast**, and the tactile document fidelity of traditional archival typography.

### Core Philosophy: "Precision Document Workstation"
1. **Restrained Accent Palette**: Color is reserved for semantic state, explicit user actions, and security guarantees. No decorative neon gradients or playful toy-like shapes.
2. **Obsidian & Porcelain Surfaces**: 
   - **Porcelain** (`#F7F7F8`): Primary light workspace surface that eliminates pure-white browser glare while maintaining archival paper crispness.
   - **Obsidian** (`#0E0F12`): Primary dark workspace surface engineered from deep graphite/obsidian tones with warm undertones, avoiding blue-light eye strain.
3. **Desktop-First Ergonomics**: Designed for high-density information display, keyboard shortcuts (`⌘K`, `Ctrl+Z`, `Ctrl+Y`), rapid multi-file workflows, and distraction-free document inspection.
4. **Physical Fidelity**: The PDF document is treated as a physical sheet of paper on a drafting table, with crisp 1px borders, subtle ambient shadows, and authentic dimensional boundaries.

---

## 2. Design Tokens

### 2.1 Color System

#### Light Palette ("Porcelain")
| Token | Value | Semantic Role |
| :--- | :--- | :--- |
| `--bg-primary` | `#F7F7F8` | Canvas drafting ground (Porcelain) |
| `--bg-secondary` | `#FFFFFF` | Primary card, toolbar, and sheet surface |
| `--bg-tertiary` | `#EFEFEB` | Muted wash, hover states, segmented buttons |
| `--bg-elevated` | `#FFFFFF` | Floating dialogs, command palettes, popovers |
| `--bg-card` | `#FFFFFF` | Standard card container |
| `--border-subtle` | `#E3E3DE` | 1px internal dividers, soft borders |
| `--border-medium` | `#D0D0CA` | Container outlines, form input borders |
| `--border-strong` | `#9E9E96` | High-contrast structural boundaries |
| `--border-focus` | `#C84C32` | Accessible 2px keyboard focus ring |
| `--text-primary` | `#141414` | Primary titles, active labels, body copy |
| `--text-secondary`| `#4F4F4B` | Subheadings, descriptions, secondary copy |
| `--text-muted` | `#787872` | Technical metadata, shortcut badges, hints |
| `--text-inverse` | `#FFFFFF` | Text rendered on dark buttons/surfaces |

#### Dark Palette ("Obsidian")
| Token | Value | Semantic Role |
| :--- | :--- | :--- |
| `--bg-primary` | `#0E0F12` | Deep Obsidian dark desktop ground |
| `--bg-secondary` | `#16171B` | Primary card, panels, toolbars |
| `--bg-tertiary` | `#212328` | Hover highlights, inactive tabs, pill fills |
| `--bg-elevated` | `#262930` | Floating modals, dropdowns, command palette |
| `--bg-card` | `#16171B` | Standard card container |
| `--border-subtle` | `#25272E` | 1px internal dividers, soft borders |
| `--border-medium` | `#353842` | Form borders, card strokes |
| `--border-strong` | `#525664` | High-contrast boundaries |
| `--border-focus` | `#E05C42` | Terracotta focus ring |
| `--text-primary` | `#F4F4F5` | Primary headings, active values |
| `--text-secondary`| `#A1A1AA` | Secondary labels, descriptions |
| `--text-muted` | `#71717A` | Metadata, keyboard keys, inactive icons |
| `--text-inverse` | `#0E0F12` | High-contrast text on bright buttons |

#### Brand & Semantic Accents
| Token | Light Value | Dark Value | Purpose |
| :--- | :--- | :--- | :--- |
| `--accent-primary` | `#C84C32` (Terracotta) | `#E05C42` (Warm Clay) | Primary actions, brand mark, key buttons |
| `--accent-primary-hover`| `#B03E26` | `#F06E54` | Interactive hover state |
| `--accent-primary-light`| `rgba(200, 76, 50, 0.08)` | `rgba(224, 92, 66, 0.12)`| Accent badges, active selections |
| `--accent-secondary` | `#1E3A2F` (Forest) | `#2DD4BF` (Teal Sage) | Local security guarantee, privacy shield |
| `--accent-secondary-light`| `rgba(30, 58, 47, 0.08)` | `rgba(45, 212, 191, 0.12)`| Privacy indicators, verified badges |
| `--success` | `#166534` | `#4ADE80` | Success alerts, completed operations |
| `--warning` | `#B45309` | `#FBBF24` | Large file warnings, lossy compression notices |
| `--error` | `#DC2626` | `#F87171` | Validation errors, destructive actions |

---

### 2.2 Typography Scale

The typographic hierarchy marries an editorial serif title font (`Instrument Serif`) with a high-legibility geometric sans-serif for UI (`Plus Jakarta Sans`) and a monospace font for technical specifications (`JetBrains Mono`).

```css
--font-serif: 'Instrument Serif', Georgia, serif;
--font-heading: 'Instrument Serif', Georgia, serif;
--font-body: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
```

| Level | Size | Weight | Line Height | Tracking | Primary Font | Example Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Display | 48px - 62px | 400 | 1.10 | -0.02em | Serif | Main Home Hero Heading |
| Section Title | 28px - 34px | 400 | 1.18 | -0.015em | Serif | Tools Directory, Category Headers |
| Modal Title | 20px - 22px | 600 | 1.25 | -0.01em | Body Sans | Modal Headings, Drawer Headers |
| Card Title | 15px - 16px | 600 | 1.30 | -0.01em | Body Sans | Tool Card Titles, Workspace Sections |
| Body Regular | 13.5px - 14.5px | 400 | 1.55 | 0 | Body Sans | Tool descriptions, paragraph text |
| UI Small | 12px - 12.5px | 500 / 600 | 1.40 | 0 | Body Sans | Buttons, inputs, tab labels |
| Micro / Meta | 10.5px - 11px | 500 | 1.30 | +0.02em | Mono | Byte sizes, page numbers, coordinates |

---

### 2.3 Spacing & Sizing Scale

A consistent 4px baseline grid ensures alignment across all viewports.

| Token | Dimension | Common Use |
| :--- | :--- | :--- |
| `--space-1` | 4px | Internal badge padding, icon gap |
| `--space-2` | 8px | Button inline gap, compact padding |
| `--space-3` | 12px | Dropdown items, tool header padding |
| `--space-4` | 16px | Card padding, toolbar horizontal spacing |
| `--space-5` | 20px | Workspace margins, modal body padding |
| `--space-6` | 24px | Section gaps, grid layout gutters |
| `--space-8` | 32px | Component separation, hero padding |
| `--space-10`| 40px | Workspace canvas canvas padding |
| `--space-12`| 48px | Home section division |
| `--space-16`| 64px | Home hero bottom spacing |

---

### 2.4 Elevation & Architectural Shadows

Rather than muddy, diffuse shadows, ErgonPDF uses crisp structural borders supplemented by subtle ambient contact shadows:

```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-md: 0 4px 8px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
--shadow-lg: 0 12px 20px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
--shadow-xl: 0 24px 32px -6px rgba(0, 0, 0, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.04);
```

---

### 2.5 Radii (Corners)

Sharp architectural corners retain a precision drafting aesthetic:

- `--radius-xs`: 3px (small badges, micro indicators)
- `--radius-sm`: 5px (buttons, input fields, dropdown items)
- `--radius-md`: 8px (tool cards, preview cards, property panels)
- `--radius-lg`: 12px (modals, hero dropzone, main container)
- `--radius-full`: 9999px (circular pill badges, progress bar tracks)

---

## 3. High-Priority Information Architecture & Layout Regions

### 3.1 Home Screen Hierarchy (Desktop-First)
The ErgonPDF home screen implements a strict 8-level operational hierarchy:
1. **Application Header**: Wordmark (`Ergon` Serif + `PDF` sans), version pill (`v1.2.0`), desktop navigation (`Tools`, `AI Studio`, `Batch Queue`, `Compare`, `Docs`), `⌘K` command shortcut, `100% Local` privacy indicator, theme toggle, and workspace settings.
2. **Searchable Command & Intent Discovery**: Dual-intent natural language query field embedded directly within the drafting stage.
3. **Large Drag-and-Drop Ingestion Area**: Architectural physical sheet container with drag-over elevation, non-blocking large-file memory warnings (`>50MB`), invalid format alerts, and indeterminate WebAssembly parsing feedback.
4. **Frequently Used Tools (Priority Shelf)**: Elevated 8-tool grid with prominent terracotta badges (`★ Most Popular`) for instant one-click action execution (Merge, Compress, Edit, Convert, Sign, OCR, Protect, Split).
5. **Recently Opened Documents (`RecentFilesBar`)**: Local file session cards showing thumbnail, filename, last performed action, byte size, and time elapsed.
6. **Categorized PDF Tool Directory (`ToolsGrid`)**: Complete 126-tool utilitarian directory organized into operational workflows with live search, category pills, and favorites filter.
7. **Privacy Status Indicators**: Unobtrusive emerald badges verifying zero server communication and pure client-side WebAssembly memory operations.
8. **Application Version & Settings Access**: Accessible from both sticky header and grounded footer.

### 3.2 Universal Workspace Three-Region Layout + Status Bar
The document workspace features four distinct regions:
1. **Top Control Strip**: Home navigation breadcrumb, active file name, document size, undo/redo (`Ctrl+Z` / `Ctrl+Y`), page navigation stepper, zoom controls, dynamic fit-to-width/fit-to-page, and one-click PDF export.
2. **Left Document Pages Rail (`ThumbnailSidebar`)**:
   - Collapsible between 240px and 40px width.
   - Miniature page canvases with 90° rotation indicators and page numbers.
   - Multi-page selection via Shift-click and Ctrl/Cmd-click with dedicated batch action toolbar (batch rotate, batch delete).
   - Drag-and-drop page reordering with visual drop indicator.
3. **Center Document Preview Stage**:
   - Dynamic viewport-bounded scaling calculation (`fit-to-width` and `fit-to-page`).
   - High-fidelity PDF.js raster rendering on physical white paper backdrop.
   - Overlay drawing canvas for freehand annotations, placed digital signatures, and vector blackouts.
4. **Right Contextual Properties Panel**:
   - Collapsible between 320px and 40px width.
   - Active tool dropdown selector with canonical registry ID synchronization.
   - Tool-specific controls or standardized universal parameters panel (title, category badge, description, document requirements, execution trigger).
5. **Persistent Desktop Status Bar**:
   - Grounded 28px bottom strip.
   - Left: Engine state (Ready green dot / Processing amber pulse) and active page physical dimensions (`width × height pt` and inches).
   - Center: Security statement (`WASM Engine • 0B Telemetry • In-Memory Client Execution`).
   - Right: Page count, current zoom percentage, and 100% Local privacy badge.

---

## 4. Accessibility & Standards Compliance

- **WCAG 2.1 AA Contrast**: All text tokens exceed 4.5:1 against their respective surface backgrounds (large headings exceed 3:1).
- **Visible Keyboard Focus**: Uniform `:focus-visible` styling using a 2px solid terracotta ring (`--border-focus`) with 2px offset.
- **ARIA Landmark & Roles**: All dialogs, regions, toolbars, and tablists include descriptive `aria-label`, `role`, and `aria-describedby` tags.
- **Reduced Motion Support**: All CSS transitions collapse to 0.01ms when `@media (prefers-reduced-motion: reduce)` is detected.
