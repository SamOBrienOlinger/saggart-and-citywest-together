import { test, expect } from '@playwright/test';
import { readdirSync } from 'node:fs';

const pages = readdirSync('.').filter(name => name.endsWith('.html')).sort();
const quiz = page => page.locator('#site-menu a[data-nav="quiz"]');
async function openMenu(page) {
  await expect(page.locator('.site-header')).toHaveClass(/nav-ready/);
  const toggle = page.locator('.nav-toggle');
  if (await toggle.isVisible() && await toggle.getAttribute('aria-expanded') !== 'true') {
    await toggle.click();
  }
  await expect(quiz(page)).toBeVisible();
}

test('all pages expose the same Quiz link and retain current-page indication', async ({ page }) => {
  test.setTimeout(120000);
  for (const name of pages) {
    await page.goto('/' + name);
    await openMenu(page);
    await expect(quiz(page)).toHaveCount(1);
    await expect(quiz(page)).toHaveAccessibleName('Quiz');
    await expect(quiz(page)).toHaveAttribute('href', 'quiz.html');
    await expect(page.locator('#site-menu a[data-nav]').nth(1)).toHaveText('Quiz');
    if (name === 'quiz.html') await expect(quiz(page)).toHaveAttribute('aria-current', 'page');
    else await expect(quiz(page)).not.toHaveAttribute('aria-current', 'page');
  }
});

test('pointer and keyboard navigation reach the working quiz in the same tab', async ({ page, hasTouch }) => {
  for (const method of ['pointer', 'keyboard']) {
    await page.goto('/index.html');
    await openMenu(page);
    if (method === 'keyboard') await quiz(page).press('Enter');
    else if (hasTouch) await quiz(page).tap();
    else await quiz(page).click();
    await expect(page).toHaveURL(/\/quiz\.html$/);
    await expect(page.locator('body')).toHaveAttribute('data-page', 'quiz');
    await expect(quiz(page)).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('#start-quiz')).toBeVisible();
    await page.locator('#start-quiz').click();
    await expect(page.locator('#question-panel')).toBeVisible();
    await expect(page.locator('#answer-options button')).toHaveCount(4);
  }
});

test('the additional pill fits phone, tablet and desktop navigation layouts', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/index.html');
  for (const width of [320, 390, 768, 1120, 1121, 1200, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await openMenu(page);
    const dimensions = await quiz(page).evaluate(link => {
      const rect = link.getBoundingClientRect();
      const root = document.documentElement;
      const style = getComputedStyle(link);
      const peer = getComputedStyle(document.querySelector('#site-menu a[data-nav="learn"]'));
      return { left: rect.left, right: rect.right, height: rect.height,
        client: root.clientWidth, scroll: root.scrollWidth,
        style: [style.backgroundColor, style.color, style.borderRadius, style.font],
        peer: [peer.backgroundColor, peer.color, peer.borderRadius, peer.font] };
    });
    expect(dimensions.height).toBeGreaterThanOrEqual(48);
    expect(dimensions.left).toBeGreaterThanOrEqual(-1);
    expect(dimensions.right).toBeLessThanOrEqual(dimensions.client + 1);
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
    expect(dimensions.style).toEqual(dimensions.peer);
    if (width === 390 || width === 1440) {
      await page.locator('.site-header').screenshot({ path: info.outputPath(`quiz-navbar-${width}.png`) });
    }
  }
});

test('the Quiz navigation link also works without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 1000 } });
  try {
    const page = await context.newPage();
    await page.goto(new URL('/index.html', baseURL).href);
    await expect(quiz(page)).toBeVisible();
    await quiz(page).click();
    await expect(page).toHaveURL(/\/quiz\.html$/);
    await expect(quiz(page)).toHaveAttribute('aria-current', 'page');
  } finally { await context.close(); }
});
