import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { translationLanguages } from '../assets/js/translation.js';

test('translation control offers only the requested languages', () => {
  assert.deepEqual(translationLanguages.map(language => language.code), ['ar', 'fr', 'nl', 'de', 'it', 'es']);
  assert.equal(translationLanguages.find(language => language.code === 'ar').direction, 'rtl');
  assert.ok(translationLanguages.filter(language => language.direction === 'ltr').length === 5);
});

test('translation control is accessible, on demand and reversible', async () => {
  const source = await readFile(new URL('../assets/js/translation.js', import.meta.url), 'utf8');
  assert.match(source, /aria-expanded/);
  assert.match(source, /aria-controls/);
  assert.match(source, /Escape/);
  assert.match(source, /Show original English/);
  assert.match(source, /translate\.google\.com\/translate_a\/element\.js/);
  assert.match(source, /toggle\.addEventListener\('click',/);
});

test('privacy notice explains the optional translation service', async () => {
  const privacy = await readFile(new URL('../privacy.html', import.meta.url), 'utf8');
  assert.match(privacy, /Google Translate/);
  assert.match(privacy, /language choice/);
  assert.match(privacy, /only when/);
});

test('translation buttons retain visible focus and mobile layout safeguards', async () => {
  const styles = await readFile(new URL('../assets/css/styles.css', import.meta.url), 'utf8');
  assert.match(styles, /\.translate-toggle:focus-visible/);
  assert.match(styles, /\.translation-original:focus-visible/);
  assert.match(styles, /@media\(max-width:760px\)\{\.translate-menu/);
});
