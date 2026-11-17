# ERGONPDF MOTION DESIGN SPECIFICATION

> **ErgonPDF — Motion Design Language & Microinteraction Standards**  
> Desktop-First Document Workstation | Functional Motion Doctrine

---

## 1. Core Principles of Functional Motion

ErgonPDF enforces a strict **"Perform, Don't Decorate"** motion standard:
1. **Purpose-Driven Timing**: Animations exist solely to establish spatial continuity, signal state changes, or provide direct physical feedback to user gestures.
2. **Speed & Snappiness**: Desktop interactions must feel instantaneous. Animation durations are capped at **120ms to 200ms** for microinteractions, and **180ms to 240ms** for structural layout shifts.
3. **Hardware Friendliness**: Zero continuous idle CPU loops. Animations rely entirely on GPU-composited CSS properties (`transform`, `opacity`). Large canvas elements are never continuously transformed during rendering.
4. **Strict Accessibility Compliance**: Under `@media (prefers-reduced-motion: reduce)`, all transitions drop to `0.01ms`, removing all scale, slide, and zoom effects.

---

## 2. Motion Tokens & Easing Curves

```css
:root {
  /* Mechanical Easing Curves */
  --ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-out-cubic: cubic-bezier(0.215, 0.61, 0.355, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.15);

  /* Duration Standards */
  --duration-instant: 80ms;   /* Button clicks, toggle switches */
  --duration-fast: 120ms;      /* Hover states, tab switches, badge fades */
  --duration-normal: 180ms;    /* Card hovers, dropdown menus, alert entrances */
  --duration-structural: 240ms;/* Modals, drawer openings, sidebar collapse */
}
```

---

## 3. Microinteraction Specifications

### 3.1 File Ingestion
- **Drag-Over State**:
  - Border transitions smoothly from dashed `var(--border-medium)` to solid `var(--accent-primary)`.
  - Background tints to `var(--bg-tertiary)` (`transition: background 150ms ease, border-color 150ms ease`).
  - Subtle upward float of document icon (`transform: translateY(-2px)`).
- **File Drop Confirmation**:
  - Container performs a brief pulse compression (`scale(0.995)` for 80ms, then settling to `scale(1)`).
  - Transition immediately hands off to the inspection state.

### 3.2 Tool Interactions & Cards
- **Card Hover**:
  - Lift: `transform: translateY(-2px);`
  - Border color: transitions to `var(--border-strong)`.
  - Shadow: shifts from `--shadow-xs` to `--shadow-md` in `140ms`.
- **Button Press Feedback**:
  - On `:active`, button compresses to `scale(0.985)` with zero lag.
  - Releases with an immediate return to `scale(1)`.

### 3.3 Workspace & Canvas Interactions
- **Sidebar Collapse & Expansion**:
  - Thumbnail rail and tool properties panel collapse from default width to 40px with `transition: width var(--transition-normal)`.
  - Icon-and-vertical-label state morphs without canvas jarring.
- **Thumbnail Page Selection**:
  - Active thumbnail border expands from 1px to 2px solid `var(--accent-primary)`.
  - Multi-selection triggers batch actions bar entrance via `120ms ease-out`.
  - Thumbnail outline transition: `120ms ease-out`.
- **Page Reordering Feedback**:
  - Visual insertion marker (`2px solid var(--accent-primary)`) appears smoothly between cards.
- **Zoom Transitions**:
  - Discrete steppers update canvas width/height cleanly.
  - Scale transforms on canvas elements are avoided during high-resolution PDF rendering to prevent blurry raster scaling artifacts.

### 3.4 Processing & Ingestion States
- **File Ingestion Indeterminate Track**:
  - Ingestion progress bar runs `@keyframes indeterminate-progress` with smooth cubic-bezier travel (`1.4s infinite`).
- **Determinate Progress**:
  - Smooth progress bar with `transition: width 150ms ease-out`.
  - Explicit stage label updates (e.g. "Extracting streams…", "Losslessly compressing…").
- **Indeterminate Progress**:
  - Controlled rotation spinner: `animation: spin 800ms linear infinite`.
- **Success Feedback**:
  - Checkmark morph / appearance with soft scale entrance.
  - Confetti trigger for major batch/export milestones.

### 3.5 Navigation & Overlays
- **Modals & Command Palette**:
  - Backdrop fade-in: `opacity: 0 -> 1` in `160ms`.
  - Modal container entrance: `scale(0.98) -> scale(1.0)` with `opacity: 0 -> 1` in `160ms ease-out`.
- **Dropdowns & Popovers**:
  - Dropdown opens with `translateY(-4px) -> translateY(0)` and `opacity: 0 -> 1` in `120ms`.

---

## 4. Reduced Motion & Performance Guards

All motion rules are wrapped with a global reduced motion override in `src/index.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

No heavy full-page backdrop blur filters are animated during rapid scrolling or canvas interaction to ensure locked 60fps desktop rendering.
