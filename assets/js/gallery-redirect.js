// Preserve saved gallery links, including individual photographs and translations.
const destination = new URL('learn.html', location.href);
destination.search = location.search;
destination.hash = /^#photo-(historic|village|mill|citywest|luas|welcome)$/.test(location.hash) ? location.hash : '#heritage';
location.replace(destination.href);
