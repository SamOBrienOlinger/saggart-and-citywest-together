import { test, expect } from '@playwright/test';
import { expectTextReflow } from './text-reflow.mjs';
const email = 'saggartcitywesttogether@gmail.com';
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
test('task links, Facts order and poster archive are usable with enlarged text and RTL', async ({ page }, info) => {
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
  await expect(page.locator('.event-poster-grid')).not.toBeVisible();
  await page.locator('.event-posters > summary').click();
  await expect(page.locator('.event-poster-grid img')).toHaveCount(3);
  for (const image of await page.locator('.event-poster-grid img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(im => im.complete && im.naturalWidth > 0)).toBe(true);
  }
  await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.style.fontSize = '200%'; });
  await expectTextReflow(page, expect, 'expanded event archive in RTL at 200% text');
  await info.attach('Archived posters, enlarged RTL', { body: await page.locator('.event-archive').screenshot(), contentType: 'image/png' });
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
  test('contact, task shortcuts, Facts and poster disclosure remain available', async ({ page }) => {
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
    await page.locator('.event-posters > summary').click();
    await expect(page.locator('.event-poster-grid')).toBeVisible();
  });
});
