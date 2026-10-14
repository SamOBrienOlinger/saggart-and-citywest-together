import { test, expect } from '@playwright/test';

const selector = '.community-actions > .pill-button';

async function expectCentredButton(page) {
  const dimensions = await page.locator(selector).evaluate(element => {
    const button = element.getBoundingClientRect();
    const parent = element.parentElement.getBoundingClientRect();
    return {
      offset: Math.abs(button.x + button.width / 2 - parent.x - parent.width / 2),
      width: button.width,
      available: parent.width,
      height: button.height,
      labelFits: element.scrollWidth <= element.clientWidth && element.scrollHeight <= element.clientHeight,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(dimensions.offset).toBeLessThan(1);
  expect(dimensions.width).toBeLessThanOrEqual(dimensions.available + 1);
  expect(dimensions.height).toBeGreaterThanOrEqual(48);
  expect(dimensions.labelFits).toBe(true);
  expect(dimensions.overflow).toBeLessThanOrEqual(1);
}

test('Get involved stays centred with responsive widths and enlarged labels', async ({ page, hasTouch }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.site-header')).toHaveClass(/nav-ready/);
  const viewport = page.viewportSize();
  // Touch projects retain their phone/tablet/orientation emulation; desktop engines
  // also exercise the complete width range, including both sides of the grid breakpoint.
  const widths = hasTouch ? [viewport.width] : [280, 320, 390, 768, 895, 896, 1024, 1440, 1920, 2560, 3840];
  for (const width of widths) {
    await page.setViewportSize({ width, height: viewport.height });
    await expectCentredButton(page);
  }
  await page.setViewportSize(viewport);
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await expectCentredButton(page);
  await page.locator(selector).evaluate(element => {
    element.textContent = 'Contactez-nous pour participer aux activites de la communaute';
  });
  await expectCentredButton(page);
});

test('Get involved has motion-aware feedback and keeps its contact destination', async ({ page, hasTouch }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const button = page.locator(selector);
  await button.scrollIntoViewIfNeeded();
  const hoverSupported = await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches);
  if (hoverSupported) {
    await button.hover();
    await expect(button).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -2)');
    await expect(button).toHaveCSS('background-color', 'rgb(255, 240, 213)');
  }
  await button.hover();
  await page.mouse.down();
  await expect(button).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 1)');
  await expect(button).toHaveCSS('background-color', 'rgb(116, 53, 29)');
  // Release outside the link: this check must not navigate before the focus checks.
  await page.mouse.move(0, 0);
  await page.mouse.up();
  await expect(button).toHaveCSS('transform', 'none');
  await page.keyboard.press('Tab');
  await button.focus();
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS('outline-width', '3px');
  await button.evaluate(element => element.blur());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await button.hover();
  await expect(button).toHaveCSS('transform', 'none');
  await expect(button).toHaveCSS('transition-duration', '0s');
  await page.mouse.down();
  await expect(button).toHaveCSS('transform', 'none');
  await page.mouse.move(0, 0);
  await page.mouse.up();
  await expect(button).toHaveAttribute('href', 'contact.html#contact-details');
  if (hasTouch) await button.tap();
  else await button.click();
  await expect(page).toHaveURL(/contact\.html#contact-details$/);
});
