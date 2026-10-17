import { test, expect } from '@playwright/test';
import { readdirSync } from 'node:fs';

const pages = readdirSync(new URL('../', import.meta.url)).filter(name => name.endsWith('.html'));
const logoLinks = '.site-header a.brand, .site-footer a.footer-brand';

async function openPage(page, path) {
  await page.goto('/' + path);
  if (path === 'gallery.html') await page.waitForURL('**/learn.html#heritage');
}

// A focus-induced smooth scroll can outlive locator.hover() on mobile WebKit.
// Position the image without animation, then verify that the native pointer
// target has settled. Do not force input or dispatch synthetic pointer events.
async function prepareLogoPointer(link) {
  const logo = link.locator('img');
  await logo.evaluate(img => img.scrollIntoView({
    block: 'center', inline: 'nearest', behavior: 'instant',
  }));
  let previous;
  let stableSamples = 0;
  await expect.poll(async () => {
    const sample = await logo.evaluate(img => {
      const rect = img.getBoundingClientRect();
      const viewport = window.visualViewport;
      const top = viewport?.offsetTop ?? 0;
      const left = viewport?.offsetLeft ?? 0;
      const height = viewport?.height ?? window.innerHeight;
      const width = viewport?.width ?? window.innerWidth;
      const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      return {
        position: [rect.x, rect.y, rect.width, rect.height, window.scrollX, window.scrollY, top, left, height, width],
        ready: rect.width > 0 && rect.height > 0 && rect.top >= top &&
          rect.bottom <= top + height && rect.left >= left && rect.right <= left + width && hit === img,
      };
    });
    const stationary = previous && sample.position.every((value, index) => Math.abs(value - previous[index]) < .5);
    stableSamples = sample.ready && stationary ? stableSamples + 1 : 0;
    previous = sample.position;
    return stableSamples;
  }, { message: 'logo is stationary, fully visible and receives native pointer input', intervals: [50, 100], timeout: 10000 }).toBeGreaterThanOrEqual(3);
  await logo.hover();
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
      await prepareLogoPointer(link);
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
  for (const path of pages) {
    await openPage(page, path);
    for (const link of await page.locator(logoLinks).all()) {
      // Establish keyboard modality, then target the actual logo. Tab/Shift+Tab
      // is not a reliable round trip when a responsive menu closes on focusout.
      await page.keyboard.press('Tab');
      await link.focus();
      await expect(link).toBeFocused();
      expect(await link.evaluate(a => a.matches(':focus-visible'))).toBe(true);
      await expectCircularFeedback(link);
      await expect(link).toHaveCSS('outline-style', 'none');
      await expect(link).toHaveCSS('box-shadow', 'none');
      await expect(link.locator('img')).toHaveCSS('outline-color', 'rgb(255, 255, 255)');
      await expect(link.locator('img')).toHaveCSS('box-shadow', 'rgb(7, 59, 69) 0px 0px 0px 6px');
      await link.evaluate(a => a.blur());
      await prepareLogoPointer(link);
      await page.mouse.down();
      try {
        await expect.poll(() => link.evaluate(a => a.matches(':active'))).toBe(true);
        await expectCircularFeedback(link);
        await expect(link.locator('img')).toHaveCSS('outline-color', 'rgb(255, 255, 255)');
        await expect(link.locator('img')).toHaveCSS('box-shadow', 'rgb(116, 53, 29) 0px 0px 0px 6px');
      } finally {
        // Release outside the link to avoid navigating during this style check.
        await page.mouse.move(1, 1);
        await page.mouse.up();
      }
    }
  }
});
