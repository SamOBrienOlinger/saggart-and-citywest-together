import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('browser tests use the current privacy-choice version and a rejected default', async () => {
  const [privacy, config, helpers] = await Promise.all([
    readFile(new URL('../assets/js/privacy.js', import.meta.url), 'utf8'),
    readFile(new URL('../playwright.config.js', import.meta.url), 'utf8'),
    readFile(new URL('../e2e/privacy-test-helpers.mjs', import.meta.url), 'utf8'),
  ]);
  const version = privacy.match(/const VERSION = '([^']+)'/)?.[1];
  assert.ok(version, 'privacy version is declared');
  assert.match(config, new RegExp(`version: '${version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`));
  assert.match(helpers, new RegExp(`consentVersion = '${version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`));
  assert.match(config, /translation: false/);
  assert.match(config, /preferences: false/);
});
