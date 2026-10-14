import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const pages = (await readdir(root)).filter(name => name.endsWith('.html'));
const logoPath = 'assets/images/pride-logo.jpg';

for (const page of pages) {
  test(`${page} uses the Pride logo and shared circular styling without JavaScript`, async () => {
    const html = await readFile(new URL(page, root), 'utf8');
    const logos = [...html.matchAll(/<img\b[^>]*class="(brand-logo|footer-logo)"[^>]*>/g)];
    assert.equal(logos.length, page === '404.html' ? 1 : 2, 'Preserve every existing logo placement');
    for (const [tag, className] of logos) {
      assert.ok(tag.includes(`src="${logoPath}"`), `${className} must use the canonical image`);
      const size = className === 'brand-logo' ? '54' : '112';
      assert.ok(tag.includes(`width="${size}" height="${size}"`), 'Reserve a square image area');
    }
    assert.doesNotMatch(html, /sact-logo-v3\.png/);
    const stylesheets = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)];
    assert.equal(stylesheets.at(-1)?.[1], 'assets/css/branding.css?v=pride-20261014');
  });
}

test('the supplied logo is a complete square JPEG', async () => {
  const { createHash } = await import('node:crypto');
  const image = await readFile(new URL(logoPath, root));
  // Preserve the supplied image byte-for-byte; rounding belongs in CSS.
  assert.equal(createHash('sha256').update(image).digest('hex'),
    '04474fc1fb9609e20a009f36ee6c88916f59fbd4002f3811961bf72495a8cedf');
});
