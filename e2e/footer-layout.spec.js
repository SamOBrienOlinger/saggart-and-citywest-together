import { test, expect } from '@playwright/test';
import { readdirSync } from 'node:fs';

const pages = readdirSync(new URL('../', import.meta.url)).filter(path => path.endsWith('.html'));

async function checkLayout(page) {
  const footer = page.locator('.site-footer');
  await footer.scrollIntoViewIfNeeded();
  await expect.poll(() => footer.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
  const issues = await footer.evaluate(root => {
    const issues = [];
    const viewport = document.documentElement.clientWidth;
    const links = [...root.querySelectorAll('a')].filter(a => a.getClientRects().length && getComputedStyle(a).visibility !== 'hidden');
    const boxes = links.map(a => a.getBoundingClientRect());
    boxes.forEach((box, i) => {
      const label = links[i].textContent.trim() || links[i].querySelector('img')?.alt;
      if (box.left < -1 || box.right > viewport + 1) issues.push({ label, reason: 'horizontal overflow' });
      if (box.height < 47 || box.width < 44) issues.push({ label, reason: 'undersized target', width: box.width, height: box.height });
      for (let j = 0; j < i; j++) {
        const other = boxes[j];
        if (Math.min(box.right, other.right) - Math.max(box.left, other.left) > 1 && Math.min(box.bottom, other.bottom) - Math.max(box.top, other.top) > 1) {
          issues.push({ label, reason: 'overlapping links' });
        }
      }
    });
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node; (node = walker.nextNode());) {
      const parent = node.parentElement;
      if (!node.textContent.trim() || parent.closest('.sr-only, script, style, noscript, [hidden]') || !parent.getClientRects().length) continue;
      const range = document.createRange(); range.selectNodeContents(node);
      for (const line of range.getClientRects()) {
        if (line.width && (line.left < -1 || line.right > viewport + 1)) issues.push({ reason: 'text overflow', text: node.textContent.trim() });
      }
    }
    return issues;
  });
  expect(issues).toEqual([]);
  for (const logo of await footer.locator('.footer-logo').all()) {
    const box = await logo.boundingBox();
    expect(box.width).toBeCloseTo(box.height, 1);
    await expect(logo).toHaveCSS('border-radius', '50%');
  }
}

test('footer groups are aligned and every existing target remains usable on all pages', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of pages) {
    await page.goto('/' + path);
    if (path === 'gallery.html') await page.waitForURL('**/learn.html#heritage');
    await checkLayout(page);
  }
});

test('footer uses equal quick-link tracks, aligned contacts and a centred copyright row', async ({ page }, info) => {
  await page.goto('/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await checkLayout(page);
  const geometry = await page.locator('.site-footer').evaluate(root => {
    const rect = selector => root.querySelector(selector).getBoundingClientRect();
    const grid = rect('.footer-grid');
    const note = rect('.footer-note');
    const credit = rect('.footer-note a');
    const contacts = [...root.querySelectorAll('.footer-connect p a')].map(a => a.getBoundingClientRect());
    return { gridLeft: grid.left, gridWidth: grid.width, noteLeft: note.left, noteWidth: note.width,
      noteCentre: note.left + note.width / 2, creditCentre: credit.left + credit.width / 2,
      contacts: contacts.map(box => ({ left: box.left, width: box.width })),
      listDisplay: getComputedStyle(root.querySelector('.footer-grid ul')).display };
  });
  expect(geometry.listDisplay).toBe('grid');
  expect(geometry.gridLeft).toBeCloseTo(geometry.noteLeft, 1);
  expect(geometry.gridWidth).toBeCloseTo(geometry.noteWidth, 1);
  expect(geometry.noteCentre).toBeCloseTo(geometry.creditCentre, 1);
  for (const box of geometry.contacts) {
    expect(box.left).toBeCloseTo(geometry.contacts[0].left, 1);
    expect(box.width).toBeCloseTo(geometry.contacts[0].width, 1);
  }
  await page.keyboard.press('Tab');
  const link = page.locator('.site-footer .footer-grid li a').first();
  await link.focus();
  await expect(link).toBeFocused();
  await expect(link).toHaveCSS('outline-style', 'solid');
  await link.evaluate(a => a.blur());
  await page.mouse.move(0, 0);
  await info.attach('Footer layout', { body: await page.locator('.site-footer').screenshot(), contentType: 'image/png' });
});

test('footer retains readable controls and circular artwork at 200 percent text in RTL', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of ['index.html', 'contact.html', 'accessibility.html']) {
    await page.goto('/' + path);
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; document.documentElement.dir = 'rtl'; });
    await checkLayout(page);
  }
  await info.attach('Footer at 200 percent RTL', { body: await page.locator('.site-footer').screenshot(), contentType: 'image/png' });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('footer navigation, QR links and all nine language routes remain available', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const path of ['index.html', 'contact.html', 'accessibility.html', '404.html']) {
      await page.goto('/' + path);
      await checkLayout(page);
      await expect(page.locator('.site-footer .translation-fallback a')).toHaveCount(9);
      await expect(page.locator('.site-footer .translation-fallback')).toBeVisible();
    }
  });
});
