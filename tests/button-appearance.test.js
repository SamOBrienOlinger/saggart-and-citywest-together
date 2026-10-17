import test from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { inspectButtonAppearance } from '../e2e/button-appearance.mjs';

const creditSelector = '.site-footer > p.container > '
  + 'a[href="https://samobrienolinger.github.io/SamOBrienOlinger/"]';
const standard = {
  backgroundColor: 'rgb(0, 75, 80)', color: 'rgb(255, 255, 255)',
  fontFamily: 'Arial, sans-serif', fontSize: '16px', fontWeight: '700',
  lineHeight: '24.8px', borderRadius: '999px', borderWidth: '0px',
  minHeight: '48px', paddingTop: '12px', paddingRight: '24px',
  paddingBottom: '12px', paddingLeft: '24px', textAlign: 'center',
  textDecorationLine: 'none', transform: 'none', transitionDuration: '0s',
  animationName: 'none',
};

// Exercise the same self-contained inspector serialized by Playwright and Safari.
// Keep browser globals isolated so these tests cannot affect other unit tests.
function inspect({ scale = 1, credit = true, override = {} } = {}) {
  const reference = { ...standard,
    fontSize: `${16 * scale}px`, lineHeight: `${24.8 * scale}px`,
  };
  const styles = { ...reference, visibility: 'visible',
    ...(credit ? { fontSize: `${12 * scale}px`, lineHeight: `${18.6 * scale}px` } : {}),
    ...override,
  };
  const element = {
    textContent: credit ? 'Sam Tim Solutions ©2026' : 'Ordinary action',
    getAttribute: () => null,
    getClientRects: () => [{}],
    matches: selector => credit && selector === creditSelector,
  };
  const result = runInNewContext(`(${inspectButtonAppearance.toString()})(reference)`, {
    reference,
    getComputedStyle: () => styles,
    document: {
      querySelector: () => null,
      querySelectorAll: selector => selector.startsWith('#local-services') ? [] : [element],
    },
  });
  return JSON.parse(JSON.stringify(result));
}

for (const scale of [1, 1.5, 2]) {
  test(`portfolio credit retains 75% typography at ${scale * 100}% text`, () => {
    const result = inspect({ scale });
    assert.equal(result.checked, 1);
    assert.deepEqual(result.issues, []);
    assert.equal(result.standard.fontSize, `${16 * scale}px`);
  });
}
test('portfolio typography permits only subpixel rounding, including Safari line heights', () => {
  assert.deepEqual(inspect({ override: { lineHeight: '18.599998px' } }).issues, []);
  assert.equal(inspect({ override: { lineHeight: '18.59px' } }).issues.length, 1);
});
test('full-size or undersized portfolio labels remain failures', () => {
  for (const fontSize of ['16px', '11px', '24px', 'normal', 'NaNpx']) {
    const issues = inspect({ override: { fontSize } }).issues;
    assert.equal(issues.length, 1, fontSize);
    assert.equal(issues[0].differences.fontSize.expected, '12px');
  }
});
test('portfolio credit still requires the shared colours, touch target and pill appearance', () => {
  for (const [property, value] of Object.entries({
    backgroundColor: 'rgb(255, 255, 255)', color: 'rgb(0, 0, 0)',
    fontFamily: 'serif', fontWeight: '400', minHeight: '24px',
    paddingRight: '0px', borderRadius: '0px', transform: 'scale(0.75)',
  })) {
    const issues = inspect({ override: { [property]: value } }).issues;
    assert.equal(issues.length, 1, property);
    assert.ok(issues[0].differences[property], property);
  }
});
test('ordinary buttons still require the full-size reference without a typography exception', () => {
  assert.deepEqual(inspect({ credit: false }).issues, []);
  const issues = inspect({ credit: false, override: { fontSize: '12px', lineHeight: '18.6px' } }).issues;
  assert.equal(issues.length, 1);
  assert.deepEqual(Object.keys(issues[0].differences), ['fontSize', 'lineHeight']);
});
