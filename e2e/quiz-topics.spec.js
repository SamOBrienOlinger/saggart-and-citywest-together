import { test, expect } from '@playwright/test';
import { questions } from '../assets/data/questions.js';

// Restrict only the test response to ten actual bank entries so every question,
// not just a random sample, is exercised through the unchanged production quiz.
for (let start = 0; start < questions.length; start += 10) {
  const batch = questions.slice(start, start + 10);
  test(`revised topics render, explain and score bank entries ${start + 1}-${start + batch.length}`, async ({ page }, info) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/assets/data/questions.js*', route => route.fulfill({
      status: 200, contentType: 'text/javascript', body: `export const questions = ${JSON.stringify(batch)};`
    }));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/quiz.html');
    await expect(page.locator('#quiz-intro')).toContainText('human rights');
    await page.locator('#start-quiz').press('Enter');
    const seen = new Set();
    for (let index = 0; index < 10; index++) {
      await expect(page.locator('#question-progress')).toHaveText(`Question ${index + 1} of 10`);
      const text = await page.locator('#question-text').innerText();
      const item = batch.find(question => question.question === text);
      expect(item, text).toBeTruthy();
      expect(seen.has(item.id)).toBe(false);
      seen.add(item.id);
      await expect(page.locator('#question-topic')).toHaveText(item.topic);
      await expect(page.locator('#answer-options button')).toHaveCount(4);
      await page.getByRole('button', { name: item.options[item.correctIndex], exact: true }).press('Enter');
      await expect(page.locator('#current-score')).toHaveText(String(index + 1));
      await expect(page.locator('#feedback')).toContainText(item.explanation);
      await expect(page.locator('#feedback a')).toHaveAttribute('href', item.sourceUrl);
      await expect(page.locator('#feedback a')).toHaveAttribute('rel', 'noopener noreferrer');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      const clipped = await page.locator('#question-text, #answer-options button, #feedback').evaluateAll(nodes =>
        nodes.filter(node => node.scrollWidth > node.clientWidth + 2).map(node => node.id || node.textContent)
      );
      expect(clipped).toEqual([]);
      if (['services-002', 'facts-004', 'rights-001', 'migration-002'].includes(item.id)) {
        await page.locator('#question-text').scrollIntoViewIfNeeded();
        await page.screenshot({ path: info.outputPath(`${item.id}.png`), fullPage: true });
      }
      await page.locator('#next-question').press('Enter');
    }
    expect(seen.size).toBe(10);
    await expect(page.locator('#result-score')).toHaveText('10/10');
    await page.locator('#try-again').press('Enter');
    await expect(page.locator('#question-progress')).toHaveText('Question 1 of 10');
    await expect(page.locator('#current-score')).toHaveText('0');
    expect(errors).toEqual([]);
  });
}
