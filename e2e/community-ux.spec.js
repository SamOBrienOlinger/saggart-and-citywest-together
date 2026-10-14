import { test, expect } from '@playwright/test';
import { expectTextReflow } from './text-reflow.mjs';

test('copy email works with visible and announced feedback', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async value => { window.copiedEmail = value; },
    } });
  });
  await page.goto('/contact.html');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Contact us and get involved');
  const copy = page.getByRole('button', { name: 'Copy email address', exact: true });
  await copy.focus();
  await copy.press('Enter');
  await expect(page.locator('[data-copy-success]')).toBeVisible();
  await expect(copy).toBeFocused();
  expect(await page.evaluate(() => window.copiedEmail)).toBe('saggartcitywesttogether@gmail.com');
  await expect(page.locator('#copy-email-status')).toHaveAttribute('role', 'status');
});

test('blocked clipboard falls back to a selectable email address', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async () => { throw new DOMException('Not allowed', 'NotAllowedError'); },
    } });
  });
  await page.goto('/contact.html');
  await page.getByRole('button', { name: 'Copy email address', exact: true }).click();
  await expect(page.locator('[data-copy-failure]')).toBeVisible();
  await expect(page.locator('[data-copy-success]')).toBeHidden();
  await expect(page.locator('#community-email')).toHaveAttribute('href', 'mailto:saggartcitywesttogether@gmail.com');
});

test('support filters, reset and saved section links work together', async ({ page }) => {
  await page.goto('/citywest-supports.html');
  const select = page.getByLabel('Show support for', { exact: true });
  await expect(select).toBeVisible();
  const rows = page.locator('[data-support-category]:visible');
  for (const [value, number] of [['learning', 3], ['work', 2], ['community', 3], ['rights', 1], ['accommodation', 1], ['all', 10]]) {
    await select.selectOption(value);
    await expect(rows).toHaveCount(number);
    await expect(page.locator('[data-support-count]')).toHaveText(String(number));
  }
  await select.selectOption('work');
  await page.getByRole('button', { name: 'Show all support areas', exact: true }).click();
  await expect(select).toBeFocused();
  await expect(rows).toHaveCount(10);
  await select.selectOption('work');
  await page.evaluate(() => { location.hash = 'english-classes'; });
  await expect(select).toHaveValue('all');
  await expect(page.locator('#english-classes')).toBeInViewport();
  await expect(rows).toHaveCount(10);
});

test('photo gallery stays image-only and archived posters are clearly separate', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.community-slide')).toHaveCount(18);
  await expect(page.locator('.community-carousel img[src*="-poster."]')).toHaveCount(0);
  await expect(page.locator('.community-slide :is(figcaption, p)')).toHaveCount(0);
  await page.locator('.event-archive > summary').click();
  await expect(page.locator('.event-poster')).toHaveCount(3);
  await expect(page.locator('.event-archive-content > p')).toContainText('not as invitations to upcoming events');
  for (const image of await page.locator('.event-poster img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
    await expect(image).toHaveCSS('object-fit', 'contain');
  }
});

test('new controls and expanded content reflow with enlarged text and RTL', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of ['contact.html', 'citywest-supports.html', 'facts.html', 'index.html']) {
    await page.goto('/' + path);
    if (path === 'index.html') await page.locator('.event-archive > summary').click();
    for (const direction of ['ltr', 'rtl']) {
      await page.evaluate(direction => {
        document.documentElement.style.fontSize = '200%';
        document.documentElement.dir = direction;
      }, direction);
      await expectTextReflow(page, expect, `${path}: ${direction} at 200% text`);
    }
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; document.documentElement.dir = 'ltr'; window.scrollTo(0, 0); });
    await testInfo.attach(`UX review ${path}`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  }
});

test.describe('progressive-enhancement fallback', () => {
  test.use({ javaScriptEnabled: false });
  test('essential contact, support and archive content needs no JavaScript', async ({ page }) => {
    await page.goto('/contact.html');
    await expect(page.locator('#community-email')).toBeVisible();
    await expect(page.locator('[data-copy-email]')).toBeHidden();
    await page.goto('/citywest-supports.html#english-classes');
    await expect(page.locator('[data-support-category]')).toHaveCount(10);
    await expect(page.locator('[data-support-category][hidden]')).toHaveCount(0);
    await expect(page.locator('[data-support-filter]')).toBeHidden();
    await page.goto('/');
    await page.locator('.event-archive > summary').click();
    await expect(page.locator('.event-poster a')).toHaveCount(3);
    await expect(page.locator('.event-poster').first()).toBeVisible();
  });
});
