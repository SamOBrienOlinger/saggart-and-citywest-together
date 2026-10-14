import { test, expect } from '@playwright/test';
import { readdirSync } from 'node:fs';

const pages = readdirSync(new URL('../', import.meta.url)).filter(name => name.endsWith('.html'));

async function expectCircularLogos(page, path) {
  const logos = page.locator('.brand-logo, .footer-logo');
  await expect(logos).toHaveCount(path === '404.html' ? 1 : 2);
  for (const logo of await logos.all()) {
    await expect(logo).toHaveAttribute('src', 'assets/images/pride-logo.jpg');
    await expect.poll(() => logo.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    const shape = await logo.evaluate(image => {
      const style = getComputedStyle(image);
      const rect = image.getBoundingClientRect();
      return {
        width: rect.width, height: rect.height, radius: style.borderRadius,
        fit: style.objectFit, border: style.borderTopWidth,
        naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight,
      };
    });
    expect(shape.width).toBeGreaterThan(0);
    expect(shape.width).toBeCloseTo(shape.height, 1);
    expect(shape.radius).toBe('50%');
    expect(shape.fit).toBe('contain');
    expect(shape.border).toBe('2px');
    expect(shape.naturalWidth).toBe(150);
    expect(shape.naturalHeight).toBe(150);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
}

test('Pride logos load as matching circular frames on every page', async ({ page }) => {
  const reference = new Map();
  for (const path of pages) {
    await page.goto('/' + path);
    if (path === 'gallery.html') await page.waitForURL('**/learn.html#heritage');
    await expectCircularLogos(page, path);
    const sizes = await page.locator('.brand-logo, .footer-logo').evaluateAll(images =>
      images.map(image => [image.className, image.getBoundingClientRect().width]));
    for (const [name, width] of sizes) {
      if (!reference.has(name)) reference.set(name, width);
      else expect(width, `${path}: ${name}`).toBe(reference.get(name));
    }
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('all pages retain the supplied logo and circular styling', async ({ page }) => {
    for (const path of pages) {
      await page.goto('/' + path);
      await expectCircularLogos(page, path);
    }
  });
});
