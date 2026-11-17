/**
 * Multi-Page Thumbnail Selection & Shift-Click Range Selection Utilities
 * Pure functions supporting contiguous range selection, modifier toggles,
 * keyboard range extension, and anchor management for ErgonPDF UniversalWorkspace.
 */

export interface SelectionResult {
  selectedIndices: Set<number>;
  anchorIndex: number;
  activePageNum: number;
}

export interface SelectionPageItem {
  deleted?: boolean;
}

/**
 * Computes selection state when a thumbnail card is clicked.
 */
export function computePageClickSelection(
  pageNum: number,
  event: { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean } | undefined,
  currentPageNum: number,
  currentSelection: Set<number>,
  anchorIndex: number,
  pages: SelectionPageItem[]
): SelectionResult {
  const targetIndex = pageNum - 1;
  const isShift = Boolean(event?.shiftKey);
  const isCtrlOrCmd = Boolean(event?.ctrlKey || event?.metaKey);

  if (isShift) {
    const validAnchor = (anchorIndex >= 0 && anchorIndex < pages.length)
      ? anchorIndex
      : Math.max(0, Math.min(pages.length - 1, currentPageNum - 1));
    const start = Math.min(validAnchor, targetIndex);
    const end = Math.max(validAnchor, targetIndex);

    const rangeIndices = new Set<number>();
    if (isCtrlOrCmd) {
      currentSelection.forEach((idx) => rangeIndices.add(idx));
    }
    for (let i = start; i <= end; i++) {
      if (!pages[i]?.deleted) {
        rangeIndices.add(i);
      }
    }
    return {
      selectedIndices: rangeIndices,
      anchorIndex: validAnchor, // Retain anchor for subsequent Shift-clicks
      activePageNum: pageNum,
    };
  }

  if (isCtrlOrCmd) {
    const next = new Set(currentSelection);
    let nextActivePage = pageNum;
    let nextAnchor = targetIndex;

    if (next.has(targetIndex)) {
      if (next.size > 1) {
        next.delete(targetIndex);
        // If deselected page was the active page, shift preview to a remaining selected page
        if (currentPageNum === pageNum) {
          const remaining = Array.from(next);
          const fallbackIndex = remaining[remaining.length - 1];
          nextActivePage = fallbackIndex + 1;
          nextAnchor = fallbackIndex;
        } else {
          nextActivePage = currentPageNum;
          nextAnchor = anchorIndex;
        }
      }
    } else {
      next.add(targetIndex);
      nextActivePage = pageNum;
      nextAnchor = targetIndex;
    }

    return {
      selectedIndices: next,
      anchorIndex: nextAnchor,
      activePageNum: nextActivePage,
    };
  }

  // Non-modifier click: single selection, update anchor and active page
  return {
    selectedIndices: new Set([targetIndex]),
    anchorIndex: targetIndex,
    activePageNum: pageNum,
  };
}

/**
 * Computes selection state when a thumbnail checkbox is clicked/toggled.
 */
export function computeToggleSelectPage(
  index: number,
  options: boolean | { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean } | undefined,
  currentPageNum: number,
  currentSelection: Set<number>,
  anchorIndex: number,
  pages: SelectionPageItem[]
): SelectionResult {
  const isShift = typeof options === 'object' && Boolean(options?.shiftKey);
  const isCtrlOrCmd = typeof options === 'object' && Boolean(options?.ctrlKey || options?.metaKey);
  const pageNum = index + 1;

  if (isShift) {
    const validAnchor = (anchorIndex >= 0 && anchorIndex < pages.length)
      ? anchorIndex
      : Math.max(0, Math.min(pages.length - 1, currentPageNum - 1));
    const start = Math.min(validAnchor, index);
    const end = Math.max(validAnchor, index);

    const rangeIndices = new Set<number>();
    if (isCtrlOrCmd) {
      currentSelection.forEach((idx) => rangeIndices.add(idx));
    }
    for (let i = start; i <= end; i++) {
      if (!pages[i]?.deleted) {
        rangeIndices.add(i);
      }
    }
    return {
      selectedIndices: rangeIndices,
      anchorIndex: validAnchor,
      activePageNum: pageNum,
    };
  }

  const next = new Set(currentSelection);
  let nextActivePage = currentPageNum;
  let nextAnchor = index;

  if (next.has(index)) {
    if (next.size > 1) {
      next.delete(index);
      if (currentPageNum === pageNum) {
        const remaining = Array.from(next);
        const fallbackIndex = remaining[remaining.length - 1];
        nextActivePage = fallbackIndex + 1;
        nextAnchor = fallbackIndex;
      }
    }
  } else {
    next.add(index);
    nextActivePage = pageNum;
    nextAnchor = index;
  }

  return {
    selectedIndices: next,
    anchorIndex: nextAnchor,
    activePageNum: nextActivePage,
  };
}

/**
 * Computes selection state when Select All / Deselect is triggered.
 */
export function computeSelectAllPages(
  pages: SelectionPageItem[],
  currentSelection: Set<number>,
  currentPageNum: number
): { selectedIndices: Set<number>; anchorIndex: number; activePageNum: number } {
  const activeIndices = pages
    .map((p, i) => (!p.deleted ? i : -1))
    .filter((i) => i >= 0);

  const areAllActiveSelected = activeIndices.length > 0 &&
    activeIndices.every((i) => currentSelection.has(i));

  if (areAllActiveSelected) {
    // Deselect all -> collapse to current active page (or first active page)
    const fallbackIndex = !pages[currentPageNum - 1]?.deleted
      ? currentPageNum - 1
      : activeIndices[0] ?? 0;
    return {
      selectedIndices: new Set([fallbackIndex]),
      anchorIndex: fallbackIndex,
      activePageNum: fallbackIndex + 1,
    };
  }

  return {
    selectedIndices: new Set(activeIndices),
    anchorIndex: activeIndices[0] ?? 0,
    activePageNum: currentPageNum,
  };
}

/**
 * Computes selection state when keyboard navigation arrows / Home / End are pressed.
 */
export function computeKeyboardNavigation(
  key: string,
  shiftKey: boolean,
  currentPageNum: number,
  _currentSelection: Set<number> | undefined,
  anchorIndex: number,
  pages: SelectionPageItem[]
): SelectionResult | null {
  const activeIndices = pages
    .map((p, i) => (!p.deleted ? i : -1))
    .filter((i) => i >= 0);

  if (activeIndices.length === 0) return null;

  const currentIdx = currentPageNum - 1;
  let targetIdx = currentIdx;

  const currentPos = activeIndices.indexOf(currentIdx);

  switch (key) {
    case 'ArrowUp':
    case 'ArrowLeft':
    case 'PageUp': {
      if (currentPos > 0) {
        targetIdx = activeIndices[currentPos - 1];
      } else if (currentPos === -1) {
        targetIdx = activeIndices[0];
      }
      break;
    }
    case 'ArrowDown':
    case 'ArrowRight':
    case 'PageDown': {
      if (currentPos >= 0 && currentPos < activeIndices.length - 1) {
        targetIdx = activeIndices[currentPos + 1];
      } else if (currentPos === -1) {
        targetIdx = activeIndices[0];
      }
      break;
    }
    case 'Home': {
      targetIdx = activeIndices[0];
      break;
    }
    case 'End': {
      targetIdx = activeIndices[activeIndices.length - 1];
      break;
    }
    default:
      return null;
  }

  const validAnchor = (anchorIndex >= 0 && anchorIndex < pages.length)
    ? anchorIndex
    : currentIdx;

  if (shiftKey) {
    const start = Math.min(validAnchor, targetIdx);
    const end = Math.max(validAnchor, targetIdx);
    const range = new Set<number>();
    for (let i = start; i <= end; i++) {
      if (!pages[i]?.deleted) {
        range.add(i);
      }
    }
    return {
      selectedIndices: range,
      anchorIndex: validAnchor,
      activePageNum: targetIdx + 1,
    };
  }

  return {
    selectedIndices: new Set([targetIdx]),
    anchorIndex: targetIdx,
    activePageNum: targetIdx + 1,
  };
}
