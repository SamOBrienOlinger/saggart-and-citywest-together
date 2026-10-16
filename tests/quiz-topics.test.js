import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { questions } from '../assets/data/questions.js';
import { selectQuestions, validateQuestions } from '../assets/js/quiz-engine.js';

const find = id => questions.find(item => item.id === id);

test('quiz covers the area, services, Facts, IPAS, rights and migration contributions', () => {
  const minimums = {
    'Our area': 8,
    'Local services': 7,
    'Facts and checking claims': 8,
    'IPAS and international protection': 5,
    'Human rights and equality': 5,
    'Migration and community contributions': 7
  };
  assert.ok(questions.length >= 40);
  for (const [topic, count] of Object.entries(minimums)) {
    assert.ok(questions.filter(item => item.topic === topic).length >= count, topic);
  }
});

test('website status and website-use trivia cannot return to the approved bank', () => {
  for (const item of questions) {
    assert.notEqual(item.topic, 'Using this resource');
    assert.ok(!['learning-001', 'learning-002'].includes(item.id));
    assert.doesNotMatch(item.question, /status of this educational resource|using this resource|this website|this educational resource/i);
    assert.notEqual(item.sourceUrl, 'about.html');
  }
});

test('every revised question has four distinct choices and a dated original source', () => {
  assert.deepEqual(validateQuestions(questions), []);
  assert.equal(new Set(questions.map(item => item.question)).size, questions.length);
  for (const item of questions) {
    assert.equal(item.status, 'approved');
    assert.equal(item.options.length, 4);
    assert.equal(new Set(item.options).size, 4);
    for (const field of ['question', 'explanation', 'sourceTitle']) assert.ok(item[field].trim().length > 5, item.id);
    assert.ok(item.options.every(option => typeof option === 'string' && option.trim().length > 0));
    assert.equal(new URL(item.sourceUrl).protocol, 'https:');
    assert.match(item.sourceDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.doesNotMatch(item.explanation, /<script|javascript:/i);
  }
});

test('national migration figures retain their dates and are not relabelled as local figures', () => {
  for (const id of ['migration-002', 'migration-003']) {
    const item = find(id);
    assert.match(item.question, /national/);
    assert.match(item.question, /2024|2021–2023/);
    assert.match(item.explanation, /not (Citywest-specific|a separate Saggart)/);
  }
  assert.match(find('facts-001').question, /Census 2022/);
  assert.match(find('facts-004').explanation, /not a live accommodation register/);
  assert.match(find('migration-004').explanation, /Training location is not the same as nationality/);
});

test('protection, citizenship, local voting and human dignity remain distinct', () => {
  assert.match(find('ipas-002').explanation, /does not decide/);
  assert.match(find('migration-001').explanation, /Birthplace alone does not establish/);
  assert.match(find('migration-006').question, /18 or over, ordinarily resident and registered/);
  assert.match(find('rights-002').explanation, /does not mean every application must be approved/);
  assert.match(find('rights-005').explanation, /not a reward for economic productivity/);
});

test('the larger bank still supplies ten unique shuffled questions with correct answers', () => {
  const original = structuredClone(questions);
  const reached = new Set();
  for (let seed = 1; seed <= 300; seed++) {
    let state = seed;
    const random = () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296);
    const session = selectQuestions(questions, 10, random);
    assert.equal(session.length, 10);
    assert.equal(new Set(session.map(item => item.id)).size, 10);
    for (const item of session) {
      const source = find(item.id);
      assert.equal(item.options[item.correctIndex], source.options[source.correctIndex]);
      reached.add(item.id);
    }
  }
  assert.equal(reached.size, questions.length);
  assert.deepEqual(questions, original);
});

test('returning visitors receive the revised bank and the broader topic introduction', () => {
  const js = readFileSync(new URL('../assets/js/quiz.js', import.meta.url), 'utf8');
  const html = readFileSync(new URL('../quiz.html', import.meta.url), 'utf8');
  assert.match(js, /questions\.js\?v=topics-20261016/);
  assert.match(html, /quiz\.js\?v=confetti-20261016-topics/);
  assert.match(html, /local services, migration facts, IPAS, human rights and community contributions/);
  assert.match(js, /confetti\.play\(score,session\.length\)/);
});
