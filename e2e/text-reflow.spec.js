import { test, expect } from '@playwright/test';
import { questions } from '../assets/data/questions.js';
import { expectTextReflow } from './text-reflow.mjs';

const pages = ['index.html', 'learn.html', 'facts.html', 'citywest-supports.html', 'quiz.html', 'contact.html', 'about.html', 'privacy.html', 'accessibility.html', '404.html', 'gallery.html'];
const answers = new Map(questions.map(question => [question.question, question.options[question.correctIndex]]));

async function checkPages(page, scale, testInfo, scriptsEnabled = true) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of pages) {
    await test.step(path, async () => {
      await page.goto('/' + path);
      if (scriptsEnabled && path === 'gallery.html') await expect(page).toHaveURL(/learn\.html#heritage$/);
      await expect(page.locator('main')).toBeVisible();
      await page.evaluate(scale => { document.documentElement.style.fontSize = `${scale * 100}%`; }, scale);
      // Firefox cannot resolve page promises when scripting is disabled.
      // This site uses system fonts, so synchronous layout measurement suffices.
      if (scriptsEnabled) await page.evaluate(() => document.fonts.ready);
      await expectTextReflow(page, expect, `${path} at ${scale * 100}% text`);
      const menu = page.getByRole('button', { name: 'Toggle navigation', exact: true });
      if (await menu.isVisible()) {
        await menu.click();
        await expect(menu).toHaveAttribute('aria-expanded', 'true');
        await expectTextReflow(page, expect, `${path} with navigation open`);
        await menu.click();
      }
      if (path === 'citywest-supports.html' && page.viewportSize().width === 390) {
        await testInfo.attach('Citywest heading', { body: await page.locator('.supports-hero').screenshot(), contentType: 'image/png' });
      }
    });
  }
}

for (const width of [320, 390, 430, 768, 1024, 1440]) {
  for (const scale of [1, 2]) {
    test(`text reflow: all pages at ${width}px and ${scale * 100}% text`, async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.endsWith('-desktop'), 'Desktop engines sweep the breakpoints; mobile profiles retain their device dimensions.');
      await page.setViewportSize({ width, height: 900 });
      await checkPages(page, scale, testInfo);
    });
  }
}

for (const scale of [1, 2]) {
  test(`text reflow: mobile profile at ${scale * 100}% text`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.endsWith('-desktop'), 'Desktop coverage is in the breakpoint sweep.');
    await checkPages(page, scale, testInfo);
  });
}

test.describe('text reflow without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  for (const scale of [1, 2]) {
    test(`all fallback pages at ${scale * 100}% text`, async ({ page }, testInfo) => {
      await checkPages(page, scale, testInfo, false);
    });
  }
});

test('text reflow: enlarged quiz questions, answers, feedback and results', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/quiz.html');
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await page.getByRole('button', { name: 'Start quiz', exact: true }).click();
  for (let index = 0; index < 10; index++) {
    await expect(page.locator('#question-progress')).toHaveText(`Question ${index + 1} of 10`);
    await expectTextReflow(page, expect, `question ${index + 1} and answers`);
    const answer = answers.get(await page.locator('#question-text').innerText());
    await page.getByRole('button', { name: answer, exact: true }).click();
    await expect(page.locator('#feedback')).toContainText('Correct!');
    await expectTextReflow(page, expect, `feedback ${index + 1}`);
    await page.locator('#next-question').click();
  }
  await expect(page.locator('#result-score')).toHaveText('10/10');
  await expectTextReflow(page, expect, 'enlarged quiz results');
});
