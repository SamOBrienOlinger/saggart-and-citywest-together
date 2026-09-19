import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { Builder, By, Key, until } from 'selenium-webdriver';
import { questions } from '../assets/data/questions.js';

const output = 'safari-results';
await mkdir(output, { recursive: true });
const driver = await new Builder().forBrowser('safari').build();
const findings = [];
const base = 'http://127.0.0.1:4180/';
async function open(path = '') {
  await driver.get(base + path);
  await driver.wait(until.elementLocated(By.css('.nav-ready')), 10000);
}
async function click(selector) {
  const element = await driver.findElement(By.css(selector));
  await driver.executeScript("arguments[0].scrollIntoView({block:'center'})", element);
  await element.click();
}
async function text(selector) { return driver.findElement(By.css(selector)).getText(); }
async function countIs(value) {
  await driver.wait(async () => (await text('[data-current]')) === String(value), 10000);
}
try {
  const caps = await driver.getCapabilities();
  findings.push({ browser: caps.get('browserName'), version: caps.get('browserVersion'), platform: caps.get('platformName') });
  await driver.manage().window().setRect({ width: 1440, height: 1000 });
  for (const path of ['index.html', 'learn.html', 'facts.html', 'citywest-supports.html', 'quiz.html', 'contact.html', 'about.html', 'privacy.html', 'accessibility.html']) {
    await open(path);
    const dimensions = await driver.executeScript('return {viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth}');
    assert.ok(dimensions.document <= dimensions.viewport + 1, `Overflow on ${path}`);
    findings.push({ page: path, ...dimensions, result: 'passed' });
  }
  await open('gallery.html#photo-mill');
  await driver.wait(until.urlContains('learn.html#photo-mill'), 10000);
  await driver.wait(until.elementIsVisible(await driver.findElement(By.css('#photo-mill'))), 10000);
  await click('#photo-mill [data-gallery-open]');
  await driver.wait(until.elementIsVisible(await driver.findElement(By.css('.history-dialog'))), 10000);
  await click('.history-dialog-close');
  findings.push({ check: 'History gallery, saved photo links and full-image view', result: 'passed' });
  await open();
  for (let index = 0; index < 10; index++) {
    await click(`[data-slide="${index}"]`);
    await countIs(index + 1);
    await driver.wait(() => driver.executeScript('const i = document.querySelectorAll(".community-slide img")[arguments[0]]; return i.complete && i.naturalWidth > 0', index), 10000);
  }
  await click('[data-next]');
  await countIs(1);
  await click('[data-previous]');
  await countIs(10);
  await click('[data-image-index="9"]');
  await driver.wait(until.elementIsVisible(await driver.findElement(By.css('.image-dialog'))), 10000);
  await click('.dialog-close');
  await driver.wait(() => driver.executeScript('return !document.querySelector(".image-dialog").open'), 10000);
  findings.push({ check: 'Ten images, wrap-around and full-image dialog', result: 'passed' });
  await open('contact.html');
  assert.equal(await driver.findElement(By.linkText('Email the community')).getAttribute('href'), 'mailto:saggartcitywesttogether@gmail.com');
  assert.equal((await driver.findElements(By.css('form'))).length, 0);
  findings.push({ check: 'Direct email contact', result: 'passed' });
  await open('quiz.html');
  await click('#start-quiz');
  for (let index = 0; index < 10; index++) {
    const question = await text('#question-text');
    const original = questions.find(q => q.question === question);
    assert.ok(original, 'Question found in the approved bank');
    const correct = original.options[original.correctIndex];
    const choices = await driver.findElements(By.css('#answer-options button'));
    let selected;
    for (const option of choices) {
      if ((await option.getText()) === correct) selected = option;
    }
    assert.ok(selected, 'Correct option retained after shuffle');
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'})", selected);
    await selected.click();
    assert.equal(await text('#current-score'), String(index + 1));
    await click('#next-question');
  }
  assert.equal(await text('#result-score'), '10/10');
  findings.push({ check: 'Complete quiz with shuffled answers', result: 'passed', score: '10/10' });
  await open();
  await driver.executeScript('document.documentElement.style.fontSize = "200%"');
  const enlarged = await driver.executeScript('return {viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth}');
  assert.ok(enlarged.document <= enlarged.viewport + 1);
  findings.push({ check: '200% text on desktop Safari', result: 'passed', ...enlarged });
  await driver.executeScript('document.documentElement.style.fontSize = "100%"');
  await writeFile(`${output}/homepage.png`, await driver.takeScreenshot(), 'base64');
  await writeFile(`${output}/results.json`, JSON.stringify(findings, null, 2));
  console.log(JSON.stringify(findings, null, 2));
} catch (error) {
  await writeFile(`${output}/failure.png`, await driver.takeScreenshot(), 'base64').catch(() => {});
  await writeFile(`${output}/results.json`, JSON.stringify({ findings, error: error.message }, null, 2));
  throw error;
} finally {
  await driver.quit();
}
