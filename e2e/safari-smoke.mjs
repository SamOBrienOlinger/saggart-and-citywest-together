import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { Builder, By, until } from 'selenium-webdriver';
import { questions } from '../assets/data/questions.js';
import { inspectTextReflow } from './text-reflow.mjs';
import { inspectButtonAppearance } from './button-appearance.mjs';

const output = 'safari-results';
await mkdir(output, { recursive: true });
let driver;
let checkpoint = 'Create native Safari session';
const pointerChecks = [];
const findings = [];
const base = 'http://127.0.0.1:4180/';
async function open(path = '') {
  checkpoint = `Open ${path || 'index.html'}`;
  await driver.get(base + path);
  if (path.startsWith('gallery.html')) await driver.wait(until.urlContains('learn.html'), 10000);
  await driver.wait(() => driver.executeScript('return document.readyState === "complete"'), 10000);
  await driver.wait(until.elementLocated(By.css('.nav-ready')), 10000);
}
async function setTextScale(scale, expectedFont) {
  const percentage = `${scale}%`;
  checkpoint = `Check ${scale}% text on ${await driver.getCurrentUrl()}`;
  // Confirm the requested scale has rendered before comparing controls.
  await driver.wait(async () => {
    await driver.executeScript('document.documentElement.style.fontSize = arguments[0]', percentage);
    return driver.executeScript(`
      const root = document.documentElement;
      const control = document.querySelector('.translate-toggle');
      const rootFont = getComputedStyle(root).fontSize;
      return document.readyState === 'complete' && root.style.fontSize === arguments[0]
        && control && getComputedStyle(control).fontSize === rootFont
        && (!arguments[1] || rootFont === arguments[1]);
    `, percentage, expectedFont || null);
  }, 10000);
}
// The site's smooth hash/focus scrolling can still be running when WebDriver
// clicks. Settle the real target first; keep a single native click and all of
// the subsequent gallery, dialog, image and quiz assertions.
async function clickElement(element, label) {
  checkpoint = `Native click: ${label}`;
  await driver.wait(until.elementIsVisible(element), 10000, checkpoint);
  await driver.wait(until.elementIsEnabled(element), 10000, checkpoint);
  await driver.executeScript("arguments[0].scrollIntoView({block:'center', inline:'nearest', behavior:'instant'})", element);
  let previous;
  let stableSamples = 0;
  let sample;
  await driver.wait(async () => {
    sample = await driver.executeScript(function (target) {
      const rect = target.getBoundingClientRect();
      const left = Math.max(0, rect.left), right = Math.min(innerWidth, rect.right);
      const top = Math.max(0, rect.top), bottom = Math.min(innerHeight, rect.bottom);
      const hit = document.elementFromPoint((left + right) / 2, (top + bottom) / 2);
      return {
        position: [rect.x, rect.y, rect.width, rect.height, scrollX, scrollY],
        ready: right > left && bottom > top && !!hit && target.contains(hit),
        hit: hit ? hit.tagName.toLowerCase() + (hit.id ? '#' + hit.id : '') : null,
      };
    }, element);
    const stationary = previous && sample.position.every((value, index) => Math.abs(value - previous[index]) < .5);
    stableSamples = sample.ready && stationary ? stableSamples + 1 : 0;
    previous = sample.position;
    return stableSamples >= 3;
  }, 10000, `${checkpoint}: target must be stationary and receive pointer input`, 100);
  pointerChecks.push({ checkpoint, url: await driver.getCurrentUrl(), ...sample });
  await element.click();
}
async function click(selector) {
  await clickElement(await driver.findElement(By.css(selector)), selector);
}
async function visible(selector) {
  checkpoint = `Visible after native input: ${selector}`;
  await driver.wait(until.elementIsVisible(await driver.findElement(By.css(selector))), 10000, checkpoint);
}
async function text(selector) { return driver.findElement(By.css(selector)).getText(); }
async function countIs(value) {
  await driver.wait(async () => (await text('[data-current]')) === String(value), 10000);
}
try {
  driver = await new Builder().forBrowser('safari').build();
  const caps = await driver.getCapabilities();
  findings.push({ browser: caps.get('browserName'), version: caps.get('browserVersion'), platform: caps.get('platformName') });
  await driver.manage().window().setRect({ width: 1440, height: 1000 });
  const buttonReferences = new Map();
  for (const path of ['index.html', 'learn.html', 'facts.html', 'citywest-supports.html', 'quiz.html', 'contact.html', 'about.html', 'privacy.html', 'accessibility.html', '404.html', 'gallery.html', 'missing/does-not-exist.html']) {
    for (const scale of [100, 200]) {
      await open(path);
      const expectedFont = buttonReferences.get(scale)?.fontSize
        || (buttonReferences.has(100) ? `${parseFloat(buttonReferences.get(100).fontSize) * scale / 100}px` : null);
      await setTextScale(scale, expectedFont);
      const dimensions = await driver.executeScript(inspectTextReflow);
      assert.ok(dimensions.document <= dimensions.viewport + 1, `Overflow on ${path} at ${scale}% text`);
      assert.deepEqual(dimensions.issues, [], `Clipped text on ${path} at ${scale}% text`);
      const buttons = await driver.executeScript(inspectButtonAppearance, buttonReferences.get(scale));
      if (path === 'index.html') buttonReferences.set(scale, buttons.standard);
      assert.deepEqual(buttons.issues, [], `Button appearance differs on ${path} at ${scale}% text`);
      findings.push({ page: path, textScale: scale, ...dimensions, result: 'passed' });
    }
  }
  await open('gallery.html#photo-mill');
  await driver.wait(until.urlContains('learn.html#photo-mill'), 10000);
  await visible('#photo-mill');
  await click('#photo-mill [data-gallery-open]');
  await visible('.history-dialog');
  await click('.history-dialog-close');
  await driver.wait(() => driver.executeScript('return !document.querySelector(".history-dialog").open'), 10000, 'History dialog closes after native click');
  findings.push({ check: 'History gallery, saved photo links and full-image view', result: 'passed' });
  await open();
  const imageCount = (await driver.findElements(By.css(".community-slide"))).length;
  for (let index = 0; index < imageCount; index++) {
    await click(`[data-slide="${index}"]`);
    await countIs(index + 1);
    await driver.wait(() => driver.executeScript('const i = document.querySelectorAll(".community-slide img")[arguments[0]]; return i.complete && i.naturalWidth > 0', index), 10000);
  }
  await click('[data-next]');
  await countIs(1);
  await click('[data-previous]');
  await countIs(imageCount);
  await click(`[data-image-index="${imageCount - 1}"]`);
  await visible('.image-dialog');
  await click('.dialog-close');
  await driver.wait(() => driver.executeScript('return !document.querySelector(".image-dialog").open'), 10000);
  findings.push({ check: 'All community images, wrap-around and full-image dialog', result: 'passed' });
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
    await clickElement(selected, `Correct answer for question ${index + 1}`);
    assert.equal(await text('#current-score'), String(index + 1));
    await click('#next-question');
  }
  assert.equal(await text('#result-score'), '10/10');
  findings.push({ check: 'Complete quiz with shuffled answers', result: 'passed', score: '10/10' });
  await open();
  await setTextScale(200, buttonReferences.get(200).fontSize);
  const enlarged = await driver.executeScript('return {viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth}');
  assert.ok(enlarged.document <= enlarged.viewport + 1);
  findings.push({ check: '200% text on desktop Safari', result: 'passed', ...enlarged });
  await setTextScale(100, buttonReferences.get(100).fontSize);
  await writeFile(`${output}/homepage.png`, await driver.takeScreenshot(), 'base64');
  await writeFile(`${output}/results.json`, JSON.stringify(findings, null, 2));
  console.log(JSON.stringify(findings, null, 2));
} catch (error) {
  let pageState = null;
  if (driver) {
    await driver.takeScreenshot().then(image => writeFile(`${output}/failure.png`, image, 'base64')).catch(() => {});
    await driver.getPageSource().then(html => writeFile(`${output}/failure.html`, html)).catch(() => {});
    pageState = await driver.executeScript(() => ({
      url: location.href, scrollX, scrollY,
      activeElement: document.activeElement?.outerHTML.slice(0, 500),
      dialogs: [...document.querySelectorAll('dialog')].map(dialog => ({
        id: dialog.id, open: dialog.open, display: getComputedStyle(dialog).display,
      })),
    })).catch(() => null);
  }
  await writeFile(`${output}/results.json`, JSON.stringify({ findings, checkpoint, pointerChecks, pageState, error: String(error), stack: error.stack }, null, 2));
  throw error;
} finally {
  if (driver) await driver.quit().catch(() => {});
}
