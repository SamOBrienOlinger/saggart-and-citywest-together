import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const originals = JSON.parse(readFileSync(new URL('../tests/fixtures/community-gallery.json', import.meta.url), 'utf8')).images;

test('gallery preserves the approved 28-image order and framing', async ({ page }) => {
  await page.goto('/');
  const slides = page.locator('.community-slide');
  const thumbnails = page.locator('.carousel-thumb img');
  await expect(slides).toHaveCount(originals.length);
  await expect(thumbnails).toHaveCount(originals.length);
  await expect(page.locator('.event-archive')).toHaveCount(0);
  expect(await slides.locator('img').evaluateAll(images => images.map(image => image.getAttribute('src'))))
    .toEqual(originals.map(image => image.src));
  expect(await thumbnails.evaluateAll(images => images.map(image => image.getAttribute('src'))))
    .toEqual(originals.map(image => image.src));
  // Match the original homepage.css rules, including its last-three exception.
  // File hashes alone cannot detect an unintended change to visible framing.
  const originalFraming = originals.map((_, index) => index < originals.length - 3 ? 'cover' : 'contain');
  await expect.poll(() => thumbnails.evaluateAll(images => images.map(image => getComputedStyle(image).objectFit)))
    .toEqual(originalFraming);
  expect(await slides.locator('img').evaluateAll(images => images.map(image => getComputedStyle(image).objectFit)))
    .toEqual(originals.map(() => 'contain'));
  expect(originals.slice(13, 16).map(image => image.src.split('/').pop()))
    .toEqual(['potluck-poster.jpg', 'human-library-poster.jpg', 'village-clean-up-poster.jpg']);
});
