import { test, expect } from '@playwright/test';
import { readdirSync } from 'node:fs';

const pages = readdirSync(new URL('../', import.meta.url)).filter(name => name.endsWith('.html'));
const logoLinks = '.site-header a.brand, .site-footer a.footer-brand';

async function openPage(page, path) {
  await page.goto('/' + path);
  if (path === 'gallery.html') await page.waitForURL('**/learn.html#heritage');
}

async function expectCircularFeedback(link) {
  const logo = link.locator('img');
  await expect(link).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(logo).toHaveCSS('border-radius', '50%');
  await expect(logo).toHaveCSS('outline-width', '3px');
  await expect(logo).toHaveCSS('outline-style', 'solid');
  const box = await logo.boundingBox();
  expect(box.width).toBeCloseTo(box.height, 1);
  if (await link.evaluate(a => a.classList.contains('footer-brand'))) {
    await expect(link).toHaveCSS('border-radius', '50%');
    const linkBox = await link.boundingBox();
    expect(linkBox.width).toBeCloseTo(linkBox.height, 1);
    expect(linkBox.width).toBeCloseTo(box.width, 1);
    await expect(logo).toHaveCSS('margin-bottom', '0px');
  }
}

test('logo hover highlights are circular, not rectangular, on every page', async ({ page }, testInfo) => {
  await page.goto('/');
  test.skip(!await page.evaluate(() => matchMedia('(hover: hover)').matches), 'Touch-only profiles do not apply hover styling');
  for (const path of pages) {
    await openPage(page, path);
    for (const link of await page.locator(logoLinks).all()) {
      await link.locator('img').hover();
      await expectCircularFeedback(link);
      await expect(link.locator('img')).toHaveCSS('outline-color', 'rgb(255, 240, 213)');
      if (path === 'index.html') {
        const region = await link.evaluate(a => a.closest('header') ? 'header' : 'footer');
        await testInfo.attach(`${region} circular logo hover`, {
          body: await page.locator(`.site-${region}`).screenshot(), contentType: 'image/png',
        });
      }
      await page.mouse.move(1, 1);
      await expect(link.locator('img')).toHaveCSS('outline-color', 'rgba(0, 0, 0, 0)');
    }
  }
});

test('logo keyboard focus and pressed feedback stay circular on every page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of pages) {
    await openPage(page, path);
    for (const link of await page.locator(logoLinks).all()) {
      await page.keyboard.press('Tab');
      await link.focus();
      await expect(link).toBeFocused();
      expect(await link.evaluate(a => a.matches(':focus-visible'))).toBe(true);
      await expectCircularFeedback(link);
      await expect(link).toHaveCSS('outline-style', 'none');
      await expect(link).toHaveCSS('box-shadow', 'none');
      await expect(link.locator('img')).toHaveCSS('outline-color', 'rgb(255, 255, 255)');
      await expect(link.locator('img')).toHaveCSS('box-shadow', 'rgb(7, 59, 69) 0px 0px 0px 6px');
      await link.evaluate(a => {
        a.blur();
        // Finish focus scrolling before placing the pointer, including narrow WebKit.
        a.scrollIntoView({ block: 'center', behavior: 'instant' });
      });
      await link.locator('img').hover();
      await page.mouse.down();
      try {
        await expectCircularFeedback(link);
        await expect(link.locator('img')).toHaveCSS('outline-color', 'rgb(255, 255, 255)');
      } finally {
        // Release outside the link to avoid navigating during this style check.
        await page.mouse.move(1, 1);
        await page.mouse.up();
      }
    }
  }
});
