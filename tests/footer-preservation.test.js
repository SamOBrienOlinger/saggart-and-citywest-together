import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Expected footer markup, including the verified PPN membership added on 3 November 2026.
// Intentional future content changes must explicitly update this fixture.
const originals = {
  '404.html': '62517c390b46c1db178b3a01a5bb15ba626526ee52fad3603197b8d3cfe2e6ad',
  'about.html': 'e30a1931b13e0c350c91a08db6825f6f4be4e6a9115bbbc3ed2aa96c4a9561dd',
  'accessibility.html': 'aa8a5598381c01c7bb94b0493091928999104084aca0424c20ba6884110e3780',
  'citywest-supports.html': 'c95f04df3c9ad00c0724f5ea284043a13a2897e6dde5031fdb5acdebfa8d6ae3',
  'contact.html': '035a81eb952dd93013f1e2aa1d4fe4427e113f3ef5f6628fd68068d8453ca9c5',
  'facts.html': '0408a13237a81413787250d93933fe9f5555dbea005fcffd832762e28f933e66',
  'gallery.html': '594a154c4d9fa48cd1a2889eba8e8f1595a0156dfda328cfd559fd3e90732d3f',
  'index.html': 'f8d8c39068215d7ca858b68724426828c10f01e6492ebe6f701a50603933d14b',
  'learn.html': '5f4e8ac6413762bb1bdacf17c2bc91f900c11bbc43c874511b7b3c5060b2f37e',
  'privacy.html': '6f88befe2846a27113b07d05c57eb6c7e6842a41107b8eaa223ed038bfbdfd9a',
  'quiz.html': 'ec566f348bda2d9adc885f83fcd7b17ee13f7d10b09dfb869ebf3fc46fe0f01c',
};

test('footer retains the verified PPN membership, Quiz label, links, images and no-script routes', () => {
  for (const [path, expected] of Object.entries(originals)) {
    const html = readFileSync(new URL('../' + path, import.meta.url), 'utf8');
    const footer = html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0];
    assert.ok(footer, path);
    assert.ok(!footer.includes('Take the quiz'), path);
    if (footer.includes('href="quiz.html"')) assert.ok(footer.includes('<a href="quiz.html">Quiz</a>'), path);
    assert.equal(createHash('sha256').update(footer).digest('hex'), expected, path);
  }
});
