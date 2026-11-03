import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Expected footer markup, including the verified PPN membership added on 3 November 2026.
// Intentional future content changes must explicitly update this fixture.
const originals = {
  '404.html': 'd223b4ed0171eee4ad2b1634ea9af8d6a5d5d1c74e457d6a0f6ef3940fa95c0d',
  'about.html': '81fa3acc5f06eaa110138c810f38432550e439a0fb2ec31bd6457cce0ff12145',
  'accessibility.html': 'deea163f47afa1074ab22e2e69770246242d07e35fe1b7de5a80e2a89c83d336',
  'citywest-supports.html': '6238509bc75b867acdb71fd4cfa3fc7cd7c0054d3e70a6dbbb7bc0c21dc1776b',
  'contact.html': '2264f4bf7f1e774ee89eebb937658542baed32c508f210992871535f11c49bec',
  'facts.html': 'b69e59ce75087a63281e10c080bd06775796a5d6a71447ff92d075f526dcab93',
  'gallery.html': '48521215c8d43292e743b083bc94fba912cd7b5ffcad8a00487e429c931a814b',
  'index.html': 'cc21dcb74b7d6c46d1db585b904b3a831eaae2dde9127c73d56159acfa429774',
  'learn.html': '489250dbc69d25b391e08b757b496ca40a053ad0de4bf52f18d7c0dec39f4d0a',
  'privacy.html': '14ed1989ccef0eb305da60664db285de4bdbd42d0acbb2c67499b3b80829aa03',
  'quiz.html': '8adf2312ce71a507b2f91d4677483166b060f6266608f3e75c3291bd6546856b',
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
