export const protectedServiceTerms = Object.freeze([
  'DDLETB', 'REALT', 'IPAS', 'LAIT', 'MRCI', 'ESOL', 'SDCP', 'IPO', 'FET', 'EWO', 'JRS', 'Nasc',
]);

const escapedTerms = protectedServiceTerms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const serviceTermPattern = new RegExp(`(^|[^\\p{L}\\p{N}_-])(${escapedTerms.join('|')})(?=$|[^\\p{L}\\p{N}_-])`, 'gu');

export function protectedTextParts(value) {
  const parts = [];
  let cursor = 0;
  for (const match of String(value).matchAll(serviceTermPattern)) {
    const termStart = match.index + match[1].length;
    if (termStart > cursor) parts.push({ text: String(value).slice(cursor, termStart), protected: false });
    parts.push({ text: match[2], protected: true });
    cursor = termStart + match[2].length;
  }
  if (cursor < String(value).length) parts.push({ text: String(value).slice(cursor), protected: false });
  return parts;
}

export function setProtectedText(element, value) {
  const nodes = protectedTextParts(value).map(part => {
    if (!part.protected) return document.createTextNode(part.text);
    const span = document.createElement('span');
    span.className = 'notranslate service-term';
    span.setAttribute('translate', 'no');
    span.textContent = part.text;
    return span;
  });
  element.replaceChildren(...nodes);
}
