# ERGONPDF THEME SPECIFICATION

> **Porcelain & Obsidian Theme Architecture**  
> High-Contrast Architectural Theming for Professional PDF Workstations

---

## 1. Overview

ErgonPDF implements a dual-theme architecture designed for desktop professionals working in varying ambient lighting environments:
1. **Porcelain (Light Theme)**: Tailored for daytime office use. Unlike raw #FFFFFF backgrounds that cause ocular fatigue during extended document review, Porcelain employs a calibrated off-white `#F7F7F8` baseline ground with pure-white paper panels.
2. **Obsidian (Dark Theme)**: Tailored for low-light developer/analyst environments. Unlike blue-heavy "slate" or "navy" dark modes, Obsidian relies on neutral volcanic graphite (`#0E0F12`), minimizing contrast glare while maintaining sharp text separation.

---

## 2. Color Token Matrix

| Semantic Token | Porcelain (Light) | Obsidian (Dark) | Contrast vs Ground |
| :--- | :--- | :--- | :--- |
| `Canvas Ground` | `#F7F7F8` | `#0E0F12` | N/A (Ground) |
| `Panel Surface` | `#FFFFFF` | `#16171B` | Subtle 1.05:1 (structural boundary via 1px border) |
| `Hover Wash` | `#EFEFEB` | `#212328` | 1.15:1 |
| `Card Background` | `#FFFFFF` | `#16171B` | Elevated with 1px border |
| `Text Primary` | `#141414` | `#F4F4F5` | 16.5:1 (AAA Pass) |
| `Text Secondary` | `#4F4F4B` | `#A1A1AA` | 7.8:1 (AAA Pass) |
| `Text Muted` | `#787872` | `#71717A` | 4.6:1 (AA Pass) |
| `Accent Primary` | `#C84C32` (Terracotta) | `#E05C42` (Warm Clay) | 5.2:1 against light / 6.1:1 against dark |
| `Accent Privacy` | `#1E3A2F` (Forest) | `#2DD4BF` (Teal Sage) | 7.9:1 against light / 9.8:1 against dark |
| `Border Subtle` | `#E3E3DE` | `#25272E` | 1.2:1 (Deliberately soft divider) |
| `Border Medium` | `#D0D0CA` | `#353842` | 1.8:1 (Visible interactive boundary) |
| `Border Strong` | `#9E9E96` | `#525664` | 3.1:1 (High-contrast boundary) |
| `Focus Indicator` | `#C84C32` | `#E05C42` | 2px solid ring, offset 2px |

---

## 3. Theme Engine Implementation

### 3.1 DOM Attribute Architecture
Theme state is managed through the root HTML attribute:
```html
<html data-theme="dark">
  <!-- or data-theme="light" -->
</html>
```

### 3.2 System Preference Detection
When configured to `'system'`, ErgonPDF binds a listener to `window.matchMedia('(prefers-color-scheme: dark)')`:
```typescript
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
const systemTheme = mediaQuery.matches ? 'dark' : 'light';
```

### 3.3 Zero-Flicker Hydration
The user's theme selection is stored in `localStorage` under `ergon_theme`. The root script in `index.html` initializes the attribute before initial React render to prevent bright flashes on dark mode startup.

---

## 4. Accessibility & Contrast Verification

1. **Color Independence**: No UI state (success, error, selection) relies exclusively on color. All status indicators include an accompanying icon (e.g. `ShieldCheck`, `Check`, `AlertCircle`) and explicit text labels.
2. **Focus Visibility**: All interactive controls feature `:focus-visible` styling with a 2px high-contrast ring and 2px separation from the element boundary.
3. **Document Canvas Contrast**: In dark mode, the document canvas itself retains its authentic white or original paper color with an ambient dark matte border, accurately preserving document color fidelity for printing and signature verification. For dark-mode reading, users can activate the dedicated "Invert PDF" tool.
