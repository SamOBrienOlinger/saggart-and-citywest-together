// Keep the local guide readable without JavaScript and visible to page translators.
// Run after editing assets/data/content.js; the generated HTML is committed.
import { readFile, writeFile } from 'node:fs/promises';
import { learningSections, sources } from '../assets/data/content.js';
import { renderHistoryGallery } from './history-gallery.mjs';
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const content = learningSections.map(section => {
  const history = section.id === 'heritage';
  const heading = history ? 'h4' : 'h3';
  return `<section id="${section.id}" class="learning-section${history ? ' history-section' : ''}"><div class="learning-section-header"><h2>${section.title}</h2><p>${section.intro}</p></div>${history ? renderHistoryGallery() + '<div class="history-stories-heading"><h3 id="history-stories">The stories behind the places</h3><p>Discover the traditions, landmarks and working lives that helped shape the area.</p></div>' : ''}<div class="learning-grid${history ? ' history-stories-grid' : ''}">${section.items.map(item => {
  const source = sources[item.source];
  return `<article class="learning-card"><span class="scope-tag">${item.scope}</span><${heading}>${item.title}</${heading}><p>${item.body}</p>${history && item.title === 'Milling and village life' ? '<p><a href="#photo-mill">See the mill photograph</a></p>' : ''}<p class="source-line">Source: <a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.publisher)}: ${escape(source.title)}<span class="sr-only"> (opens in a new tab)</span></a></p></article>`;
}).join('\n')}</div><a class="back-top" href="${history ? '#explore-topic-heading' : '#main'}">${history ? 'Back to topics' : 'Back to top'}</a></section>`;
}).join('\n');
const path = new URL('../learn.html', import.meta.url);
let html = await readFile(path, 'utf8');
if (html.includes('<!-- learning:start -->')) html = html.replace(/<!-- learning:start -->[\s\S]*?<!-- learning:end -->/, `<!-- learning:start -->\n${content}\n<!-- learning:end -->`);
else html = html.replace('<p>Loading learning topics…</p>', `<!-- learning:start -->\n${content}\n<!-- learning:end -->`);
html = html.replace(/<script[^>]*src="assets\/js\/learn\.js[^>]*><\/script>/, '');
await writeFile(path, html);
