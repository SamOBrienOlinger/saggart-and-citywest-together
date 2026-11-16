import { test, expect } from '@playwright/test';
import { startAsFirstVisitor } from './privacy-test-helpers.mjs';

async function expectNoHorizontalOverflow(page) {
  await expect.poll(() => page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth
  )).toBeLessThanOrEqual(1);
}

test('first-time visitors can reject optional features and start the quiz', async ({ page }) => {
  await startAsFirstVisitor(page);
  const banner = page.locator('#site-privacy-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('You can use the site and quiz without them.');
  await banner.getByRole('button', { name: 'Reject optional', exact: true }).click();
  await expect(banner).toBeHidden();
  await page.goto('/quiz.html');
  await page.getByRole('button', { name: 'Start quiz', exact: true }).click();
  await expect(page.locator('#question-progress')).toHaveText('Question 1 of 10');
  await expect(page.locator('#best-score-intro')).toHaveText('Best score this visit: 0/10 (not saved)');
});

test('translation stays blocked until the visitor explicitly allows it', async ({ page, context }) => {
  await startAsFirstVisitor(page);
  await page.locator('#site-privacy-banner').getByRole('button', { name: 'Reject optional', exact: true }).click();
  await context.route('https://translate.google.com/**', route => route.fulfill({ body: 'Translation handoff' }));
  const menu = page.getByRole('button', { name: 'Toggle navigation', exact: true });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole('button', { name: 'Languages', exact: true }).click();
  await page.locator('.translation-link').first().click();
  const dialog = page.getByRole('dialog', { name: 'Cookie and privacy settings' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('You selected a translated page.');
  await dialog.getByLabel('Allow Google Translate').check();
  const popupPromise = context.waitForEvent('page');
  await dialog.getByRole('button', { name: 'Save selected choices', exact: true }).click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(/translate\.google\.com\/translate\?.*tl=ar/);
  await popup.close();
});

test('mobile support and Facts journeys remain findable in responsive profiles', async ({ page }, testInfo) => {
    const mobileProfiles = new Set([
      'chromium-android-emulation',
      'webkit-iphone-emulation',
      'webkit-narrow',
    ]);
    test.skip(!mobileProfiles.has(testInfo.project.name), 'Covered by the responsive browser profiles.');
    await page.goto('/');
    await expectNoHorizontalOverflow(page);
    const menu = page.getByRole('button', { name: 'Toggle navigation', exact: true });
    await menu.click();
    await expect(page.locator('#site-menu')).toBeVisible();
    await page.getByRole('link', { name: 'Services and organisations', exact: true }).click();
    await expect(page.locator('#local-services')).toBeInViewport();
    await page.getByRole('link', { name: /^Citywest IPAS supports/ }).click();
    await expect(page.getByRole('heading', { name: 'Citywest IPAS supports', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /^South Dublin County Council LAIT/ })).toHaveAttribute('href', 'https://sdcc.ie/en/services/community/local-authority-integration-team/');
    await expect(page.getByRole('link', { name: /^IPAS/ }).first()).toHaveAttribute('href', 'https://ipas.irishimmigration.ie/');
    await expectNoHorizontalOverflow(page);

    await page.goto('/facts.html');
    await expect(page.getByRole('heading', { name: 'Facts', exact: true })).toBeVisible();
    await expect(page.locator('main a[href*="cso.ie"], main a[href*="data.cso.ie"]').first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
});
