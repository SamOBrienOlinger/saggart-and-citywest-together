import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getConfettiProfile } from '../assets/js/quiz-confetti.js';

for (let score = 0; score <= 10; score++) {
  test(`confetti profile matches ${score}/10 without altering the score`, () => {
    const profile = getConfettiProfile(score);
    if (score < 4) {
      assert.equal(profile.name, 'gentle');
      assert.equal(profile.count, 6);
      assert.equal(profile.minDuration, 12000);
      assert.equal(profile.maxDuration, 16000);
    } else if (score < 7) {
      assert.equal(profile, null);
    } else {
      assert.equal(profile.name, 'celebration');
      assert.equal(profile.count, 84);
      assert.ok(profile.maxDuration + profile.maxDelay < 5000);
    }
  });
}
test('gentle confetti is much sparser and slower than the celebration', () => {
  const slow = getConfettiProfile(3), full = getConfettiProfile(7);
  assert.ok(slow.count < full.count / 10);
  assert.ok(slow.minDuration >= full.maxDuration * 3);
  assert.ok(slow.maxSpin < full.minSpin);
});
test('invalid or incomplete scores do not start an effect', () => {
  for (const score of [-1, 11, 7.1, NaN, Infinity, '7', null, undefined]) assert.equal(getConfettiProfile(score), null);
  for (const total of [0, -10, 10.5, NaN, Infinity, '10', null]) assert.equal(getConfettiProfile(7, total), null);
});
test('profiles are immutable and thresholds also scale to another valid total', () => {
  assert.ok(Object.isFrozen(getConfettiProfile(7)));
  assert.equal(getConfettiProfile(14, 20).name, 'celebration');
  assert.equal(getConfettiProfile(7, 20).name, 'gentle');
  assert.equal(getConfettiProfile(8, 20), null);
});
test('the optional stop control is initially hidden and the new assets are versioned', () => {
  const html = readFileSync(new URL('../quiz.html', import.meta.url), 'utf8');
  assert.match(html, /id="stop-confetti"[^>]*hidden>Stop confetti<\/button>/);
  assert.match(html, /quiz-confetti\.css\?v=20261016/);
  assert.match(html, /quiz\.js\?v=confetti-20261016/);
});
