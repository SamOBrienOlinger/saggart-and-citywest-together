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
      const normalRootFont = await page.locator('html').evaluate(root => parseFloat(getComputedStyle(root).fontSize));
      await page.evaluate(scale => { document.documentElement.style.fontSize = `${scale * 100}%`; }, scale);
      await expect(page.locator('footer')).toBeVisible();
      // Matching a child to its parent is not enough: both can still contain
      // the old computed font during a WebKit reflow. Require the requested
      // size on the root and every 1rem/inherited footer component first.
      const inheritedComponents = 'html, footer, footer .footer-grid, footer .footer-brand, footer .footer-logo, footer h2, footer ul, footer li a, footer .footer-connect, footer .footer-qr, footer .footer-connect p';
      await expect.poll(() => page.locator(inheritedComponents).evaluateAll((elements, target) =>
        elements.every(element => Math.abs(parseFloat(getComputedStyle(element).fontSize) - target) < .01),
        normalRootFont * scale), { message: 'all footer components have the requested text scale' }).toBe(true);
      await expect.poll(() => page.locator('footer img').evaluateAll(images =>
        images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
      let previous;
      let stableSamples = 0;
      await expect.poll(async () => {
        const sample = JSON.stringify(await footerSnapshot(page));
        stableSamples = sample === previous ? stableSamples + 1 : 0;
        previous = sample;
        return stableSamples;
      }, { intervals: [50, 100], message: 'footer font and geometry have settled' }).toBeGreaterThanOrEqual(3);
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
