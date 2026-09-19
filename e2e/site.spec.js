import { test, expect } from '@playwright/test';
import { questions } from '../assets/data/questions.js';

const pages = ['index.html', 'learn.html', 'facts.html', 'citywest-supports.html', 'gallery.html', 'quiz.html', 'contact.html', 'about.html', 'privacy.html', 'accessibility.html'];
const answers = new Map(questions.map(q => [q.question, q.options[q.correctIndex]]));

async function fitsViewport(page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
}
async function activate(locator, touch) {
  if (touch) await locator.tap();
  else await locator.click();
}
async function openMenuIfNeeded(page) {
  const toggle = page.getByRole('button', { name: 'Toggle navigation', exact: true });
  if (await toggle.isVisible()) await toggle.click();
  return toggle;
}

test('primary pages load without script errors or horizontal overflow', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const path of pages) {
    const response = await page.goto('/' + path);
    expect(response.status(), path).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.site-header')).toHaveClass(/nav-ready/);
    await fitsViewport(page);
  }
  expect(errors).toEqual([]);
});

test('approved homepage order, service destinations and visual evidence', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Our area. Our story. Together.', { useInnerText: true });
  await expect(page.getByRole('link', { name: 'Try the 10-question quiz', exact: true })).toHaveCount(1);
  expect(await page.locator('.quiz-strip').evaluate(el => !!(el.compareDocumentPosition(document.querySelector('#local-services')) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  for (const [name, path, target] of [
    ['Health services', 'learn.html#health', '#health'],
    ['English classes', 'citywest-supports.html#english-classes', '#english-classes'],
    ['Work and training', 'citywest-supports.html#work-and-training', '#work-and-training'],
    ['Citywest IPAS supports', 'citywest-supports.html#support-table', '#support-table'],
  ]) {
    await expect(page.getByRole('link', { name, exact: true })).toHaveAttribute('href', path);
    await page.goto('/' + path);
    await expect(page.locator(target)).toBeAttached();
    await page.goto('/');
  }
  await page.locator('.community-carousel').scrollIntoViewIfNeeded();
  // Decode every thumbnail that appears in the captured rail.
  await page.locator('.carousel-thumb img').evaluateAll(images => Promise.all(images.slice(0, 5).map(img => img.decode())));
  await page.screenshot({ path: testInfo.outputPath('homepage.png'), fullPage: true });
  await testInfo.attach('Homepage', { path: testInfo.outputPath('homepage.png'), contentType: 'image/png' });
});

test('all carousel media, wrap-around, keyboard and full-image dialog work', async ({ page, hasTouch }) => {
  await page.goto('/');
  const thumbs = page.locator('.carousel-thumb');
  const slides = page.locator('.community-slide');
  await expect(thumbs).toHaveCount(10);
  for (let index = 0; index < 10; index++) {
    await activate(thumbs.nth(index), hasTouch);
    await expect(page.locator('[data-current]')).toHaveText(String(index + 1));
    await expect(page.locator('.carousel-thumb[aria-current="true"]')).toHaveCount(1);
    await expect(slides.nth(index)).toHaveAttribute('aria-hidden', 'false');
    await expect.poll(() => slides.nth(index).locator('img').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  }
  await activate(page.getByRole('button', { name: 'Next image', exact: true }), hasTouch);
  await expect(page.locator('[data-current]')).toHaveText('1');
  await activate(page.getByRole('button', { name: 'Previous image', exact: true }), hasTouch);
  await expect(page.locator('[data-current]')).toHaveText('10');
  await page.getByRole('button', { name: 'Next image', exact: true }).press('Home');
  await expect(page.locator('[data-current]')).toHaveText('1');
  await page.getByRole('button', { name: 'Next image', exact: true }).press('ArrowRight');
  await expect(page.locator('[data-current]')).toHaveText('2');
  const opener = slides.nth(1).getByRole('button');
  await activate(opener, hasTouch);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect.poll(() => page.locator('.dialog-image').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(opener).toBeFocused();
});

test('navigation, languages and real contact route work', async ({ page, context, hasTouch }) => {
  await page.goto('/');
  await openMenuIfNeeded(page);
  await activate(page.getByRole('button', { name: 'Languages', exact: true }), hasTouch);
  await expect(page.locator('.translation-panel')).toBeVisible();
  await expect(page.locator('.translation-link')).toHaveCount(6);
  await page.keyboard.press('Escape');
  await expect(page.locator('.translation-panel')).not.toBeVisible();
  await page.locator('#site-menu').getByRole('link', { name: 'Get involved', exact: true }).click();
  await expect(page).toHaveURL(/contact\.html#contact-details$/);
  await expect(page.getByRole('link', { name: 'Email the community', exact: true })).toHaveAttribute('href', 'mailto:saggartcitywesttogether@gmail.com');
  await expect(page.locator('form')).toHaveCount(0);
  await expect(page.getByText('This opens your email app. Write and send your message there.')).toBeVisible();
  await fitsViewport(page);

  // Verify the external handoff without relying on Google's live service.
  await context.route('https://translate.google.com/**', route => route.fulfill({ body: 'Translation handoff' }));
  await page.goto('/');
  await openMenuIfNeeded(page);
  const languages = page.getByRole('button', { name: 'Languages', exact: true });
  await activate(languages, hasTouch);
  await languages.focus();
  const popupPromise = context.waitForEvent('page');
  await activate(page.locator('.translation-link').first(), hasTouch);
  const popup = await popupPromise;
  await expect(popup).toHaveURL(/https:\/\/translate\.google\.com\/translate\?.*tl=ar/);
  await popup.close();
  await expect(page.locator('.translation-panel')).not.toBeVisible();
});

test('complete shuffled quiz scores correctly and restarts', async ({ page, hasTouch }) => {
  await page.goto('/quiz.html');
  await activate(page.getByRole('button', { name: 'Start quiz', exact: true }), hasTouch);
  const seen = new Set();
  for (let i = 0; i < 10; i++) {
    await expect(page.locator('#question-progress')).toHaveText(`Question ${i + 1} of 10`);
    await expect(page.locator('#question-text')).toBeFocused();
    const question = await page.locator('#question-text').innerText();
    expect(seen.has(question)).toBe(false);
    seen.add(question);
    const options = await page.locator('#answer-options button').allTextContents();
    const correct = answers.get(question);
    expect(options).toContain(correct);
    const chosen = i < 3 ? options.find(option => option !== correct) : correct;
    await activate(page.getByRole('button', { name: chosen, exact: true }), hasTouch);
    await expect(page.locator('#feedback')).toContainText(i < 3 ? 'Not quite.' : 'Correct!');
    await expect(page.locator('#answer-options button.correct')).toHaveText(correct);
    await expect(page.locator('#current-score')).toHaveText(String(Math.max(0, i - 2)));
    await expect(page.locator('#next-question')).toBeFocused();
    await activate(page.locator('#next-question'), hasTouch);
  }
  await expect(page.locator('#result-heading')).toBeFocused();
  await expect(page.locator('#result-score')).toHaveText('7/10');
  await expect(page.locator('#best-score-result')).toHaveText('Your best score: 7/10');
  await page.reload();
  await expect(page.locator('#best-score-intro')).toHaveText('Your best score: 7/10');
  await page.locator('#start-quiz').click();
  await expect(page.locator('#current-score')).toHaveText('0');
  await expect(page.locator('#question-progress')).toHaveText('Question 1 of 10');
});

test('enlarged text, reduced motion and RTL carousel remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of ['index.html', 'contact.html', 'quiz.html', 'facts.html']) {
    await page.goto('/' + path);
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    await fitsViewport(page);
  }
  await page.goto('/');
  await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
  const next = page.getByRole('button', { name: 'Next image', exact: true });
  await next.press('ArrowLeft');
  await expect(page.locator('[data-current]')).toHaveText('2');
  await next.press('ArrowRight');
  await expect(page.locator('[data-current]')).toHaveText('1');
  await next.press('End');
  await expect(page.locator('[data-current]')).toHaveText('10');
  await fitsViewport(page);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('essential navigation, services and contact remain available', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#site-menu')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Local services', exact: true })).toBeVisible();
    await fitsViewport(page);
    await page.locator('#site-menu').getByRole('link', { name: 'Get involved', exact: true }).click();
    await expect(page.getByRole('link', { name: 'Email the community', exact: true })).toHaveAttribute('href', 'mailto:saggartcitywesttogether@gmail.com');
    await fitsViewport(page);
    // Start a separate Facts journey after the native Contact hash-scroll.
    // With scripts disabled, mobile automation can stall in its stability retry
    // if a click races that browser-driven smooth scroll.
    await page.goto('/');
    await page.locator('#site-menu').getByRole('link', { name: 'Facts', exact: true }).click();
    await expect(page.locator('#migration .facts-resource')).toHaveCount(10);
    await page.locator('summary', { hasText: 'Earlier census data' }).click();
    await expect(page.getByRole('link', { name: /^Census 2016 Small Area Population Statistics/ })).toBeVisible();
    await fitsViewport(page);
  });
});


test('Facts is discoverable and its local-data directory works', async ({ page, hasTouch }, testInfo) => {
  await page.goto('/');
  await openMenuIfNeeded(page);
  await activate(page.locator('#site-menu').getByRole('link', { name: 'Facts', exact: true }), hasTouch);
  await expect(page).toHaveURL(/facts\.html$/);
  await expect(page.locator('[data-nav="facts"]')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('#migration .facts-resource')).toHaveCount(10);
  await expect(page.locator('#information .facts-resource')).toHaveCount(3);
  await expect(page.locator('#digital-literacy .facts-resource')).toHaveCount(3);
  await page.locator('.facts-jumps a[href="#local-cso"]').click();
  await expect(page.locator('#cso-title')).toBeInViewport();
  await expect(page.locator('.facts-publications:not(.facts-additional-publications) li')).toHaveCount(10);
  const earlier = page.locator('summary', { hasText: 'Earlier census data' });
  await activate(earlier, hasTouch);
  await expect(page.getByRole('link', { name: /^Census 2016 Small Area Population Statistics/ })).toBeVisible();
  await fitsViewport(page);
  await page.goto('/facts.html');
  await page.screenshot({ path: testInfo.outputPath('facts.png'), fullPage: true });
  await testInfo.attach('Facts page', { path: testInfo.outputPath('facts.png'), contentType: 'image/png' });
});

test('language choices cover every page and follow the current section', async ({page, hasTouch}) => {
  for (const path of pages) {
    await page.goto('/' + path);
    await openMenuIfNeeded(page);
    await activate(page.getByRole('button', {name:'Languages', exact:true}), hasTouch);
    const links = page.locator('.translation-link');
    await expect(links).toHaveCount(6);
    for (const link of await links.all()) {
      const url = new URL(await link.getAttribute('href'));
      expect(url.searchParams.get('u')).toBe(page.url());
      expect(['ar','fr','nl','de','it','es']).toContain(url.searchParams.get('tl'));
      await expect(link).toHaveAttribute('target', '_blank');
    }
    await fitsViewport(page);
  }
  await page.goto('/facts.html');
  await page.locator('.facts-jumps a[href="#local-cso"]').click();
  await openMenuIfNeeded(page);
  await activate(page.getByRole('button', {name:'Languages', exact:true}), hasTouch);
  expect(new URL(await page.locator('.translation-link').first().getAttribute('href')).searchParams.get('u')).toMatch(/facts\.html#local-cso$/);
});

test('right-to-left translated layout retains the language switch and English return', async ({page,context,hasTouch}) => {
  // Serve the site's actual files under the translation host. This checks our
  // integration and RTL layout, not the quality of Google's translations.
  const {readFile} = await import('node:fs/promises');
  await context.route('https://samobrienolinger-github-io.translate.goog/**', async route => {
    const pathname = new URL(route.request().url()).pathname.replace('/saggart-and-citywest-together/', '');
    const contentType = pathname.endsWith('.css') ? 'text/css' : pathname.endsWith('.js') ? 'text/javascript' : pathname.endsWith('.png') ? 'image/png' : 'text/html';
    await route.fulfill({body:await readFile(pathname || 'index.html'),contentType});
  });
  await page.goto('https://samobrienolinger-github-io.translate.goog/saggart-and-citywest-together/facts.html?_x_tr_sl=en&_x_tr_tl=ar#digital-literacy');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await expect(page.locator('html')).toHaveAttribute('lang','ar');
  await page.evaluate(() => { document.querySelector('h1').textContent='حقائق'; });
  await openMenuIfNeeded(page);
  await activate(page.getByRole('button',{name:'Languages',exact:true}),hasTouch);
  await expect(page.locator('.translation-original')).toHaveAttribute('href','https://samobrienolinger.github.io/saggart-and-citywest-together/facts.html#digital-literacy');
  expect(new URL(await page.locator('[data-language="fr"]').getAttribute('href')).searchParams.get('u')).toBe('https://samobrienolinger.github.io/saggart-and-citywest-together/facts.html#digital-literacy');
  await fitsViewport(page);
});
