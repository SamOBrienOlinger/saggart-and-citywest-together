import { test, expect } from '@playwright/test';

const cardSelector = '#main .about-content > .about-section';
const sectionIds = ['what-we-do', 'our-work', 'community-in-action', 'area-changed', 'challenge-racism', 'content-checks', 'sources'];

async function fits(page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
}

test('published About cards reveal on ordinary page loads and preserve the approved content', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/about.html');
  await expect(page.locator('body')).toHaveClass(/about-reveal-ready/);
  const cards = page.locator(cardSelector);
  await expect(cards).toHaveCount(7);
  expect(await cards.evaluateAll(elements => elements.map(el => el.getAttribute('aria-labelledby')))).toEqual(sectionIds);
  await expect(page.locator('.page-hero .eyebrow, .page-jump-wrap .topic-nav-label')).toHaveCount(0);
  await expect(page.locator('#main')).not.toContainText('Local and newer residents');
  await expect(page.locator('#main')).toContainText('local residents shared food');
  await expect(page.getByRole('heading', { name: 'Get in touch', exact: true })).toHaveCount(0);
  const backgrounds = await cards.evaluateAll(elements => elements.map(el => getComputedStyle(el).backgroundColor));
  for (let i = 1; i < backgrounds.length; i++) expect(backgrounds[i]).not.toBe(backgrounds[i - 1]);
  for (const card of await cards.all()) {
    await card.evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await expect(card).toHaveClass(/about-reveal-visible/);
    await expect(card).toHaveCSS('opacity', '1');
    await fits(page);
  }
  await expect(page.locator('.about-reveal-pending')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('About native shortcuts and a cold saved link expose the requested card', async ({ page }) => {
  await page.goto('/about.html');
  const links = page.locator('.page-jump-nav a');
  await expect(links).toHaveCount(5);
  for (const link of await links.all()) {
    const hash = await link.getAttribute('href');
    // Real keyboard activation avoids racing a previous smooth hash scroll.
    await link.focus();
    await link.press('Enter');
    await expect(page).toHaveURL(new RegExp('about\\.html' + hash + '$'));
    await expect(page.locator(hash)).toBeInViewport();
    await expect(page.locator(hash).locator('..')).toHaveCSS('opacity', '1');
  }
  await page.goto('about:blank');
  await page.goto('/about.html#sources');
  await expect(page.locator('#sources')).toBeInViewport();
  await expect(page.locator('#sources').locator('..')).toHaveCSS('opacity', '1');
});

test('About cards stay readable at 200% text with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/about.html');
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await expect(page.locator(cardSelector)).toHaveCount(7);
  for (const card of await page.locator(cardSelector).all()) {
    await expect(card).toHaveCSS('opacity', '1');
    await expect(card).toHaveCSS('transform', 'none');
    await expect(card).toHaveCSS('transition-duration', '0s');
  }
  await fits(page);
});

test.describe('About without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('cards and native source shortcut remain available', async ({ page }) => {
    await page.goto('/about.html');
    await expect(page.locator(cardSelector + ':visible')).toHaveCount(7);
    await page.locator('.page-jump-nav a[href="#sources"]').press('Enter');
    await expect(page).toHaveURL(/about\.html#sources$/);
    await expect(page.locator('#sources')).toBeInViewport();
    await fits(page);
  });
});
