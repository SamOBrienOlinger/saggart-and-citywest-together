import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Exact footer markup before the layout-only update, at release 7b862c4.
// Intentional future content changes must explicitly update this fixture.
const originals = {
  '404.html': 'ac724f753e737025b33aa9bbbfedaf21bd22ed9e47f032766fd93c7e59ab9c17',
  'about.html': '5a5d32fae3c8c5d74e45077ac8638417e81b66e0298326b67c181335c13d725b',
  'accessibility.html': 'eb9e993f6201ee596f8d0ef73c93c0325c505450e12fac121e2142308a20def3',
  'citywest-supports.html': '69f8c683ef9cc8248c4b6d2e13970a1d75c356caf9db3305d1a4afe4fae54dcf',
  'contact.html': '26b858c61275d2ac8b64761a0c687c3428c9105859148ac6e951f623cf91d15e',
  'facts.html': '5a10467e53d802532c28515cc1ad63b260296485ae958a297ef251db0d3658f4',
  'gallery.html': '124ad216e22667328832a0cb26794a937ab1214c32b5c85f2edc895f9078839a',
  'index.html': '6b20213cb66db8c3fdb25222343488afc3272261821c4bc3e8a92095694bd4d1',
  'learn.html': '24db678ac06f1fae20f5cf287b61ef98bdf544422f249723854ff81d66c130d4',
  'privacy.html': '374351876e232f665f8e4401fce94d7a906168f1ee87c5e75cc4afd5ba8aa2ff',
  'quiz.html': '33384e746474307a82d0dfa31228db62483c8dbe5aed4a11b3fa41d9c7d43611',
};

test('footer layout update preserves every link, label, image and no-script route verbatim', () => {
  for (const [path, expected] of Object.entries(originals)) {
    const html = readFileSync(new URL('../' + path, import.meta.url), 'utf8');
    const footer = html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0];
    assert.ok(footer, path);
    assert.equal(createHash('sha256').update(footer).digest('hex'), expected, path);
  }
});
