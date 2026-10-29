import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Expected footer markup, including Polish and Romanian fallback links added on 29 October 2026.
// Intentional future content changes must explicitly update this fixture.
const originals = {
  '404.html': 'e496dddb194b6c114ab85c1549883955b7299744b15d736f397b5a100e3d1b55',
  'about.html': 'b96972041746079c5cdcc285ca7026725497ca78b337588958f9606176c1aa40',
  'accessibility.html': '4a740db91f34d1acea1217c1a781b513c5c94663b696222c0c8badf8f6ac0501',
  'citywest-supports.html': 'be46981406c5d8a0e6355981f077e329e46303e6ae61b443f5e03677589b3a6f',
  'contact.html': '5f6d2bc58735b6a18d2b2a805e0a27bd607fab61dd430b90b15ce07da40f7ac3',
  'facts.html': 'f237bf842e57cec9155cafeb207e307c69e3f26665879d9eead1a6508b8998ee',
  'gallery.html': '70bfc9b2c70f62865462351ec23229d61cb444394e6318de2b84fe4fbac3dc49',
  'index.html': 'a14c6a537fa1c79ba7739d16688e2ac8e2103f96e439f40d0cf9633bf641360e',
  'learn.html': 'a07f57ca4515dc3d1a1dac296a44bed0518004d2f5a7aae7b2eee300a631161e',
  'privacy.html': '75d16f38649804580d2df93fc3050f19db3a0222ac3fee70445a1a64da2d9305',
  'quiz.html': '04fb449b693d8152bc352c3d36e4ba32e7f3a20f57b8679f5af6f26e4c14a1df',
};

test('footer retains the requested Quiz label and every other link, image and no-script route verbatim', () => {
  for (const [path, expected] of Object.entries(originals)) {
    const html = readFileSync(new URL('../' + path, import.meta.url), 'utf8');
    const footer = html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0];
    assert.ok(footer, path);
    assert.ok(!footer.includes('Take the quiz'), path);
    if (footer.includes('href="quiz.html"')) assert.ok(footer.includes('<a href="quiz.html">Quiz</a>'), path);
    assert.equal(createHash('sha256').update(footer).digest('hex'), expected, path);
  }
});
