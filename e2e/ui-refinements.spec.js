import { test, expect } from '@playwright/test';
import { expectTextReflow } from './text-reflow.mjs';
const email = 'saggartcitywesttogether@gmail.com';

// Original event posters remain slides 7-9, not a separate disclosure.
async function checkGalleryPosters(page, hasTouch, scripts = true) {
  const files = ['potluck-poster.jpg', 'human-library-poster.jpg', 'village-clean-up-poster.jpg'];
  await expect(page.locator('.community-slide')).toHaveCount(21);
  await expect(page.locator('.event-archive')).toHaveCount(0);
  for (let i = 0; i < files.length; i++) {
    const slide = page.locator('.community-slide').nth(i + 6);
    if (scripts) {
      const thumbnail = page.locator('.carousel-thumb').nth(i + 6);
      if (hasTouch) await thumbnail.tap();
      else await thumbnail.click();
      await expect(page.locator('[data-current]')).toHaveText(String(i + 7));
      await expect(slide).toHaveAttribute('aria-hidden', 'false');
    } else {
      // Scroll the real, native no-script rail; do not change the slide state.
      await slide.evaluate(el => el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' }));
    }
    const image = slide.locator('img');
    await expect(image).toHaveAttribute('src', 'assets/images/community/' + files[i]);
    await expect(image).toBeInViewport();
    await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    if (scripts) {
      const open = slide.getByRole('button');
      if (hasTouch) await open.tap();
      else await open.click();
      await expect(page.locator('.image-dialog')).toBeVisible();
      await expect(page.locator('.dialog-image')).toHaveAttribute('src', new RegExp(files[i].replaceAll('.', '\\.') + '$'));
      await expect.poll(() => page.locator('.dialog-image').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
      if (hasTouch) await page.locator('.dialog-close').tap();
      else await page.locator('.dialog-close').click();
      await expect(page.locator('.image-dialog')).not.toBeVisible();
      await expect(open).toBeFocused();
    }
  }
}

async function contact(page) {
  await page.goto('/contact.html');
  await expect(page.locator('#copy-email')).toBeVisible();
}
test('copy email succeeds, announces the result and does not steal keyboard focus', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async value => { window.testCopiedEmail = value; },
    } });
  });
  await contact(page);
  const copy = page.locator('#copy-email');
  await copy.focus();
  await copy.press('Enter');
  await expect(page.locator('#copy-email-status')).toHaveText('Email address copied.');
  await expect(copy).toBeFocused();
  expect(await page.evaluate(() => window.testCopiedEmail)).toBe(email);
  await expect(page.locator('#copy-email-status')).toHaveAttribute('role', 'status');
  await copy.press('Enter');
  await expect(page.locator('#copy-email-status')).toHaveText('Email address copied.');
});
for (const mode of ['denied', 'unavailable']) {
  test(`copy email provides a truthful manual fallback when clipboard is ${mode}`, async ({ page }) => {
    await page.addInitScript(mode => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: mode === 'unavailable' ? undefined : {
        writeText: async () => { throw new Error('Permission denied'); },
      } });
    }, mode);
    await contact(page);
    await page.locator('#copy-email').click();
    await expect(page.locator('#copy-email-status')).toContainText('Automatic copying is unavailable.');
    await expect(page.locator('#copy-email-status')).not.toContainText('Email address copied.');
    expect(await page.evaluate(() => getSelection().toString())).toBe(email);
    await expect(page.locator('#contact-email')).toHaveAttribute('href', 'mailto:' + email);
  });
}
test('clipboard messages use the translated page text', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', {
    configurable: true, value: { writeText: async () => {} },
  }));
  await contact(page);
  await page.locator('#copy-email-success').evaluate(element => { element.textContent = 'Adresse e-mail copiée.'; });
  await page.locator('#copy-email').click();
  await expect(page.locator('#copy-email-status')).toHaveText('Adresse e-mail copiée.');
});
test('task links, Facts order and original gallery posters are usable with enlarged text and RTL', async ({ page, hasTouch }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/citywest-supports.html');
  for (const id of ['english-classes', 'work-and-training', 'rights-and-advice', 'local-service-help']) {
    await page.locator(`.supports-jumps [href="#${id}"]`).click();
    await expect(page).toHaveURL(new RegExp('#' + id + '$'));
    await expect(page.locator('#' + id)).toBeInViewport();
  }
  await page.goto('/facts.html');
  await expect(page.locator('.facts-resource > h3.resource-purpose')).toHaveCount(16);
  expect(await page.locator('.facts-resource').evaluateAll(articles => articles.every(a => a.firstElementChild.matches('h3.resource-purpose')))).toBe(true);
  await page.goto('/');
  await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.style.fontSize = '200%'; });
  await checkGalleryPosters(page, hasTouch);
  await expectTextReflow(page, expect, 'original gallery posters in RTL at 200% text');
  await info.attach('Original gallery posters, enlarged RTL', { body: await page.locator('.community-carousel').screenshot(), contentType: 'image/png' });
});
test('cancelled pointer press and blur always reset the Get involved movement', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.nav-ready')).toBeVisible();
  const cta = page.locator('.community-actions > .pill-button');
  await cta.dispatchEvent('pointerdown', { button: 0, isPrimary: true });
  await expect(cta).toHaveAttribute('data-pressed', '');
  await cta.dispatchEvent('pointercancel');
  await expect(cta).not.toHaveAttribute('data-pressed', '');
  await cta.focus();
  await cta.dispatchEvent('pointerdown', { button: 0, isPrimary: true });
  await cta.evaluate(element => element.blur());
  await expect(cta).not.toHaveAttribute('data-pressed', '');
});
test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('contact, task shortcuts, Facts and gallery posters remain available', async ({ page, hasTouch }) => {
    await page.goto('/contact.html');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Contact us and get involved');
    await expect(page.getByRole('link', { name: 'Email the community', exact: true })).toBeVisible();
    await expect(page.locator('#copy-email')).not.toBeVisible();
    await page.goto('/citywest-supports.html');
    await page.getByRole('link', { name: 'Find English classes', exact: true }).click();
    await expect(page).toHaveURL(/#english-classes$/);
    await page.goto('/facts.html');
    await expect(page.locator('.facts-resource > h3.resource-purpose')).toHaveCount(16);
    await page.goto('/');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.carousel-controls')).toBeHidden();
    await checkGalleryPosters(page, hasTouch, false);
  });
});
