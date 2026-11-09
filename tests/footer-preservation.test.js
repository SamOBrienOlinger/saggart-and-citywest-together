import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Expected footer markup, including the verified PPN membership added on 3 November 2026.
// Intentional future content changes must explicitly update this fixture.
const originals = {
  '404.html': '7a565aa09255c340293288dbef7c0ff0195bfd63544c0a93ce246f4d98e125eb',
  'about.html': '3419b85385d9ffa27f6f98a489c43caa7fbfc9d7b32361bfa1369cc97ef90b85',
  'accessibility.html': '2ac4e700d001adcdd0c334fe0e80b6c90ca83c23f49a46e531d59bf5c96e72df',
  'citywest-supports.html': 'a2f41a8675cdc580629ca04d1db2fc946d61599c5609b3e047c63ca6d3e7c379',
  'contact.html': '9b1aad4918c5dfc169c10880e1c01cb9008822cea7ce854fa075d23b221c797d',
  'facts.html': '308262862f40210cce8359ccdacb39a452cfad153a98abf99416d92a1451396a',
  'gallery.html': '34f5d786bb2aaa7bce914aede25b9381f15b01bbb10c3bd534a57ef8c80a11ef',
  'index.html': 'f604b793c49cb3059aabf00b506e53c629831f29fcd04491ed73493edb400704',
  'learn.html': '2c494b9cd55a5f2627e70f60ead9e639918c11edf0ccdba76d893b9a47c85583',
  'privacy.html': '5a907ba2911b681657e3abb3603bc240cdd15529fd96499c8923b3a3395a2a66',
  'quiz.html': 'bec6791f30a99e8f300c6eb8b9bd132de53f7b96d083848e4dd07bb3b7cf6252',
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
