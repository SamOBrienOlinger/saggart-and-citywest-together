import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
const pages = readdirSync('.').filter(name => name.endsWith('.html')).sort();
test('existing footer quiz links use Quiz with unchanged destinations and styling', async ({ page }) => {
  for (const name of pages) {
    await page.goto('/' + name);
    const footer = readFileSync(name, 'utf8').match(/<footer\b[\s\S]*?<\/footer>/)[0];
    const expectedCount = footer.includes('<a href="quiz.html">Quiz</a>') ? 1 : 0;
    const link = page.locator('.site-footer a[href="quiz.html"]');
    await expect(link).toHaveCount(expectedCount);
    await expect(page.locator('#site-menu a[data-nav="quiz"]')).toHaveCount(1);
    if (!expectedCount) continue;
    await expect(link).toHaveText('Quiz');
    await expect(link).toHaveAccessibleName('Quiz');
    expect(await link.evaluate(el => {
      const style = getComputedStyle(el);
      const peer = getComputedStyle(document.querySelector('.site-footer a[href="facts.html"]'));
      return [style.backgroundColor, style.borderRadius, style.font].join('|') === [peer.backgroundColor, peer.borderRadius, peer.font].join('|');
    })).toBe(true);
  }
});
test('footer Quiz opens the working quiz with touch, click and keyboard', async ({ page, hasTouch }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const method of ['pointer', 'keyboard']) {
    await page.goto('/index.html');
    const link = page.locator('.site-footer a[href="quiz.html"]');
    if (method === 'keyboard') await link.press('Enter');
    else if (hasTouch) await link.tap();
    else await link.click();
    await expect(page).toHaveURL(/\/quiz\.html$/);
    await expect(page.locator('#start-quiz')).toBeVisible();
    await page.locator('#start-quiz').click();
    await expect(page.locator('#question-panel')).toBeVisible();
  }
});
