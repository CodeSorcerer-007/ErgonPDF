// Comprehensive Test Suite for Multi-Page Selection, Shift-Click Range Selection,
// Keyboard Navigation, and Anchor Synchronization
import assert from 'assert';
import {
  computePageClickSelection,
  computeToggleSelectPage,
  computeSelectAllPages,
  computeKeyboardNavigation,
} from '../src/components/workspace/selectionUtils.ts';

console.log('🧪 Testing Multi-Page Selection & Shift-Click Range Selection (Direct Engine Test)...\n');

const createMockPages = (count, deletedIndices = []) => {
  return Array.from({ length: count }, (_, i) => ({
    pageNumber: i + 1,
    originalIndex: i,
    deleted: deletedIndices.includes(i),
  }));
};

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`, err);
    throw err;
  }
}

// 1. Single click
runTest('Non-modifier click sets active page, single selection, and anchor', () => {
  const pages = createMockPages(10);
  const res = computePageClickSelection(4, {}, 1, new Set([0]), 0, pages);
  assert.strictEqual(res.activePageNum, 4);
  assert.deepStrictEqual([...res.selectedIndices], [3]);
  assert.strictEqual(res.anchorIndex, 3);
});

// 2. Shift-click forward
runTest('Shift-click forward selects contiguous range inclusive and retains anchor', () => {
  const pages = createMockPages(10);
  // User on page 2 (anchor = 1)
  const res = computePageClickSelection(6, { shiftKey: true }, 2, new Set([1]), 1, pages);
  assert.strictEqual(res.activePageNum, 6);
  assert.deepStrictEqual([...res.selectedIndices].sort((a, b) => a - b), [1, 2, 3, 4, 5]);
  assert.strictEqual(res.anchorIndex, 1); // Anchor preserved!
});

// 3. Subsequent Shift-click
runTest('Subsequent Shift-click adjusts range from original anchor', () => {
  const pages = createMockPages(10);
  // Anchor remains 1, user clicks page 4
  const res = computePageClickSelection(4, { shiftKey: true }, 6, new Set([1, 2, 3, 4, 5]), 1, pages);
  assert.strictEqual(res.activePageNum, 4);
  assert.deepStrictEqual([...res.selectedIndices].sort((a, b) => a - b), [1, 2, 3]);
  assert.strictEqual(res.anchorIndex, 1);
});

// 4. Shift-click backward
runTest('Shift-click backward selects contiguous range inclusive', () => {
  const pages = createMockPages(10);
  // Anchor is 7 (page 8)
  const res = computePageClickSelection(4, { shiftKey: true }, 8, new Set([7]), 7, pages);
  assert.strictEqual(res.activePageNum, 4);
  assert.deepStrictEqual([...res.selectedIndices].sort((a, b) => a - b), [3, 4, 5, 6, 7]);
  assert.strictEqual(res.anchorIndex, 7);
});

// 5. Shift-click skips deleted pages
runTest('Shift-click range selection skips deleted pages', () => {
  // Page indices 2 and 4 are deleted (pages 3 and 5)
  const pages = createMockPages(10, [2, 4]);
  const res = computePageClickSelection(6, { shiftKey: true }, 1, new Set([0]), 0, pages);
  assert.deepStrictEqual([...res.selectedIndices].sort((a, b) => a - b), [0, 1, 3, 5]);
});

// 6. Ctrl/Cmd click adds individual page
runTest('Ctrl/Cmd click toggles individual page and updates anchor', () => {
  const pages = createMockPages(10);
  // Start with page 2 (index 1) selected
  const res1 = computePageClickSelection(5, { ctrlKey: true }, 2, new Set([1]), 1, pages);
  assert.deepStrictEqual([...res1.selectedIndices].sort((a, b) => a - b), [1, 4]);
  assert.strictEqual(res1.activePageNum, 5);
  assert.strictEqual(res1.anchorIndex, 4);
});

// 7. Ctrl-click deselecting active page shifts active page to remaining selection (preventing desync)
runTest('Ctrl/Cmd click deselecting active page shifts preview to remaining selected page', () => {
  const pages = createMockPages(10);
  // Pages 1 and 2 selected. Page 2 is currently active. User Ctrl-clicks Page 2 to deselect it.
  const res = computePageClickSelection(2, { ctrlKey: true }, 2, new Set([0, 1]), 1, pages);
  assert.deepStrictEqual([...res.selectedIndices], [0]);
  assert.strictEqual(res.activePageNum, 1); // Switched to page 1!
  assert.strictEqual(res.anchorIndex, 0);
});

// 8. Ctrl-click cannot deselect the only selected page
runTest('Ctrl/Cmd click on the only selected page preserves selection', () => {
  const pages = createMockPages(10);
  const res = computePageClickSelection(3, { ctrlKey: true }, 3, new Set([2]), 2, pages);
  assert.deepStrictEqual([...res.selectedIndices], [2]);
  assert.strictEqual(res.activePageNum, 3);
});

// 9. Ctrl+Shift click unions range into existing selection
runTest('Ctrl+Shift click unions range into existing selection', () => {
  const pages = createMockPages(10);
  // Selection has [0, 8], anchor is 8 (page 9)
  const res = computePageClickSelection(6, { ctrlKey: true, shiftKey: true }, 9, new Set([0, 8]), 8, pages);
  assert.deepStrictEqual([...res.selectedIndices].sort((a, b) => a - b), [0, 5, 6, 7, 8]);
  assert.strictEqual(res.anchorIndex, 8); // Retains anchor
});

// 10. Non-modifier click collapses selection
runTest('Non-modifier click after multi-selection collapses to single page', () => {
  const pages = createMockPages(10);
  const res = computePageClickSelection(3, {}, 6, new Set([1, 2, 3, 4, 5]), 1, pages);
  assert.deepStrictEqual([...res.selectedIndices], [2]);
  assert.strictEqual(res.activePageNum, 3);
  assert.strictEqual(res.anchorIndex, 2);
});

// 11. Checkbox toggle with shiftKey
runTest('Checkbox toggle with shiftKey selects range and retains anchor', () => {
  const pages = createMockPages(10);
  const res = computeToggleSelectPage(4, { shiftKey: true }, 1, new Set([0]), 0, pages);
  assert.deepStrictEqual([...res.selectedIndices].sort((a, b) => a - b), [0, 1, 2, 3, 4]);
  assert.strictEqual(res.anchorIndex, 0);
  assert.strictEqual(res.activePageNum, 5);
});

// 12. Checkbox toggle deselecting active page shifts active page
runTest('Checkbox toggle deselecting active page shifts preview to remaining page', () => {
  const pages = createMockPages(10);
  // Indices 0 and 1 selected. Current page is 2 (index 1). Checkbox 1 is untoggled.
  const res = computeToggleSelectPage(1, {}, 2, new Set([0, 1]), 1, pages);
  assert.deepStrictEqual([...res.selectedIndices], [0]);
  assert.strictEqual(res.activePageNum, 1);
});

// 13. Select All skips deleted pages
runTest('Select All selects only active pages (skipping deleted pages)', () => {
  const pages = createMockPages(6, [1, 3]); // pages 2 and 4 deleted
  const res = computeSelectAllPages(pages, new Set([0]), 1);
  assert.deepStrictEqual([...res.selectedIndices].sort((a, b) => a - b), [0, 2, 4, 5]);
  assert.strictEqual(res.selectedIndices.size, 4);
});

// 14. Select All when all active pages are selected deselects to single page
runTest('Select All when all active pages are selected deselects to current active page', () => {
  const pages = createMockPages(6, [1, 3]);
  const allActive = new Set([0, 2, 4, 5]);
  const res = computeSelectAllPages(pages, allActive, 3); // Page 3 (index 2) is active
  assert.deepStrictEqual([...res.selectedIndices], [2]);
  assert.strictEqual(res.activePageNum, 3);
});

// 15. Keyboard navigation ArrowDown / ArrowRight
runTest('Keyboard ArrowDown / ArrowRight navigates to next active page', () => {
  const pages = createMockPages(5);
  const res = computeKeyboardNavigation('ArrowDown', false, 2, new Set([1]), 1, pages);
  assert.ok(res !== null);
  assert.strictEqual(res.activePageNum, 3);
  assert.deepStrictEqual([...res.selectedIndices], [2]);
  assert.strictEqual(res.anchorIndex, 2);
});

// 16. Keyboard navigation ArrowUp / ArrowLeft
runTest('Keyboard ArrowUp / ArrowLeft navigates to previous active page', () => {
  const pages = createMockPages(5);
  const res = computeKeyboardNavigation('ArrowUp', false, 3, new Set([2]), 2, pages);
  assert.ok(res !== null);
  assert.strictEqual(res.activePageNum, 2);
  assert.deepStrictEqual([...res.selectedIndices], [1]);
  assert.strictEqual(res.anchorIndex, 1);
});

// 17. Keyboard Shift + ArrowDown extends selection range
runTest('Keyboard Shift + ArrowDown extends selection range from anchor', () => {
  const pages = createMockPages(5);
  // Anchor is 1 (page 2), current page is 2
  const res = computeKeyboardNavigation('ArrowDown', true, 2, new Set([1]), 1, pages);
  assert.ok(res !== null);
  assert.strictEqual(res.activePageNum, 3);
  assert.deepStrictEqual([...res.selectedIndices].sort((a, b) => a - b), [1, 2]);
  assert.strictEqual(res.anchorIndex, 1); // Anchor retained!
});

// 18. Keyboard Shift + ArrowUp shrinks/reverses range
runTest('Keyboard Shift + ArrowUp selects backwards range from anchor', () => {
  const pages = createMockPages(5);
  // Anchor is 2 (page 3), current page is 3
  const res = computeKeyboardNavigation('ArrowUp', true, 3, new Set([2]), 2, pages);
  assert.ok(res !== null);
  assert.strictEqual(res.activePageNum, 2);
  assert.deepStrictEqual([...res.selectedIndices].sort((a, b) => a - b), [1, 2]);
  assert.strictEqual(res.anchorIndex, 2);
});

// 19. Keyboard navigation skips soft-deleted pages
runTest('Keyboard navigation skips deleted pages', () => {
  // Page 2 (index 1) is deleted
  const pages = createMockPages(5, [1]);
  const res = computeKeyboardNavigation('ArrowDown', false, 1, new Set([0]), 0, pages);
  assert.ok(res !== null);
  assert.strictEqual(res.activePageNum, 3); // Skips to page 3!
  assert.deepStrictEqual([...res.selectedIndices], [2]);
});

// 20. Keyboard Shift + End extends selection to last active page
runTest('Keyboard Shift + End extends selection to last active page', () => {
  const pages = createMockPages(8, [7]); // page 8 deleted, page 7 (index 6) is last active
  const res = computeKeyboardNavigation('End', true, 2, new Set([1]), 1, pages);
  assert.ok(res !== null);
  assert.strictEqual(res.activePageNum, 7); // Page 7
  assert.deepStrictEqual([...res.selectedIndices].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6]);
  assert.strictEqual(res.anchorIndex, 1);
});

console.log(`\nSelection Tests: ${passed}/${total} passed (100%)\n`);
