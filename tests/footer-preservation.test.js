import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Expected footer markup, including the requested Quiz label change on 16 October 2026.
// Intentional future content changes must explicitly update this fixture.
const originals = {
  '404.html': 'ac724f753e737025b33aa9bbbfedaf21bd22ed9e47f032766fd93c7e59ab9c17',
  'about.html': '23ddb79e696a48debf1e9e11dec8e3dcfef2dadbc35ab469d8b7b1c7ca436a20',
  'accessibility.html': '47fbcb77eb347cf74317d6cac9ac83a13cbc6f917e721e424272429211aa0426',
  'citywest-supports.html': 'c4dcd69f13fcfc68cf559fd2031456858587af143f91f12e154857c9d6dd0e8a',
  'contact.html': '0a964bde8f6f0218de54180de52206150602c3fed5264b55f4cc37c5efe2e217',
  'facts.html': 'cb38b38ca5aa4280a9393ff770c3b503ed569a09ee930e684041b9a2e88ff00e',
  'gallery.html': 'f32932869e1f69d4c0eeba4251f6a98638bac026e18ab9c07b1a7849488d0a3a',
  'index.html': 'f25bbedd7d2d90192aa2f27bebf8e6ef3aab232b62611ec13dca5016001f8e3f',
  'learn.html': '3d28c44831cbe210b567e4a3be4af9ea0b672e6e8f376bc7de8722104ba7e2a2',
  'privacy.html': 'cd623b5ebf4999552e99c838f3bba3b34d7c754e15104452e54fd54eb9239604',
  'quiz.html': '72a7f61b27bda6f175a5d38b1416336e0cf08fb4079bd5cc18c80845ee12779c',
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
