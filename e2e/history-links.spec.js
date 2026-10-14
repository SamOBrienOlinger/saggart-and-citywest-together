import { test, expect } from '@playwright/test';
import { activateHistoryLink } from './history-link-actions.mjs';

const millLink = page => page.getByRole('link', { name: 'See the mill photograph', exact: true });

async function expectMill(page) {
  await expect(page).toHaveURL(/learn\.html#photo-mill$/);
  await expect(page.locator('.photo-gallery.is-ready')).toBeVisible();
  await expect(page.locator('#photo-mill')).toBeVisible();
  await expect(page.locator('.gallery-slide:not([hidden])')).toHaveCount(1);
  await expect(page.locator('[data-gallery-count]')).toHaveText('3 / 6');
  await expect(page.locator('.gallery-thumbnail').nth(2)).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.locator('#photo-mill .gallery-main-photo').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
}

test('history link selects the mill with one real pointer activation', async ({ page, hasTouch }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    window.historyLinkInput = [];
    for (const type of ['pointerdown', 'pointerup', 'click']) {
      document.addEventListener(type, event => {
        const link = event.target.closest?.('a[href="#photo-mill"], a[href="#history-stories"]');
        if (link) window.historyLinkInput.push({ type, hash: link.hash, pointerType: event.pointerType, trusted: event.isTrusted });
      }, true);
    }
  });
  await page.goto('/learn.html#heritage');
  await expect(page.locator('.photo-gallery')).toHaveClass(/is-ready/);
  await activateHistoryLink(page.getByRole('link', { name: 'Read the local stories', exact: true }), hasTouch);
  await expect(page).toHaveURL(/#history-stories$/);
  await activateHistoryLink(millLink(page), hasTouch);
  await expectMill(page);
  const events = await page.evaluate(() => window.historyLinkInput);
  await testInfo.attach('Native history-link input', { body: JSON.stringify(events, null, 2), contentType: 'application/json' });
  expect(events.filter(event => event.type === 'click').map(event => event.hash)).toEqual(['#history-stories', '#photo-mill']);
  expect(events.filter(event => event.type === 'pointerdown').map(event => event.pointerType)).toEqual([hasTouch ? 'touch' : 'mouse', hasTouch ? 'touch' : 'mouse']);
  expect(events.every(event => event.trusted)).toBe(true);
  expect(errors).toEqual([]);
});

test('history link reselects the mill when its hash has not changed', async ({ page, hasTouch }) => {
  await page.goto('/learn.html#photo-mill');
  await expectMill(page);
  const next = page.getByRole('button', { name: 'Next photograph', exact: true });
  if (hasTouch) await next.tap(); else await next.click();
  await expect(page.locator('[data-gallery-count]')).toHaveText('4 / 6');
  await expect(page).toHaveURL(/#photo-mill$/);
  const entries = await page.evaluate(() => history.length);
  await activateHistoryLink(millLink(page), hasTouch);
  await expectMill(page);
  expect(await page.evaluate(() => history.length)).toBe(entries);
});

test('history link supports Enter, Back, Forward and a cold saved link', async ({ page }) => {
  await page.goto('/learn.html#heritage');
  await expect(page.locator('.photo-gallery')).toHaveClass(/is-ready/);
  await millLink(page).press('Enter');
  await expectMill(page);
  await page.goBack();
  await expect(page).toHaveURL(/#heritage$/);
  await page.goForward();
  await expectMill(page);
  await page.reload();
  await expectMill(page);
});

test.describe('progressive enhancement', () => {
  test.use({ javaScriptEnabled: false });
  test('history link works without JavaScript', async ({ page, hasTouch }) => {
    await page.goto('/learn.html#history-stories');
    await expect(page.locator('.photo-gallery')).not.toHaveClass(/is-ready/);
    await activateHistoryLink(millLink(page), hasTouch);
    await expect(page).toHaveURL(/#photo-mill$/);
    await expect(page.locator('#photo-mill')).toBeInViewport();
    await expect(page.locator('.gallery-slide:visible')).toHaveCount(6);
  });
});
