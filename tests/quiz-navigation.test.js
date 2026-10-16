import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

const pages = readdirSync('.').filter(name => name.endsWith('.html'));
test('every page has one native Quiz navigation link with the existing menu intact', () => {
  assert.equal(pages.length, 11);
  for (const name of pages) {
    const html = readFileSync(name, 'utf8');
    const nav = html.match(/<ul\b[^>]*\bid="site-menu"[^>]*>[\s\S]*?<\/ul>/)?.[0];
    assert.ok(nav, name);
    const expected = ['learn', 'quiz', 'services', 'contact', 'facts', 'about'];
    assert.deepEqual([...nav.matchAll(/data-nav="([^"]+)"/g)].map(match => match[1]), expected, name);
    const links = [...nav.matchAll(/<a\b[^>]*data-nav="quiz"[^>]*>Quiz<\/a>/g)];
    assert.equal(links.length, 1, name);
    assert.match(links[0][0], /href="quiz\.html"/);
    assert.doesNotMatch(links[0][0], /target=|onclick=/);
    assert.equal(links[0][0].includes('aria-current="page"'), name === 'quiz.html', name);
    assert.equal(new URL('quiz.html', 'https://samobrienolinger.github.io/saggart-and-citywest-together/' + name).href,
      'https://samobrienolinger.github.io/saggart-and-citywest-together/quiz.html');
  }
});
