import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { protectedServiceTerms, protectedTextParts } from '../assets/js/protected-terms.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('service acronyms and organisation names are kept as protected text parts', () => {
  const sentence = 'Ask DDLETB, REALT, IPAS, LAIT, MRCI, ESOL, SDCP, IPO, FET, EWO, JRS or Nasc.';
  const protectedParts = protectedTextParts(sentence).filter(part => part.protected).map(part => part.text);
  assert.deepEqual(protectedParts, protectedServiceTerms);
  assert.deepEqual(protectedTextParts('A hypothetical IPO-ready word'), [{ text: 'A hypothetical IPO-ready word', protected: false }]);
});

test('visible static service terms use Google Translate protection', () => {
  for (const file of ['citywest-supports.html', 'facts.html', 'index.html', 'learn.html', 'quiz.html']) {
    const main = read(file).match(/<main\b[\s\S]*?<\/main>/)?.[0] ?? '';
    for (const term of protectedServiceTerms) {
      const occurrences = [...main.matchAll(new RegExp(`\\b${term}\\b`, 'gu'))];
      for (const occurrence of occurrences) {
        const before = main.slice(Math.max(0, occurrence.index - 90), occurrence.index);
        assert.match(before, /<span class="notranslate service-term" translate="no">$/, `${term} is unprotected in ${file}`);
      }
    }
  }
});

test('quiz-generated service terms use the protected renderer', () => {
  const quiz = read('assets/js/quiz.js');
  assert.match(quiz, /setProtectedText\(els\.text,item\.question\)/);
  assert.match(quiz, /setProtectedText\(button,option\)/);
  assert.match(quiz, /setProtectedText\(explanation,item\.explanation\)/);
});

test('gallery no longer uses Pinterest as a source and records attribution limits', () => {
  const galleryData = read('assets/data/history-photos.js');
  assert.doesNotMatch(galleryData, /pinterest/i);
  assert.match(galleryData, /South Dublin Libraries/);
  assert.match(galleryData, /Thomas H\. Mason/);
  assert.match(galleryData, /reuse terms are not stated/i);
});
