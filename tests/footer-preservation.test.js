import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Expected footer markup, including the verified PPN membership added on 3 November 2026.
// Intentional future content changes must explicitly update this fixture.
const originals = {
  '404.html': '39397859aa7739f36e609eedec9c155279ca6cffde9336a02c9e7c352c6911d0',
  'about.html': 'dc4dc5c8262e34404231e57e3dc951181050a25f9ec93e589b8467ac470de36a',
  'accessibility.html': '05db2d7ae6c2e281b22228e51bc2f307784e025923d6f45e27941b01363d30cb',
  'citywest-supports.html': 'd224ccef0b8120013592fc1642b05aa7b609182b32bbc8e8da48fbae273a12b7',
  'contact.html': 'b94e69953ae4aa42176b48773f4026d3ea9a74994e14cfc9142065bbf1a35642',
  'facts.html': '462f5166cf7c7ba8327ff9ef870b1e5bd843e8c159472a5706b3029c47b313b9',
  'gallery.html': '9f8dc319b273506f07399916af97c4adbfffa437b106430ef7c90cdec0fe8193',
  'index.html': 'c9febe380f8420b640fd099aac298b5b3e110e1a319bc0799327c6485221f974',
  'learn.html': 'ed5972ad85a4fad93984960d3df84e94893b413fc47dea3f80797442e2172d9c',
  'privacy.html': 'ab619a5605d25096fe75a4e1fd582ee2f9ad494898a3d6ce2c1235160ab11bc2',
  'quiz.html': '0a087c18593875f293e8109ae05bc2ae651dd5ba54cfdb9ef91b5ced55eb354a',
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
