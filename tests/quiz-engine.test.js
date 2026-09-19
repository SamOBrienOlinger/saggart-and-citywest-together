import test from'node:test';import assert from'node:assert/strict';import{questions}from'../assets/data/questions.js';import{shuffle,shuffleQuestionOptions,selectQuestions,validateQuestions,nextHighScore,formatBestScore}from'../assets/js/quiz-engine.js';
test('question bank has at least 20 approved questions',()=>assert.ok(questions.filter(q=>q.status==='approved').length>=20));
test('question records pass schema validation',()=>assert.deepEqual(validateQuestions(questions),[]));
test('selectQuestions returns ten unique questions without mutating source',()=>{const original=questions.map(q=>q.id);const selected=selectQuestions(questions,10,()=>.42);assert.equal(selected.length,10);assert.equal(new Set(selected.map(q=>q.id)).size,10);assert.deepEqual(questions.map(q=>q.id),original)});
test('selection rejects an insufficient approved pool',()=>assert.throws(()=>selectQuestions([{status:'draft'}],1),/At least 1 approved/));
test('shuffle returns a copy',()=>{const input=[1,2,3];const output=shuffle(input,()=>.5);assert.notEqual(input,output);assert.deepEqual([...output].sort(),input)});
test('best score only increases',()=>{assert.equal(nextHighScore(7,5),7);assert.equal(nextHighScore(7,9),9);assert.equal(nextHighScore(Number.NaN,4),4)});
test('best score label includes the stored value',()=>assert.equal(formatBestScore(7),'Your best score: 7/10'));

// Exhaust every permutation of four choices, for every possible correct source index.
test('every answer position is equally reachable and still scores the original correct answer', () => {
  for (let correctIndex = 0; correctIndex < 4; correctIndex++) {
    const original = Object.freeze({id: 'sample', options: Object.freeze(['A', 'B', 'C', 'D']), correctIndex, explanation: 'Keep this explanation.'});
    const positions = [0, 0, 0, 0];
    const orders = new Set();
    for (let a = 0; a < 4; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 2; c++) {
      const draws = [(a + .5) / 4, (b + .5) / 3, (c + .5) / 2];
      const result = shuffleQuestionOptions(original, () => draws.shift());
      assert.equal(result.options[result.correctIndex], original.options[correctIndex]);
      assert.equal(result.explanation, original.explanation);
      assert.notEqual(result.options, original.options);
      positions[result.correctIndex]++;
      orders.add(result.options.join(''));
    }
    assert.deepEqual(positions, [6, 6, 6, 6]);
    assert.equal(orders.size, 24);
    assert.deepEqual(original.options, ['A', 'B', 'C', 'D']);
  }
});

test('quiz sessions shuffle answer choices without changing source data or correct answers', () => {
  const original = structuredClone(questions);
  const session = selectQuestions(questions, 10, () => 0);
  for (const item of session) {
    const source = questions.find(q => q.id === item.id);
    assert.equal(item.options[item.correctIndex], source.options[source.correctIndex]);
    assert.notDeepEqual(item.options, source.options);
    assert.deepEqual([...item.options].sort(), [...source.options].sort());
  }
  assert.deepEqual(questions, original);
});
