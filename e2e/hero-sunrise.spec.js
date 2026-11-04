import { test, expect } from '@playwright/test';

test('sun rises before the logo fades, then restores the original hero', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  let release;
  const artworkReady = new Promise(resolve => { release = resolve; });
  await page.route('**/hero-sun-logo.jpeg', async route => {
    await artworkReady;
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const scene = page.locator('.home-hero-art');
  const overlay = scene.locator('.hero-sunrise-overlay');
  const sun = scene.locator('.hero-rising-sun');
  const logo = scene.locator('.hero-sun-logo');
  await expect(overlay).toBeHidden();
  await expect(scene.locator('.home-hero-still')).toBeVisible();
  release();
  await expect(scene).toHaveAttribute('data-sunrise-state', 'running');
  await expect(overlay).toBeVisible();
  expect(await sun.evaluate(node => new DOMMatrix(getComputedStyle(node).transform).m42)).toBeGreaterThan(0);
  await expect(logo).toHaveCSS('opacity', '1');
  // At the arrival point the sun has stopped; only the logo is fading.
  await expect.poll(() => sun.evaluate(node => new DOMMatrix(getComputedStyle(node).transform).m42),
    { timeout: 4000 }).toBeLessThan(.01);
  await expect.poll(() => logo.evaluate(node => Number(getComputedStyle(node).opacity)),
    { timeout: 1200 }).toBeLessThan(.95);
  expect(await logo.evaluate(node => Number(getComputedStyle(node).opacity))).toBeGreaterThan(0);
  await expect(scene).toHaveAttribute('data-sunrise-state', 'complete', { timeout: 3000 });
  await expect(overlay).toBeHidden();
  await expect(scene.locator('.home-hero-still')).toHaveAttribute('src', 'assets/images/hero-saggart-citywest-v12.jpg');
  const size = await scene.boundingBox();
  expect(size.width / size.height).toBeCloseTo(1.5, 2);
});

test('reduced-motion visitors immediately see the still illustration', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.home-hero-art')).toHaveAttribute('data-sunrise-state', 'skipped');
  await expect(page.locator('.hero-sunrise-overlay')).toBeHidden();
  await expect(page.locator('.home-hero-still')).toBeVisible();
});

test('missing animation artwork leaves the original hero visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.route('**/hero-sun-logo.jpeg', route => route.abort());
  await page.goto('/');
  await expect(page.locator('.home-hero-art')).toHaveAttribute('data-sunrise-state', 'skipped');
  await expect(page.locator('.hero-sunrise-overlay')).toBeHidden();
  await expect(page.locator('.home-hero-still')).toBeVisible();
});
