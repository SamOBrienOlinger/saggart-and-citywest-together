// Keep the local guide readable without JavaScript and visible to page translators.
// Run after editing assets/data/content.js; the generated HTML is committed.
import { readFile, writeFile } from 'node:fs/promises';
import { learningSections, sources } from '../assets/data/content.js';
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const content = learningSections.map(section => `<section id="${section.id}" class="learning-section"><div class="learning-section-header"><h2>${section.title}</h2><p>${section.intro}</p></div><div class="learning-grid">${section.items.map(item => {
  const source = sources[item.source];
  return `<article class="learning-card"><span class="scope-tag">${item.scope}</span><h3>${item.title}</h3><p>${item.body}</p><p class="source-line">Source: <a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.publisher)}: ${escape(source.title)}<span class="sr-only"> (opens in a new tab)</span></a></p></article>`;
}).join('\n')}</div><a class="back-top" href="#main">Back to top</a></section>`).join('\n');
const path = new URL('../learn.html', import.meta.url);
let html = await readFile(path, 'utf8');
if (html.includes('<!-- learning:start -->')) html = html.replace(/<!-- learning:start -->[\s\S]*?<!-- learning:end -->/, `<!-- learning:start -->\n${content}\n<!-- learning:end -->`);
else html = html.replace('<p>Loading learning topics…</p>', `<!-- learning:start -->\n${content}\n<!-- learning:end -->`);
html = html.replace(/<script[^>]*src="assets\/js\/learn\.js[^>]*><\/script>/, '');
await writeFile(path, html);
