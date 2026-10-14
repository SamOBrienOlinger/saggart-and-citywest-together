import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');
const [home, contact, supports, facts, enhancement] = await Promise.all(
  ['index.html', 'contact.html', 'citywest-supports.html', 'facts.html', 'assets/js/community-ux.js'].map(read));

test('short headings retain the full Citywest context and useful contact options', () => {
  assert.match(supports, /<h1>Citywest IPAS supports<\/h1>/);
  assert.match(supports, /Local services for people living at the Citywest International Protection Accommodation Service \(IPAS\) centre/);
  assert.match(contact, /<h1>Contact us and get involved<\/h1>/);
  assert.match(contact, /id="community-email"/);
  assert.match(contact, /data-copy-email[^>]*hidden/);
  assert.match(contact, /role="status" aria-live="polite" aria-atomic="true"/);
});
test('local support and official IPAS are clearly separate routes and services precede the quiz', () => {
  assert.ok(home.indexOf('id="local-services"') < home.indexOf('class="quiz-strip"'));
  assert.match(home, /href="citywest-supports.html"/);
  assert.match(home, /class="official-service-link"[^>]*href="https:\/\/ipas.irishimmigration.ie\/"/);
});
test('the photo-only carousel and separate archive retain all 21 original media items', () => {
  const carousel = home.split('class="carousel-viewport"')[1].split('class="carousel-controls"')[0];
  assert.equal((carousel.match(/class="community-slide"/g) || []).length, 18);
  assert.doesNotMatch(carousel, /-poster\./);
  assert.match(home, /aria-label="18 of 18"/);
  assert.equal((home.match(/class="event-poster"/g) || []).length, 3);
  assert.match(home, /not as invitations to upcoming events/);
  for (const name of ['potluck-poster.jpg', 'human-library-poster.jpg', 'village-clean-up-poster.jpg']) {
    assert.ok(home.includes(name));
  }
});
test('all 16 Facts resources lead with a task, followed by explanation and original source', () => {
  const articles = [...facts.matchAll(/<article class="facts-resource"[\s\S]*?<\/article>/g)].map(m => m[0]);
  assert.equal(articles.length, 16);
  for (const article of articles) {
    assert.match(article, /<h3 class="resource-purpose">/);
    assert.ok(article.indexOf('resource-purpose') < article.indexOf('resource-source'));
    assert.ok(article.indexOf('resource-source') < article.indexOf('resource-meta'));
    assert.match(article, /class="resource-context"/);
  }
});
test('all ten support areas remain static and optional filtering starts hidden', () => {
  assert.equal((supports.match(/data-support-category=/g) || []).length, 10);
  assert.match(supports, /data-support-filter[^>]*hidden/);
  for (const id of ['english-classes','work-and-training','rights-and-advice','volunteering']) {
    assert.ok(supports.includes(`id="${id}"`));
  }
  assert.match(supports, /LAIT means Local Authority Integration Team/);
  assert.match(supports, /Migrant Rights Centre Ireland/);
});

function clipboardHarness(writeText, secure = true) {
  const handlers = {};
  const button = { hidden: true, disabled: false, addEventListener: (event, handler) => { handlers[event] = handler; } };
  const email = { textContent: 'saggartcitywesttogether@gmail.com' };
  const success = { hidden: true }, failure = { hidden: true };
  const elements = { '[data-copy-email]': button, '#community-email': email, '[data-copy-success]': success, '[data-copy-failure]': failure };
  const document = { querySelector: selector => elements[selector] || null, querySelectorAll: () => [] };
  const window = { isSecureContext: secure, getSelection: () => null };
  runInNewContext(enhancement, { document, window, navigator: { clipboard: writeText ? { writeText } : undefined } });
  return { button, success, failure, click: handlers.click };
}
test('copy email announces success only after a successful clipboard write', async () => {
  let copied;
  const ui = clipboardHarness(async text => { copied = text; });
  await ui.click();
  assert.equal(copied, 'saggartcitywesttogether@gmail.com');
  assert.equal(ui.button.hidden, false);
  assert.equal(ui.button.disabled, false);
  assert.equal(ui.success.hidden, false);
  assert.equal(ui.failure.hidden, true);
});
test('denied clipboard permission gives an honest manual fallback and permits retry', async () => {
  let deny = true;
  const ui = clipboardHarness(async () => { if (deny) throw new Error('NotAllowedError'); });
  await ui.click();
  assert.equal(ui.success.hidden, true);
  assert.equal(ui.failure.hidden, false);
  assert.equal(ui.button.disabled, false);
  deny = false;
  await ui.click();
  assert.equal(ui.success.hidden, false);
  assert.equal(ui.failure.hidden, true);
});
test('missing Clipboard API or an insecure context never produces a false success', async () => {
  for (const ui of [clipboardHarness(null), clipboardHarness(async () => {}, false)]) {
    await ui.click();
    assert.equal(ui.success.hidden, true);
    assert.equal(ui.failure.hidden, false);
    assert.equal(ui.button.disabled, false);
  }
});
