import { test, expect } from '@playwright/test';

// Reproduce the real early-input failure by holding a module dependency, not by
// sleeping and hoping to hit a timing window. Keep native pointer/keyboard input.
for (const method of ['pointer', 'keyboard']) {
  test(`quiz becomes actionable only after startup: ${method}`, async ({ page, hasTouch }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    let requested = false;
    await page.route('**/assets/js/quiz-confetti.js*', async route => {
      requested = true;
      await gate;
      await route.continue();
    });
    try {
      await page.goto('/quiz.html', { waitUntil: 'commit' });
      const start = page.locator('#start-quiz');
      await expect(start).toBeVisible();
      await expect.poll(() => requested).toBe(true);
      await expect(start).toBeDisabled();
      await expect(page.locator('#question-panel')).toBeHidden();
      release();
      await expect(start).toBeEnabled();
      if (method === 'keyboard') await start.press('Enter');
      else if (hasTouch) await start.tap();
      else await start.click();
      await expect(page.locator('#question-panel')).toBeVisible();
      await expect(page.locator('#question-progress')).toHaveText('Question 1 of 10');
      await expect(page.locator('#answer-options button')).toHaveCount(4);
      await expect(page.locator('#question-text')).toBeFocused();
      expect(errors).toEqual([]);
    } finally {
      release();
      await page.unrouteAll({ behavior: 'wait' });
    }
  });
}
