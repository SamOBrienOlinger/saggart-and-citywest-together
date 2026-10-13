import { test, expect } from '@playwright/test';
import { inspectButtonAppearance } from './button-appearance.mjs';
import { expectTextReflow } from './text-reflow.mjs';

const pages = ['index.html', 'learn.html', 'facts.html', 'citywest-supports.html',
  'quiz.html', 'contact.html', 'about.html', 'privacy.html', 'accessibility.html',
  '404.html', 'gallery.html', 'missing/does-not-exist.html'];

async function open(page, path) {
  await page.goto('/' + path);
  if (path === 'gallery.html') await expect(page).toHaveURL(/learn\.html#heritage$/);
  await expect(page.locator('.site-header')).toHaveClass(/nav-ready/);
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.activeElement?.blur());
}

test('all text and icon buttons match Get involved, including generated controls', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, 'index.html');
  const reference = (await page.evaluate(inspectButtonAppearance)).standard;
  expect(reference.backgroundColor).toBe('rgb(0, 75, 80)');
  expect(reference.color).toBe('rgb(255, 255, 255)');
  expect(reference.borderRadius).toBe('999px');
  expect(reference.minHeight).toBe('48px');
  for (const path of pages) {
    await test.step(path, async () => {
      await open(page, path);
      const toggle = page.getByRole('button', { name: 'Toggle navigation', exact: true });
      if (await toggle.isVisible()) await toggle.click();
      await page.getByRole('button', { name: 'Languages', exact: true }).click();
      await expect(page.locator('.translation-panel')).toBeVisible();
      await page.mouse.move(0, 0);
      await page.evaluate(() => document.activeElement?.blur());
      const result = await page.evaluate(inspectButtonAppearance, reference);
      expect(result.checked, path).toBeGreaterThan(0);
      expect(result.issues, path).toEqual([]);
      await expectTextReflow(page, expect, `${path} with button styles and languages open`);
    });
  }
  await open(page, 'quiz.html');
  await page.locator('#start-quiz').click();
  await expect.poll(() => page.locator('.answer-button').count()).toBeGreaterThanOrEqual(2);
  expect((await page.evaluate(inspectButtonAppearance, reference)).issues).toEqual([]);
  await page.locator('.answer-button').first().click();
  await expect(page.locator('.answer-button.correct .answer-state')).toHaveText('Correct');
  for (const answer of await page.locator('.answer-button').all()) await expect(answer).toBeDisabled();
  const disabled = page.locator('.answer-button').first();
  const beforeHover = await disabled.evaluate(element => ({ color: getComputedStyle(element).color,
    background: getComputedStyle(element).backgroundColor }));
  await disabled.hover();
  expect(await disabled.evaluate(element => ({ color: getComputedStyle(element).color,
    background: getComputedStyle(element).backgroundColor }))).toEqual(beforeHover);
  await testInfo.attach('Shared quiz buttons and answer feedback', {
    body: await page.locator('#question-panel').screenshot(), contentType: 'image/png',
  });
  await open(page, 'learn.html');
  await testInfo.attach('Shared topic buttons', {
    body: await page.locator('.explore-directory').screenshot(), contentType: 'image/png',
  });
  await open(page, 'citywest-supports.html');
  await testInfo.attach('Shared service buttons', {
    body: await page.locator('.supports-table-wrap').screenshot(), contentType: 'image/png',
  });
});

async function interactionStates(page, control, touch) {
  const appearance = () => control.evaluate(element => {
    const styles = getComputedStyle(element);
    return Object.fromEntries(['color', 'backgroundColor', 'textDecorationLine',
      'outlineColor', 'outlineWidth', 'outlineOffset', 'boxShadow', 'transform']
      .map(property => [property, styles[property]]));
  });
  const states = {};
  await control.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await control.evaluate(element => element.blur());
  if (!touch) {
    await control.hover();
    states.hover = await appearance();
    await page.mouse.move(0, 0);
  }
  await page.keyboard.press('Tab');
  await control.focus();
  await expect(control).toBeFocused();
  states.focus = await appearance();
  await control.evaluate(element => element.blur());
  await control.hover();
  await page.mouse.down();
  await expect(control).toHaveCSS('background-color', 'rgb(116, 53, 29)');
  states.pressed = await appearance();
  // Release outside the control so this style check cannot activate its action.
  await page.mouse.move(0, 0);
  await page.mouse.up();
  await control.evaluate(element => element.blur());
  return states;
}

test('buttons share hover, keyboard focus and pressed feedback without movement', async ({ page, hasTouch }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, 'index.html');
  const reference = await interactionStates(page, page.locator('.community-actions .pill-button'), hasTouch);
  for (const [path, selector] of [
    ['index.html', '.quiz-link'], ['index.html', '.carousel-arrow'],
    ['learn.html', '.explore-topic'], ['learn.html', '.gallery-control'],
    ['quiz.html', '#start-quiz'], ['contact.html', 'a.button'],
    ['about.html', 'a.button'], ['facts.html', '.facts-jumps a'],
    ['facts.html', 'summary'], ['citywest-supports.html', '.service-button'],
  ]) {
    await open(page, path);
    const control = page.locator(selector).first();
    expect(await interactionStates(page, control, hasTouch), `${path} ${selector}`).toEqual(reference);
  }
});
