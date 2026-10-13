import { test, expect } from '@playwright/test';
import { expectTextReflow } from './text-reflow.mjs';

// Compare rendered components so changes to either page cannot silently diverge.
async function footerSnapshot(page) {
  return page.locator('footer').evaluate(footer => {
    const properties = ['display', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight',
      'color', 'backgroundColor', 'paddingTop', 'paddingBottom', 'marginTop',
      'marginBottom', 'gap', 'gridTemplateColumns', 'flexDirection', 'alignItems'];
    const selectors = ['.footer-grid', '.footer-brand', '.footer-logo', 'h2', 'ul',
      'li a', '.footer-connect', '.footer-qr', '.footer-connect p', '.footer-note'];
    const appearance = element => {
      const styles = getComputedStyle(element);
      return {
        styles: Object.fromEntries(properties.map(property => [property, styles[property]])),
        width: Math.round(element.getBoundingClientRect().width * 100) / 100,
        height: Math.round(element.getBoundingClientRect().height * 100) / 100,
      };
    };
    return {
      appearance: appearance(footer),
      components: Object.fromEntries(selectors.map(selector => [selector, appearance(footer.querySelector(selector))])),
      links: [...footer.querySelectorAll('a')].map(link => ({
        text: link.textContent.trim(), href: link.getAttribute('href'),
        target: link.getAttribute('target'), rel: link.getAttribute('rel'),
      })),
      images: [...footer.querySelectorAll('img')].map(image => ({ src: image.getAttribute('src'), alt: image.alt })),
    };
  });
}

test('homepage footer matches the other pages at normal and enlarged text', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const scale of [1, 2]) {
    let reference;
    for (const path of ['contact.html', 'index.html']) {
      await page.goto('/' + path);
      await page.evaluate(scale => { document.documentElement.style.fontSize = `${scale * 100}%`; }, scale);
      await expect(page.locator('footer')).toBeVisible();
      await expect.poll(() => page.locator('footer img').evaluateAll(images =>
        images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
      await expectTextReflow(page, expect, `${path} footer at ${scale * 100}% text`);
      const snapshot = await footerSnapshot(page);
      if (path === 'contact.html') reference = snapshot;
      else {
        expect(snapshot).toEqual(reference);
        await testInfo.attach(`Homepage footer at ${scale * 100}% text`, {
          body: await page.locator('footer').screenshot(), contentType: 'image/png',
        });
      }
    }
  }
});
