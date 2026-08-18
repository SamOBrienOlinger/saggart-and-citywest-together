import test from 'node:test';
import assert from 'node:assert/strict';
import { learningSections, sources } from '../assets/data/content.js';

test('Census snapshot is scoped and sourced to official CSO publications', () => {
  const people = learningSections.find(section => section.id === 'people');
  assert.ok(people, 'people and population section is missing');
  const copy = people.items.map(item => `${item.title} ${item.scope} ${item.body}`).join(' ');
  assert.match(copy, /Saggart Built Up Area/);
  assert.match(copy, /4,573/);
  assert.match(copy, /30\.4 years/);
  assert.match(copy, /1,529 were aged under 15 \(33\.4%\)/);
  assert.match(copy, /278 were 65 or older \(6\.1%\)/);
  assert.match(copy, /does not exactly match the full Saggart and Citywest community catchment/);
  for (const key of ['csoPopulation', 'csoAge', 'csoHouseholds', 'csoMap']) {
    assert.match(sources[key].url, /^https:\/\/(?:www\.|data\.|visual\.)?cso\.ie\//, key);
  }
});

test('requested local resources include official links and callable phone numbers', () => {
  const resources = learningSections.find(section => section.id === 'resources');
  assert.ok(resources, 'local contacts section is missing');
  const expected = new Map([
    ['Rathcoole Garda Station', 'tel:+35316667900'],
    ['Tallaght Garda Station', 'tel:+35316666000'],
    ['Clondalkin Garda Station', 'tel:+35316667600'],
    ['Saggart Schoolhouse Community Centre', 'tel:+35315782377'],
    ['St Mary’s GAA Club', 'tel:+353868371963']
  ]);
  for (const [title, phone] of expected) {
    const item = resources.items.find(resource => resource.title === title);
    assert.ok(item, `${title} is missing`);
    assert.match(item.body, new RegExp(phone.replace('+', '\\+')));
    assert.ok(sources[item.source]?.url.startsWith('https://'), `${title} source is missing`);
  }
  assert.match(resources.intro, /999 or 112/);
});
