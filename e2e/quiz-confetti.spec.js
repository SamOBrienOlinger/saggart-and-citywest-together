import { test, expect } from '@playwright/test';
import { questions } from '../assets/data/questions.js';

const answers = new Map(questions.map(item => [item.question, item.options[item.correctIndex]]));

async function completeQuiz(page, score) {
  await page.goto('/quiz.html');
  await expect(page.locator('#stop-confetti')).toBeHidden();
  await expect(page.locator('.quiz-confetti')).toHaveCount(0);
  await page.locator('#start-quiz').press('Enter');
  const seen = new Set();
  for (let index = 0; index < 10; index++) {
    await expect(page.locator('#question-progress')).toHaveText(`Question ${index + 1} of 10`);
    const question = await page.locator('#question-text').innerText();
    expect(seen.has(question)).toBe(false);
    seen.add(question);
    const correct = answers.get(question);
    const options = await page.locator('#answer-options button').allTextContents();
    expect(options).toContain(correct);
    const choice = index < score ? correct : options.find(option => option !== correct);
    await page.getByRole('button', { name: choice, exact: true }).press('Enter');
    await expect(page.locator('#current-score')).toHaveText(String(Math.min(index + 1, score)));
    await expect(page.locator('.quiz-confetti')).toHaveCount(0);
    await page.locator('#next-question').press('Enter');
  }
  await expect(page.locator('#result-score')).toHaveText(`${score}/10`);
  await expect(page.locator('#result-heading')).toBeFocused();
}

for (const score of [0, 3, 4, 6, 7, 10]) {
  test(`quiz confetti matches a completed ${score}/10 result`, async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await completeQuiz(page, score);
    const overlay = page.locator('.quiz-confetti');
    if (score >= 4 && score < 7) {
      await expect(overlay).toHaveCount(0);
      await expect(page.locator('#stop-confetti')).toBeHidden();
      return;
    }
    const gentle = score < 4;
    await expect(overlay).toHaveCount(1);
    await expect(overlay).toHaveAttribute('data-confetti-mode', gentle ? 'gentle' : 'celebration');
    await expect(overlay).toHaveAttribute('aria-hidden', 'true');
    await expect(overlay).toHaveAttribute('inert', '');
    await expect(overlay).toHaveCSS('pointer-events', 'none');
    await expect(overlay.locator('.quiz-confetti-piece')).toHaveCount(gentle ? 6 : 84);
    const pieces = overlay.locator('.quiz-confetti-piece');
    const timings = await pieces.evaluateAll(nodes => nodes.map(node => ({
      name: getComputedStyle(node).animationName,
      duration: parseFloat(getComputedStyle(node).animationDuration),
      delay: parseFloat(getComputedStyle(node).animationDelay),
      iterations: getComputedStyle(node).animationIterationCount,
    })));
    for (const timing of timings) {
      expect(timing.name).toBe('quiz-confetti-fall');
      expect(timing.iterations).toBe('1');
      expect(timing.duration).toBeGreaterThanOrEqual(gentle ? 12 : 2.6);
      expect(timing.duration).toBeLessThanOrEqual(gentle ? 16 : 4);
      expect(timing.delay).toBeLessThanOrEqual(gentle ? .9 : .6);
    }
    // Wait for the earliest particle's real fall, not a manually forced end state.
    const first = pieces.first();
    const initial = await first.boundingBox();
    await expect.poll(async () => (await first.boundingBox())?.y ?? initial.y, { timeout: 2500 })
      .toBeGreaterThan(initial.y + 5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await expect(page.locator('#stop-confetti')).toBeVisible();
    await page.screenshot({ path: info.outputPath(`confetti-${score}.png`) });
  });
}

test('confetti uses this attempt, not a previously saved high score, and retry clears it', async ({ page, hasTouch }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => localStorage.setItem('kykQuizHighScore', '10'));
  await completeQuiz(page, 3);
  await expect(page.locator('#best-score-result')).toHaveText('Your best score: 10/10');
  await expect(page.locator('.quiz-confetti-piece')).toHaveCount(6);
  if (hasTouch) await page.locator('#try-again').tap();
  else await page.locator('#try-again').click();
  await expect(page.locator('.quiz-confetti')).toHaveCount(0);
  await expect(page.locator('#stop-confetti')).toBeHidden();
  await expect(page.locator('#current-score')).toHaveText('0');
  await expect(page.locator('#question-progress')).toHaveText('Question 1 of 10');
  await expect(page.locator('#question-text')).toBeFocused();
});

test('Stop confetti is keyboard accessible and does not alter results', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await completeQuiz(page, 3);
  await page.locator('#stop-confetti').press('Enter');
  await expect(page.locator('.quiz-confetti')).toHaveCount(0);
  await expect(page.locator('#stop-confetti')).toBeHidden();
  await expect(page.locator('#result-score')).toHaveText('3/10');
  await expect(page.locator('#result-heading')).toBeFocused();
  await expect(page.getByRole('link', { name: 'Review learning topics' })).toHaveAttribute('href', 'learn.html');
});

for (const score of [3, 7]) {
  test(`reduced motion suppresses confetti at ${score}/10 without affecting completion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await completeQuiz(page, score);
    await expect(page.locator('.quiz-confetti')).toHaveCount(0);
    await expect(page.locator('#stop-confetti')).toBeHidden();
    await expect(page.locator('#best-score-result')).toHaveText(`Your best score: ${score}/10`);
  });
}

test('changing reduced-motion preference stops an active effect', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await completeQuiz(page, 3);
  await expect(page.locator('.quiz-confetti-piece')).toHaveCount(6);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.quiz-confetti')).toHaveCount(0);
  await expect(page.locator('#stop-confetti')).toBeHidden();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.quiz-confetti')).toHaveCount(0);
});

test('a completed fall cleans itself up without stealing focus', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await completeQuiz(page, 7);
  await expect(page.locator('.quiz-confetti-piece')).toHaveCount(84);
  await page.locator('#try-again').focus();
  await expect(page.locator('.quiz-confetti')).toHaveCount(0, { timeout: 5500 });
  await expect(page.locator('#stop-confetti')).toBeHidden();
  await expect(page.locator('#try-again')).toBeFocused();
  await expect(page.locator('#result-score')).toHaveText('7/10');
});

test('gentle confetti can be stopped by touch with enlarged text and RTL', async ({ page, hasTouch }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await completeQuiz(page, 3);
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; document.documentElement.dir = 'rtl'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  if (hasTouch) await page.locator('#stop-confetti').tap();
  else await page.locator('#stop-confetti').click();
  await expect(page.locator('.quiz-confetti')).toHaveCount(0);
  await expect(page.locator('#result-score')).toHaveText('3/10');
});
