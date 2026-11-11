import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { questions } from '../assets/data/questions.js';
import { selectQuestions, validateQuestions, nextHighScore, formatBestScore } from '../assets/js/quiz-engine.js';

const html = readFileSync(new URL('../quiz.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('../assets/js/quiz.js', import.meta.url), 'utf8');
function initialise({ invalid = false, storageDenied = false, optionalStorage = false, savedScore = null } = {}) {
  const elements = new Map();
  const windowListeners = new Map();
  let enabledBeforeListener = false;
  let storageReads = 0;
  // Unit-test dependency seam: the privacy module itself owns consent/storage errors.
  const privacy = {
    allowed: purpose => purpose === 'preferences' && optionalStorage,
    get() {
      if (!optionalStorage) return null;
      storageReads += 1;
      return storageDenied ? null : savedScore;
    },
    set: () => optionalStorage && !storageDenied,
  };
  const document = { getElementById(id) {
    if (!elements.has(id)) {
      const listeners = new Map();
      let disabled = id === 'start-quiz';
      elements.set(id, { id, hidden: true, textContent: '', listeners,
        get disabled() { return disabled; },
        set disabled(value) {
          if (id === 'start-quiz' && !value && !listeners.has('click')) enabledBeforeListener = true;
          disabled = value;
        },
        addEventListener(type, handler) { listeners.set(type, handler); },
      });
    }
    return elements.get(id);
  } };
  vm.runInNewContext(script.replace(/import\{[^}]+\}from'[^']+';/g, ''), {
    document, questions: invalid ? [{ ...questions[0], correctIndex: -1 }] : questions,
    selectQuestions, validateQuestions, nextHighScore, formatBestScore, privacy,
    window: { addEventListener(type, handler) { windowListeners.set(type, handler); } },
    createQuizConfetti: () => ({ stop() {}, play() {} }),
    localStorage: { getItem() { throw new Error('Quiz must use the consent-aware privacy module'); } },
  });
  return { elements, enabledBeforeListener, windowListeners, get storageReads() { return storageReads; },
    withdraw() { optionalStorage = false; windowListeners.get('siteprivacychange')?.(); },
  };
}

test('quiz entry markup is disabled until its versioned startup script is ready', () => {
  assert.match(html, /<button\b[^>]*id="start-quiz"[^>]*\bdisabled(?:[\s=>])/);
  assert.match(html, /quiz\.js\?v=confetti-20261016-topics-ready-20261109/);
});
test('valid question data enables the quiz only after the click listener is installed', () => {
  const result = initialise();
  assert.equal(result.elements.get('start-quiz').disabled, false);
  assert.equal(result.enabledBeforeListener, false);
  for (const id of ['start-quiz', 'next-question', 'try-again']) {
    assert.equal(typeof result.elements.get(id).listeners.get('click'), 'function');
  }
});
test('invalid question data leaves Start disabled and presents the existing error', () => {
  const result = initialise({ invalid: true });
  assert.equal(result.elements.get('start-quiz').disabled, true);
  assert.equal(result.elements.get('quiz-error').hidden, false);
  assert.match(result.elements.get('quiz-error').textContent, /Question data error/);
});
test('storage denial does not prevent safe quiz startup', () => {
  const result = initialise({ storageDenied: true, optionalStorage: true });
  assert.equal(result.elements.get('start-quiz').disabled, false);
  assert.equal(result.enabledBeforeListener, false);
});
test('rejecting optional storage keeps the quiz playable without reading a saved score', () => {
  const result = initialise({ savedScore: '8' });
  assert.equal(result.elements.get('start-quiz').disabled, false);
  assert.equal(result.storageReads, 0);
  assert.match(result.elements.get('best-score-intro').textContent, /this visit: 0\/10 \(not saved\)/);
});
test('allowed score storage retains the existing best-score label and value', () => {
  const result = initialise({ optionalStorage: true, savedScore: '8' });
  assert.equal(result.elements.get('best-score-intro').textContent, formatBestScore(8));
  assert.ok(result.storageReads > 0);
});
test('withdrawal refreshes the displayed scope and clearing has a registered handler', () => {
  const result = initialise({ optionalStorage: true, savedScore: '8' });
  result.withdraw();
  assert.match(result.elements.get('best-score-intro').textContent, /this visit: 0\/10 \(not saved\)/);
  assert.equal(typeof result.windowListeners.get('siteprivacyclear'), 'function');
});
