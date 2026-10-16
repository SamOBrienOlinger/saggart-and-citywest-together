import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { learningSections } from '../assets/data/content.js';
import { historyPhotos } from '../assets/data/history-photos.js';
import { renderHistoryGallery } from '../scripts/history-gallery.mjs';

const html = readFileSync(new URL('../learn.html', import.meta.url), 'utf8');

test('population introduction is removed without removing population cards or sources', () => {
  assert.equal(learningSections.find(section => section.id === 'people').intro, '');
  assert.doesNotMatch(html, /Census figures tell us about people living in an area at a particular time/);
  assert.match(html, /<h2>People and population<\/h2><\/div>/);
  assert.match(html, /Census 2022 counted 4,573 people/);
  assert.equal(learningSections.find(section => section.id === 'people').items.length, 4);
});

test('Hunting Brook Gardens uses the requested copy and retains its note and source', () => {
  const garden = learningSections.find(section => section.id === 'nature').items.find(item => item.source === 'huntingBrook');
  const expected = 'Hunting Brook Gardens is a short drive westward and is made up of five acres of contemporary exotic gardens and fifteen acres of woodland gardens.';
  assert.equal(garden.body, expected);
  assert.ok(html.includes(`<p>${expected}</p>`));
  assert.equal(garden.note, 'Courses<br>Tours, Lectures and more');
  assert.ok(html.includes('href="https://www.huntingbrookgardens.com/visit-the-gardens"'));
});

test('Welcome has one caption heading and retains its original image and controls', () => {
  const photo = historyPhotos.find(item => item.id === 'photo-welcome');
  assert.equal(photo.label, 'Welcome');
  assert.equal(photo.title, 'Welcome');
  assert.equal(photo.description, '');
  assert.ok(html.includes(renderHistoryGallery()), 'The published gallery must match its renderer');
  const slide = html.match(/<figure class="gallery-slide" id="photo-welcome"[\s\S]*?<\/figure>/)?.[0];
  assert.ok(slide);
  assert.match(slide, /<h3 id="title-photo-welcome" data-gallery-title>Welcome<\/h3>/);
  assert.doesNotMatch(slide, /gallery-topic|<p[\s>]|Welcome to the village|Explore visitor information/);
  assert.match(slide, /data-gallery-open hidden>View full photograph<\/button>/);
  assert.equal(photo.source, 'https://www.dublinsoutdoors.ie/visit/our-villages/saggart/');
  assert.ok(slide.includes(`href="${photo.source}" target="_blank" rel="noopener noreferrer"`));
  const image = readFileSync(new URL('../' + photo.src, import.meta.url));
  assert.equal(createHash('sha256').update(image).digest('hex'), 'f2e34f56625fd2ff079aa831fcd4e8947898b7af582daad91ce1fe34d70e7077');
  assert.equal(historyPhotos.length, 6);
});


test('community participation uses the exact requested wording in the source and page', () => {
  const expected = 'Regardless of age, ability, additional needs or social background, everyone can use local services and have a say in decisions about the area.';
  const item = learningSections.find(section => section.id === 'community').items.find(item => item.title === 'Making it easier for everyone to join in');
  assert.equal(item.body, expected);
  assert.equal(item.source, 'community');
  assert.ok(html.includes(`<p>${expected}</p>`));
  assert.doesNotMatch(html, /Everyone should be able to use local services and have a say in decisions/);
});
