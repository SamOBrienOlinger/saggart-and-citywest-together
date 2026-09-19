import { test, expect } from '@playwright/test';
import { questions } from '../assets/data/questions.js';

const pages = ['index.html', 'learn.html', 'facts.html', 'citywest-supports.html', 'quiz.html', 'contact.html', 'about.html', 'privacy.html', 'accessibility.html'];
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
    await expect(page.locator('footer')).toContainText('© 2026 Sam Tim Solutions.');
    await expect(page.locator('footer')).not.toContainText('Information comes from public sources.');
    await expect(page.locator('footer')).not.toContainText('endorse');
    await fitsViewport(page);
  }
  expect(errors).toEqual([]);
});

// Read the rendered foreground/background, including transparent parent layers.
async function buttonContrast(locator) {
  return locator.evaluate(element => {
    const rgb = color => color.match(/[\d.]+/g).map(Number);
    const luminance = channels => channels.slice(0, 3).map(value => {
      value /= 255;
      return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
    }).reduce((sum, value, i) => sum + value * [.2126, .7152, .0722][i], 0);
    const foreground = rgb(getComputedStyle(element).color);
    let current = element, background;
    while (current) {
      background = rgb(getComputedStyle(current).backgroundColor);
      if (background.length === 3 || background[3] === 1) break;
      current = current.parentElement;
    }
    const values = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
    return (values[1] + .05) / (values[0] + .05);
  });
}

test('button text stays legible and visits do not leave links tinted', async ({page, hasTouch}, testInfo) => {
  await page.goto('/');
  const pill = page.locator('.pill-button');
  await pill.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const before = await pill.screenshot();
  expect(await buttonContrast(pill)).toBeGreaterThanOrEqual(4.5);
  await activate(pill, hasTouch);
  await expect(page).toHaveURL(/contact\.html#contact-details$/);
  await page.goBack();
  await page.mouse.move(0, 0);
  // Computed styles deliberately conceal :visited colours; compare rendered pixels.
  const after = await pill.screenshot();
  await testInfo.attach('Button after returning', {body: after, contentType:'image/png'});
  expect(after.equals(before)).toBe(true);

  for (const path of ['citywest-supports.html', 'quiz.html']) {
    await page.goto('/' + path);
    const controls = page.locator('.service-button, button.button:visible');
    for (const control of await controls.all()) {
      expect(await buttonContrast(control), await control.textContent()).toBeGreaterThanOrEqual(4.5);
      if (!hasTouch) {
        await control.hover();
        expect(await buttonContrast(control), 'hover: ' + await control.textContent()).toBeGreaterThanOrEqual(4.5);
        await page.mouse.move(0, 0);
      }
    }
  }
});

test('links visibly respond while hovered or held, then return to normal', async ({page, hasTouch}) => {
  await page.goto('/facts.html');
  // Include selected navigation, section cards, external resources and footer links.
  await openMenuIfNeeded(page);
  for (const selector of ['[data-nav="facts"]', '.facts-jumps a', '.facts-resource a', 'footer a']) {
    const link = page.locator(selector).first();
    await link.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    const normal = await link.evaluate(el => ({color:getComputedStyle(el).color, background:getComputedStyle(el).backgroundColor}));
    // Locator hover chooses a painted text rectangle, including links that wrap.
    await link.hover();
    if (!hasTouch) {
      await expect(link).not.toHaveCSS('color', normal.color);
      expect(await buttonContrast(link)).toBeGreaterThanOrEqual(4.5);
    }
    // Keep this state check on the page; actual navigation is covered by the journeys above.
    await link.evaluate(el => el.addEventListener('click', event => event.preventDefault(), {once:true}));
    await page.mouse.down();
    await expect(link).toHaveCSS('background-color', 'rgb(116, 53, 29)');
    expect(await buttonContrast(link)).toBeGreaterThanOrEqual(4.5);
    await page.mouse.up();
    await page.mouse.move(0, 0);
    await expect(link).toHaveCSS('color', normal.color);
    await expect(link).toHaveCSS('background-color', normal.background);
    if (hasTouch && selector !== '[data-nav="facts"]') {
      await link.evaluate(el => el.addEventListener('click', event => event.preventDefault(), {once:true}));
      await link.tap();
      await expect(link).toHaveCSS('color', normal.color);
      await expect(link).toHaveCSS('background-color', normal.background);
    }
    if (selector === '[data-nav="facts"]') {
      const toggle = page.getByRole('button', {name:'Toggle navigation', exact:true});
      if (await toggle.isVisible() && await toggle.getAttribute('aria-expanded') === 'true') await activate(toggle, hasTouch);
    }
  }
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

test('history combines photographs, full images and related local stories', async ({page, hasTouch}, testInfo) => {
  await page.goto('/learn.html');
  await activate(page.locator('.explore-topic--heritage'), hasTouch);
  await expect(page.locator('#heritage > .learning-section-header')).toBeInViewport();
  const gallery = page.locator('#heritage .photo-gallery');
  const thumbnails = gallery.locator('.gallery-thumbnail');
  const slides = gallery.locator('.gallery-slide');
  await expect(thumbnails).toHaveCount(6);
  await expect(page.locator('#heritage .learning-card')).toHaveCount(3);
  for (let index = 0; index < 6; index++) {
    await activate(thumbnails.nth(index), hasTouch);
    await expect(gallery.locator('[data-gallery-count]')).toHaveText(`${index + 1} / 6`);
    await expect(slides.nth(index)).toBeVisible();
    await expect(slides.nth(index).locator('.gallery-main-photo')).toHaveJSProperty('complete', true);
    await expect.poll(() => slides.nth(index).locator('.gallery-main-photo').evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
    await expect(gallery.locator('.gallery-thumbnail[aria-pressed="true"]')).toHaveCount(1);
    await fitsViewport(page);
  }
  const next = gallery.getByRole('button', {name:'Next photograph', exact:true});
  await activate(next, hasTouch);
  await expect(gallery.locator('[data-gallery-count]')).toHaveText('1 / 6');
  await next.press('End');
  await expect(gallery.locator('[data-gallery-count]')).toHaveText('6 / 6');
  await next.press('Home');
  await expect(gallery.locator('[data-gallery-count]')).toHaveText('1 / 6');
  const open = gallery.locator('.gallery-slide:not([hidden]) [data-gallery-open]');
  await activate(open, hasTouch);
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('h2')).toHaveText('A historic view of Saggart');
  await expect(dialog.locator('img')).toHaveAttribute('src', /historic-saggart-400.webp$/);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(open).toBeFocused();
  await page.getByRole('link', {name:'Read the local stories', exact:true}).click();
  await expect(page.locator('#history-stories')).toBeInViewport();
  await page.getByRole('link', {name:'See the mill photograph', exact:true}).click();
  await expect(page.locator('#photo-mill')).toBeVisible();
  await expect(gallery.locator('[data-gallery-count]')).toHaveText('3 / 6');
  await gallery.screenshot({path:testInfo.outputPath('history-gallery.png')});
  await testInfo.attach('Integrated history gallery', {path:testInfo.outputPath('history-gallery.png'),contentType:'image/png'});
});

test('saved gallery links, right-to-left browsing and translated captions work', async ({page, hasTouch}) => {
  await page.goto('/gallery.html');
  await expect(page).toHaveURL(/learn\.html#heritage$/);
  await expect(page.locator('#heritage .photo-gallery')).toBeVisible();
  await page.goto('/gallery.html?view=saved#photo-luas');
  await expect(page).toHaveURL(/learn\.html\?view=saved#photo-luas$/);
  await expect(page.locator('#photo-luas')).toBeVisible();
  await expect(page.locator('[data-gallery-count]')).toHaveText('5 / 6');
  await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
  const next = page.getByRole('button',{name:'Next photograph',exact:true});
  await next.press('ArrowLeft');
  await expect(page.locator('[data-gallery-count]')).toHaveText('6 / 6');
  await next.press('ArrowRight');
  await expect(page.locator('[data-gallery-count]')).toHaveText('5 / 6');
  // Simulate translated DOM text; opening the dialog must not restore English.
  await page.locator('#photo-luas [data-gallery-title]').evaluate(el => { el.textContent = 'وصول الترام'; });
  await activate(page.locator('#photo-luas [data-gallery-open]'), hasTouch);
  await expect(page.locator('#history-dialog-title')).toHaveText('وصول الترام');
  await activate(page.getByRole('button',{name:'Close',exact:true}), hasTouch);
  await fitsViewport(page);
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
    await expect(page.locator('#answer-options button.correct')).toContainText(correct);
    await expect(page.locator('#answer-options button.correct .answer-state')).toHaveText('Correct');
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
  for (const path of ['index.html', 'learn.html#heritage', 'contact.html', 'quiz.html', 'facts.html']) {
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
    await page.goto('/gallery.html');
    await page.getByRole('link', {name:'Explore history and photographs', exact:true}).click();
    await expect(page).toHaveURL(/learn\.html#heritage$/);
    await expect(page.locator('.gallery-slide:visible')).toHaveCount(6);
    await expect(page.locator('.gallery-navigation')).toBeHidden();
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
  const localJump = page.locator('.facts-jumps a[href="#local-cso"]');
  await localJump.focus();
  await expect(localJump).toHaveCSS('background-color', 'rgb(255, 240, 213)');
  await localJump.click();
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
