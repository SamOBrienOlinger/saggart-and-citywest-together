import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('community content precedes local services and retains the local Citywest guide without the removed external link', () => {
  const home = read('index.html');
  const sections = ['<section class="community-section"', '<section id="local-services"', '<section class="quiz-strip"'];
  const positions = sections.map(section => home.indexOf(section));
  sections.forEach(section => assert.equal(home.split(section).length - 1, 1, section));
  assert.ok(positions[0] > home.indexOf('<nav class="home-shortcuts'));
  assert.ok(positions[0] < positions[1] && positions[1] < positions[2]);
  assert.match(home, /href="citywest-supports\.html"[^>]*><svg/);
  assert.doesNotMatch(home, /Official IPAS website/);
  assert.doesNotMatch(home, /href="https:\/\/ipas\.irishimmigration\.ie\/"/);
  assert.doesNotMatch(home, /class="container official-service-link"/);
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
test('gallery preserves the original 22 images and appends six Samhain photographs', () => {
  const html = read('index.html');
  const expected = JSON.parse(read('tests/fixtures/community-gallery.json')).images;
  const slides = html.match(/<figure class="community-slide"[\s\S]*?<\/figure>/g);
  const thumbnails = html.match(/<button class="carousel-thumb"[\s\S]*?<\/button>/g);
  assert.equal(slides.length, 28);
  assert.equal(thumbnails.length, 28);
  assert.equal(expected.length, 28);
  assert.equal(expected[0].src, 'assets/images/community/samhain-gathering-2026.jpg');
  assert.deepEqual(slides.map(slide => slide.match(/<img src="([^"]+)"/)[1]), expected.map(image => image.src));
  slides.forEach((slide, i) => {
    assert.ok(slide.includes(`data-image-index="${i}"`));
    assert.ok(slide.includes(`aria-label="${i + 1} of 28"`));
    assert.ok(thumbnails[i].includes(`data-slide="${i}"`));
    assert.ok(thumbnails[i].includes(`src="${expected[i].src}"`));
    assert.doesNotMatch(slide, /<figcaption/);
    const bytes = readFileSync(new URL('../' + expected[i].src, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expected[i].sha256, expected[i].src);
  });
  assert.deepEqual(expected.slice(7, 10).map(image => image.src.split('/').pop()), [
    'potluck-poster.jpg', 'human-library-poster.jpg', 'village-clean-up-poster.jpg',
  ]);
  assert.doesNotMatch(html, /class="event-archive|class="event-posters|class="event-poster-grid/);
});
