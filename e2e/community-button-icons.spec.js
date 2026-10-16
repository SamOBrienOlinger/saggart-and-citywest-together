import { test, expect } from '@playwright/test';

const selector = '.explore-topic--community';
async function checkIcons(page) {
  const button = page.locator(selector);
  await expect(button).toHaveAccessibleName('Community');
  await expect(button).toHaveAttribute('href', '#community');
  await expect(button.locator('.explore-topic-label')).toHaveText('Community');
  await expect(button.locator('.explore-community-icons')).toHaveAttribute('aria-hidden', 'true');
  const icons = button.locator('img');
  await expect(icons).toHaveCount(3);
  for (const icon of await icons.all()) {
    await expect(icon).toHaveAttribute('src', 'assets/icons/chat-heart.svg');
    await expect(icon).toHaveAttribute('alt', '');
    await expect.poll(() => icon.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  }
  const appearances = await icons.evaluateAll(images => images.map(image => {
    const style = getComputedStyle(image);
    return [style.width, style.height, style.filter, style.objectFit];
  }));
  expect(appearances[1]).toEqual(appearances[0]);
  expect(appearances[2]).toEqual(appearances[0]);
  for (const other of await page.locator('.explore-topic:not(.explore-topic--community)').all()) {
    await expect(other.locator('img')).toHaveCount(1);
  }
  return button;
}

test('Community has three identical icons and keeps keyboard and pointer navigation', async ({ page, hasTouch }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/learn.html');
  let button = await checkIcons(page);
  await button.scrollIntoViewIfNeeded();
  await page.locator('.explore-topic-nav').screenshot({ path: info.outputPath('community-icons.png') });
  if (!hasTouch) {
    await button.hover();
    await checkIcons(page);
  }
  await button.press('Enter');
  await expect(page).toHaveURL(/learn\.html#community$/);
  await expect(page.locator('#community')).toBeInViewport();
  await page.goto('/learn.html');
  button = await checkIcons(page);
  if (hasTouch) await button.tap();
  else await button.click();
  await expect(page).toHaveURL(/learn\.html#community$/);
  await expect(page.locator('#community')).toBeInViewport();
});

test('three icons and the label fit at narrow widths, enlarged text and RTL', async ({ page }) => {
  await page.goto('/learn.html');
  const button = await checkIcons(page);
  for (const width of [280, 320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [fontSize, dir] of [['100%', 'ltr'], ['200%', 'ltr'], ['200%', 'rtl']]) {
      await page.evaluate(({ fontSize, dir }) => {
        document.documentElement.style.fontSize = fontSize;
        document.documentElement.dir = dir;
      }, { fontSize, dir });
      await button.scrollIntoViewIfNeeded();
      const geometry = await button.evaluate(link => {
        const bounds = link.getBoundingClientRect();
        const children = [...link.querySelectorAll('img, .explore-topic-label')].map(child => {
          const rect = child.getBoundingClientRect();
          return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
        });
        return { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom, height: bounds.height, client: link.clientWidth, scroll: link.scrollWidth, children };
      });
      expect(geometry.height).toBeGreaterThanOrEqual(48);
      expect(geometry.scroll).toBeLessThanOrEqual(geometry.client + 1);
      for (const rect of geometry.children) {
        expect(rect.width).toBeGreaterThan(0);
        expect(rect.height).toBeGreaterThan(0);
        expect(rect.left).toBeGreaterThanOrEqual(geometry.left - 1);
        expect(rect.right).toBeLessThanOrEqual(geometry.right + 1);
        expect(rect.top).toBeGreaterThanOrEqual(geometry.top - 1);
        expect(rect.bottom).toBeLessThanOrEqual(geometry.bottom + 1);
      }
      const icons = geometry.children.slice(0, 3).sort((a, b) => a.left - b.left);
      expect(icons[1].left).toBeGreaterThanOrEqual(icons[0].right);
      expect(icons[2].left).toBeGreaterThanOrEqual(icons[1].right);
    }
  }
});

test('Community icons and anchor work without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce' });
  const page = await context.newPage();
  try {
    await page.goto(new URL('/learn.html', baseURL).href);
    const button = await checkIcons(page);
    await button.click();
    await expect(page).toHaveURL(/learn\.html#community$/);
    await expect(page.locator('#community')).toBeInViewport();
  } finally { await context.close(); }
});
