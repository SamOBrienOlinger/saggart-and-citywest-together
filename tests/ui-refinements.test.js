import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('local services precede community content and distinguish the local guide from IPAS', () => {
  const home = read('index.html');
  assert.ok(home.indexOf('<section id="local-services"') < home.indexOf('<section class="community-section"'));
  assert.match(home, /href="citywest-supports\.html"[^>]*><svg/);
  assert.match(home, /Official IPAS website/);
  assert.match(home, /href="https:\/\/ipas\.irishimmigration\.ie\/" target="_blank"/);
});
test('contact supports native email plus an optional, accessible clipboard interaction', () => {
  const html = read('contact.html');
  assert.match(html, /<h1>Contact us and get involved<\/h1>/);
  assert.match(html, /id="copy-email"[^>]*hidden/);
  assert.match(html, /id="copy-email-status"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(html, /id="contact-email"[^>]*href="mailto:saggartcitywesttogether@gmail\.com"/);
  assert.match(html, /id="copy-email-fallback"/);
  assert.doesNotMatch(html, /<form\b/);
});
test('supports have short headings, task anchors and organisation names beside the relevant links', () => {
  const html = read('citywest-supports.html');
  assert.match(html, /<h1>Citywest IPAS supports<\/h1>/);
  assert.match(html, /Local services for people living at the Citywest International Protection Accommodation Service \(IPAS\) centre\./);
  for (const id of ['english-classes', 'work-and-training', 'rights-and-advice', 'local-service-help']) {
    assert.ok(html.includes(`href="#${id}"`) && html.includes(`id="${id}"`), id);
  }
  assert.equal((html.match(/class="support-task"/g) || []).length, 10);
  assert.equal((html.match(/class="service-explainer"/g) || []).length, 5);
});
test('Facts resources retain all sources and visible context in a task-first reading order', () => {
  const articles = read('facts.html').match(/<article class="facts-resource"[\s\S]*?<\/article>/g);
  assert.equal(articles.length, 16);
  for (const article of articles) {
    assert.match(article, /^<article[^>]*><h3 class="resource-purpose">/);
    assert.ok(article.indexOf('resource-purpose') < article.indexOf('resource-publisher'));
    assert.ok(article.indexOf('resource-publisher') < article.indexOf('resource-source'));
    assert.match(article, /class="resource-source"><a href="https:\/\//);
    assert.match(article, /class="resource-context"/);
  }
});
test('photo carousel has 18 photographs; three posters remain in the native archive disclosure', () => {
  const html = read('index.html');
  const slides = html.match(/<figure class="community-slide"[\s\S]*?<\/figure>/g);
  assert.equal(slides.length, 18);
  slides.forEach((slide, i) => {
    assert.ok(slide.includes(`data-image-index="${i}"`));
    assert.ok(slide.includes(`aria-label="${i + 1} of 18"`));
    assert.doesNotMatch(slide, /poster\.jpg|<figcaption/);
  });
  assert.match(html, /<details class="event-posters"><summary>View archived posters<\/summary>/);
  assert.equal((html.match(/<p>Archived poster<\/p>/g) || []).length, 3);
  assert.match(html, /not a list of upcoming events/);
});
