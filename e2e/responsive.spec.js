import { test, expect } from '@playwright/test';

const pages = ['index.html', 'learn.html', 'facts.html', 'citywest-supports.html', 'quiz.html', 'contact.html', 'about.html', 'privacy.html', 'accessibility.html'];
// Exercise each layout boundary as well as phones, tablets, landscape and large screens.
const sizes = [[320, 640], [360, 800], [390, 844], [430, 932], [600, 900],
  [760, 900], [761, 900], [844, 390], [899, 900], [900, 900], [901, 900],
  [1024, 768], [1119, 900], [1120, 900], [1121, 900], [1280, 900], [1920, 1080]];

async function containedContent(page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  // Check the actual content as well: clipping a parent must not disguise a layout failure.
  const overflow = await page.locator('main h1, main h2, main h3, main h4, main p, main a, main button, main img, footer a, .brand, .nav-toggle').evaluateAll(elements => elements.flatMap(element => {
    if (element.closest('.sr-only, [hidden], [aria-hidden="true"], .carousel-viewport, .carousel-thumbnails, .gallery-thumbnails')) return [];
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height || getComputedStyle(element).visibility === 'hidden') return [];
    return rect.left < -1 || rect.right > document.documentElement.clientWidth + 1
      ? [{ tag: element.tagName, text: (element.textContent || element.getAttribute('alt') || '').slice(0, 70), left: rect.left, right: rect.right }]
      : [];
  }));
  expect(overflow).toEqual([]);
}

for (const [width, height] of sizes) {
  test(`all pages reflow at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    for (const path of pages) {
      await test.step(path, async () => {
        await page.goto('/' + path);
        await expect(page.locator('.site-header')).toHaveClass(/nav-ready/);
        await containedContent(page);
      });
    }
  });
}

for (const width of [320, 1280]) {
  test(`all pages reflow with 200% text at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of pages) {
      await test.step(path, async () => {
        await page.goto('/' + path);
        await expect(page.locator('.site-header')).toHaveClass(/nav-ready/);
        await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
        await containedContent(page);
      });
    }
  });
}

test('navigation and all nine languages stay reachable through resizing', async ({ page }) => {
  for (const path of ['index.html', 'citywest-supports.html', 'facts.html']) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/' + path);
    const toggle = page.getByRole('button', { name: 'Toggle navigation', exact: true });
    await toggle.click();
    await page.getByRole('button', { name: 'Languages', exact: true }).click();
    await expect(page.locator('.translation-link')).toHaveCount(9);
    for (const link of await page.locator('.translation-link').all()) {
      await link.scrollIntoViewIfNeeded();
      await expect(link).toBeInViewport();
    }
    await page.keyboard.press('Escape');
    await expect(page.locator('.translation-panel')).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
    await toggle.click();
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(toggle).toBeHidden();
    await expect(page.locator('#site-menu')).toBeVisible();
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(toggle).toBeVisible();
    await expect(page.locator('#site-menu')).toBeHidden();
    await toggle.click();
    await page.getByRole('button', { name: 'Languages', exact: true }).click();
    const last = page.locator('.translation-link').last();
    await last.scrollIntoViewIfNeeded();
    await expect(last).toBeInViewport();
    await containedContent(page);
  }
});

test('quiz answers and feedback reflow with enlarged text on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/quiz.html');
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await page.getByRole('button', { name: 'Start quiz', exact: true }).click();
  await containedContent(page);
  await page.locator('#answer-options button').first().click();
  await expect(page.locator('#feedback')).toBeVisible();
  await containedContent(page);
  await page.locator('#next-question').click();
  await expect(page.locator('#question-progress')).toHaveText('Question 2 of 10');
  await containedContent(page);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('all pages reflow at 320px and retain navigation', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const path of pages) {
      await test.step(path, async () => {
        await page.goto('/' + path);
        await expect(page.locator('#site-menu')).toBeVisible();
        await containedContent(page);
      });
    }
  });
});
