import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Expected footer markup, including the verified PPN membership added on 3 November 2026.
// Intentional future content changes must explicitly update this fixture.
const originals = {
  '404.html': '2a4227a055f77b23d042c31f6af7da4c81ab3a7febda1989d13a822bab661393',
  'about.html': '7976458c5cb921b5923e5e0752f726718c60a1182ba10a460fd23339bf3898e2',
  'accessibility.html': '10f11e083d06b5ead7a38c3c56c26fb4158342435bd9bfbb3cccb0e7fa3019c3',
  'citywest-supports.html': '9b13eaf556ccfe196e44acef3ef2d4d7aaae888abf37f52410cb8f16230bd440',
  'contact.html': 'aac669999d8fb4498580620cdf7c465ed1a70bf5658a75bc43f0ad611a60967f',
  'facts.html': '3f11fb1e335a4a0a0f91c583fc2780358af96ca0110068c569d761ef670abdce',
  'gallery.html': 'f345fc83c55de7cdb45d7f227e601a1070b7012e372a1486fcb657da44cdfc85',
  'index.html': 'c3818c1a488bc93ec211783aa6ee988012a84627d6724ee1124bd040d7898725',
  'learn.html': '907682c827c111a335742b48ce6d7537401a9f405e9ee2ad445527624d9b2568',
  'privacy.html': '67d98f5a08108246b1dfbf70b438a9d3077991f87c395ef581a101156e8003e9',
  'quiz.html': '371adc6cfadb58e211a324b62149a3354493700a398aac61f3320575451199f0',
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
