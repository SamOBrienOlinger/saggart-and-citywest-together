import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { inspectButtonAppearance } from '../e2e/button-appearance.mjs';

// Exercise the browser helper in isolation: an intentional typography exception
// must not hide incorrect text scaling or regressions in other button styles.
function inspect({ scale = 1, credit = true, changes = {} } = {}) {
  const reference = {
    fontSize: `${16 * scale}px`, lineHeight: `${24.8 * scale}px`,
    minHeight: '48px', backgroundColor: 'rgb(255, 240, 213)',
  };
  const element = {
    textContent: credit ? 'Sam Tim Solutions ©2026' : 'Ordinary button',
    getClientRects: () => [{}], getAttribute: () => null,
    matches: selector => credit && selector.startsWith('.site-footer > p.container'),
    styles: {
      ...reference, visibility: 'visible',
      ...(credit ? { fontSize: `${12 * scale}px`, lineHeight: `${18.6 * scale}px` } : {}),
      ...changes,
    },
  };
  const context = {
    getComputedStyle: el => el.styles,
    document: {
      querySelector: () => null,
      querySelectorAll: selector => selector.startsWith('#local-services') ? [] : [element],
    },
  };
  const result = vm.runInNewContext(`(${inspectButtonAppearance.toString()})`, context)(reference);
  return JSON.parse(JSON.stringify(result));
}

test('approved credit typography passes at normal and 200% text', () => {
  for (const scale of [1, 2]) {
    const result = inspect({ scale });
    assert.equal(result.checked, 1);
    assert.deepEqual(result.issues, []);
  }
});

test('credit typography cannot silently revert to the standard button size', () => {
  assert.ok(inspect({ changes: { fontSize: '16px' } }).issues[0].differences.fontSize);
  assert.ok(inspect({ changes: { lineHeight: '24.8px' } }).issues[0].differences.lineHeight);
});

test('the credit retains all shared touch-target and colour checks', () => {
  for (const changes of [{ minHeight: '32px' }, { backgroundColor: 'transparent' }]) {
    assert.equal(inspect({ changes }).issues.length, 1);
  }
});

test('the smaller credit exception does not extend to ordinary buttons', () => {
  assert.deepEqual(inspect({ credit: false }).issues, []);
  assert.ok(inspect({ credit: false, changes: { fontSize: '12px' } }).issues[0].differences.fontSize);
});

test('fractional WebKit rounding is accepted, but invalid typography is not', () => {
  assert.deepEqual(inspect({ changes: { lineHeight: '18.599998px' } }).issues, []);
  assert.ok(inspect({ changes: { lineHeight: 'normal' } }).issues[0].differences.lineHeight);
  assert.ok(inspect({ changes: { lineHeight: '18.5px' } }).issues[0].differences.lineHeight);
});
