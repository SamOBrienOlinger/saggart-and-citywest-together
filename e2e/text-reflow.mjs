// Measure text lines, rather than relying only on the document's scroll width.
// Carousels may intentionally scroll horizontally; text must still fit inside
// each thumbnail or caption. Screen-reader-only text is intentionally clipped.
export function inspectTextReflow() {
  const viewport = document.documentElement.clientWidth;
  const issues = [];
  const styles = new WeakMap();
  const boxes = new WeakMap();
  const style = element => {
    if (!styles.has(element)) styles.set(element, getComputedStyle(element));
    return styles.get(element);
  };
  const box = element => {
    if (!boxes.has(element)) boxes.set(element, element.getBoundingClientRect());
    return boxes.get(element);
  };
  const rails = '.gallery-thumbnails, .carousel-thumbnails, .carousel-viewport, .local-gallery';
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (!node.textContent.trim()) continue;
    const element = node.parentElement;
    if (!element || element.closest('script, style, .sr-only, [hidden], [aria-hidden="true"], .skip-link:not(:focus)')) continue;
    if (!element.getClientRects().length || style(element).visibility !== 'visible') continue;
    const ancestors = [];
    let hidden = false;
    for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
      const css = style(ancestor);
      const rect = box(ancestor);
      if (css.visibility !== 'visible' || (rect.width <= 1 && rect.height <= 1 && (css.clip !== 'auto' || css.clipPath !== 'none'))) {
        hidden = true;
        break;
      }
      ancestors.push(ancestor);
    }
    if (hidden) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    const rail = element.closest(rails);
    let reason;
    for (const rect of range.getClientRects()) {
      if (rect.width <= 0 || rect.height <= 0) continue;
      if (!rail && (rect.left < -1 || rect.right > viewport + 1)) {
        reason = 'text extends beyond the viewport';
        break;
      }
      for (const ancestor of ancestors) {
        // Outer rail cropping is intentional and can be revealed by scrolling.
        if (ancestor === rail) break;
        const css = style(ancestor);
        const bounds = box(ancestor);
        if (/^(hidden|clip)$/.test(css.overflowX) && (rect.left < bounds.left - 1 || rect.right > bounds.right + 1)) {
          reason = 'text is clipped horizontally inside a component';
          break;
        }
        if (/^(hidden|clip)$/.test(css.overflowY) && (rect.top < bounds.top - 1 || rect.bottom > bounds.bottom + 1)) {
          reason = 'text is clipped vertically inside a component';
          break;
        }
      }
      if (reason) break;
    }
    if (reason) {
      issues.push({ reason, text: node.textContent.trim().slice(0, 120), element: element.tagName.toLowerCase(), className: element.className });
      if (issues.length === 20) break;
    }
  }
  return { viewport, document: document.documentElement.scrollWidth, issues };
}

export async function expectTextReflow(page, expect, label) {
  const result = await page.evaluate(inspectTextReflow);
  expect(result.document, `${label}: document width`).toBeLessThanOrEqual(result.viewport + 1);
  expect(result.issues, `${label}: clipped or overflowing text`).toEqual([]);
}
