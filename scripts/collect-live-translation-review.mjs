// Collect actual, visible Google-translated output for a separate language
// review. A completed collection job does not certify translation quality.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { buildTranslationUrl, translationLanguages } from '../assets/js/translation.js';
import { protectedServiceTerms } from '../assets/js/protected-terms.js';
import { questions } from '../assets/data/questions.js';

const base = 'https://samobrienolinger.github.io/saggart-and-citywest-together/';
const output = 'translation-review-results';
const paths = ['citywest-supports.html', 'facts.html', 'quiz.html'];
const report = { collectedAt: new Date().toISOString(), sourceCommit: process.env.GITHUB_SHA || null,
  scope: 'Live Supports, Facts and quiz samples in all 11 offered languages; no native-speaker certification.',
  originals: [], languages: [], providerStopped: null };
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
let page;

async function snapshot(frame) {
  return frame.locator('main').evaluate(el => ({
    heading: el.querySelector('h1')?.innerText,
    visibleText: el.innerText,
    links: [...el.querySelectorAll('a')].map(a => ({ text: a.innerText, href: a.href })),
    protectedTermLayout: [...el.querySelectorAll('.service-term')].map(term => {
      const style = getComputedStyle(term);
      return {
        text: term.innerText,
        display: style.display,
        marginInlineStart: parseFloat(style.marginInlineStart),
        marginInlineEnd: parseFloat(style.marginInlineEnd),
      };
    }),
    lang: document.documentElement.lang, dir: document.documentElement.dir,
    viewport: document.documentElement.clientWidth,
    width: document.documentElement.scrollWidth,
  }));
}
async function translatedFrame() {
  for (const frame of page.frames()) {
    if (frame.url().includes('.translate.goog/') && await frame.locator('main').count()) return frame;
  }
  return null;
}
async function scrollForTranslation(frame, source) {
  // Google may translate content lazily as a reader scrolls. A full-page
  // screenshot alone does not put off-screen paragraphs into the viewport.
  const height = await frame.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 650) {
    await frame.evaluate(top => scrollTo({ top, behavior: 'instant' }), y);
    await page.waitForTimeout(350);
  }
  const ending = source.visibleText.trim().split('\n').filter(line => line.trim()).at(-1);
  await frame.waitForFunction(english => {
    const main = document.querySelector('main');
    return main && !main.innerText.includes(english);
  }, ending, { timeout: 8000 }).catch(() => {});
  await frame.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
}
async function waitForTranslatedQuestion(frame) {
  // Wait for the actual provider to translate newly inserted quiz text. Do not
  // inject translations or treat the English fallback as translated output.
  await frame.waitForFunction(bank => {
    const text = document.querySelector('#question-text')?.innerText.trim();
    return text && !bank.includes(text);
  }, questions.map(q => q.question), { timeout: 8000 }).catch(() => {});
}

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  page = await context.newPage();
  const mainResponses = [];
  page.on('response', response => {
    if (response.request().isNavigationRequest() && response.request().frame() === page.mainFrame()) {
      mainResponses.push({ url: response.url(), status: response.status() });
    }
  });
  for (const path of paths) {
    const sha256 = value => createHash('sha256').update(value).digest('hex');
    const sourceSha256 = sha256(await readFile(path));
    let response;
    let liveSha256;
    // A push can start before GitHub Pages finishes publishing that commit.
    // Wait for the exact reviewed source instead of reviewing an older deploy.
    for (let attempt = 0; attempt < 20; attempt++) {
      response = await page.goto(`${base}${path}?translation-review=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      assert.equal(response.status(), 200, `Live English source unavailable: ${path}`);
      liveSha256 = sha256(await response.body());
      if (liveSha256 === sourceSha256) break;
      await page.waitForTimeout(15000);
    }
    await page.locator('main h1').waitFor();
    assert.equal(liveSha256, sourceSha256, `Live source differs from the reviewed checkout: ${path}`);
    report.originals.push({ path, url: page.url(), liveSha256, sourceSha256, ...await snapshot(page.mainFrame()) });
  }
  for (const language of translationLanguages) {
    const result = { code: language.code, language: language.label, pages: [] };
    report.languages.push(result);
    if (report.providerStopped) {
      result.status = 'not-attempted-provider-rate-limit';
      continue;
    }
    for (const path of paths) {
      const source = report.originals.find(item => item.path === path);
      const entry = { path, sourceUrl: base + path, handoffUrl: buildTranslationUrl(language.code, base + path) };
      result.pages.push(entry);
      mainResponses.length = 0;
      try {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(entry.handoffUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForURL(url => url.hostname.endsWith('.translate.goog'), { timeout: 15000 }).catch(() => {});
        entry.url = page.url();
        entry.navigationResponses = [...mainResponses];
        if (mainResponses.some(response => response.status === 429)) {
          entry.status = 'unavailable-provider-rate-limit';
          report.providerStopped = { code: language.code, path, reason: 'HTTP 429: no retries or further language requests.' };
          break;
        }
        const frame = await translatedFrame();
        if (!frame) {
          entry.status = 'unavailable-no-translated-page';
          entry.visibleResponse = (await page.locator('body').innerText()).slice(0, 5000);
          await page.screenshot({ path: `${output}/${language.code}-${path}-unavailable.png` });
          // A provider error is not evidence of a defect in the English site.
          break;
        }
        await frame.waitForFunction(heading => {
          const h1 = document.querySelector('main h1');
          return h1 && h1.innerText.trim() !== heading.trim();
        }, source.heading, { timeout: 10000 }).catch(() => {});
        await scrollForTranslation(frame, source);
        entry.desktop = await snapshot(frame);
        const expectedProtectedTerms = protectedServiceTerms.filter(term => source.visibleText.includes(term));
        entry.protectedTerms = {
          expected: expectedProtectedTerms,
          missing: expectedProtectedTerms.filter(term => !entry.desktop.visibleText.includes(term)),
          unseparated: entry.desktop.protectedTermLayout.filter(term =>
            term.display !== 'inline-block' || term.marginInlineStart <= 0 || term.marginInlineEnd <= 0),
        };
        entry.status = entry.desktop.heading.trim() === source.heading.trim() ? 'untranslated-output'
          : entry.protectedTerms.missing.length ? 'protected-term-changed'
            : entry.protectedTerms.unseparated.length ? 'protected-term-boundary-missing'
            : 'captured-awaiting-language-review';
        await page.screenshot({ path: `${output}/${language.code}-${path}-desktop.png`, fullPage: true });
        await page.setViewportSize({ width: 390, height: 844 });
        entry.mobile = await snapshot(frame);
        await page.screenshot({ path: `${output}/${language.code}-${path}-mobile.png`, fullPage: true });
        if (path === 'quiz.html') {
          entry.quiz = { questions: [] };
          const start = frame.locator('#start-quiz');
          await start.click({ timeout: 10000 });
          for (let index = 0; index < 10; index++) {
            await waitForTranslatedQuestion(frame);
            const question = await frame.locator('#question-text').innerText();
            const sample = { question, options: await frame.locator('#answer-options button').allInnerTexts(),
              unchangedEnglish: questions.some(item => item.question === question.trim()) };
            entry.quiz.questions.push(sample);
            await frame.locator('#answer-options button').first().click();
            await frame.waitForFunction(explanations => {
              const text = document.querySelector('#feedback')?.innerText || '';
              return text && !explanations.some(explanation => text.includes(explanation));
            }, questions.map(item => item.explanation), { timeout: 8000 }).catch(() => {});
            sample.feedback = await frame.locator('#feedback').innerText();
            if (sample.unchangedEnglish) { entry.quiz.status = 'dynamic-text-remained-English'; break; }
            await frame.locator('#next-question').click();
          }
          if (entry.quiz.questions.length === 10 && entry.quiz.questions.every(q => !q.unchangedEnglish)) {
            await frame.waitForFunction(() => {
              const heading = document.querySelector('#result-heading')?.innerText || '';
              return heading && !['Excellent local knowledge!', 'A strong start!', 'Every question is a chance to learn.'].includes(heading.trim());
            }, undefined, { timeout: 8000 }).catch(() => {});
            entry.quiz.status = 'completed-awaiting-language-review';
            entry.quiz.results = await frame.locator('#results-panel').innerText();
          }
          await page.screenshot({ path: `${output}/${language.code}-quiz-active.png`, fullPage: true });
        }
      } catch (error) {
        entry.status = 'unverified-browser-error';
        entry.error = String(error);
        entry.url = page.url();
        entry.navigationResponses = [...mainResponses];
        if (mainResponses.some(response => response.status === 429)) {
          report.providerStopped = { code: language.code, path, reason: 'HTTP 429: no retries or further language requests.' };
        }
        await page.screenshot({ path: `${output}/${language.code}-${path}-error.png` }).catch(() => {});
        break;
      } finally {
        await writeFile(`${output}/review.json`, JSON.stringify(report, null, 2));
      }
    }
    result.status = result.pages.every(item => item.status === 'captured-awaiting-language-review') && result.pages.length === paths.length
      ? 'captured-awaiting-language-review' : 'incomplete';
  }
} catch (error) {
  report.error = String(error);
  process.exitCode = 1;
} finally {
  await writeFile(`${output}/review.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ languages: report.languages.map(item => ({ code: item.code, status: item.status })),
    providerStopped: report.providerStopped, error: report.error || null }, null, 2));
  await browser.close();
}
