import { historyPhotos } from '../assets/data/history-photos.js';
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

export const renderHistoryGallery = () => `
<div class="history-gallery-intro"><p>Our area in photographs</p><a href="#history-stories">Read the local stories</a></div>
<section class="photo-gallery" aria-label="Photographs of Saggart and Citywest" aria-roledescription="carousel">
  <div class="gallery-navigation" hidden>
    <button class="gallery-control" type="button" data-gallery-step="-1">Previous<span class="sr-only"> photograph</span></button>
    <p class="gallery-counter" role="status" aria-live="polite" aria-atomic="true"><span data-gallery-count>1 / ${historyPhotos.length}</span><span class="sr-only" data-gallery-announcement></span></p>
    <button class="gallery-control" type="button" data-gallery-step="1">Next<span class="sr-only"> photograph</span></button>
  </div>
  <div class="gallery-stage">${historyPhotos.map(photo => `
    <figure class="gallery-slide" id="${photo.id}" aria-labelledby="title-${photo.id}">
      <div class="gallery-image-wrap"><img class="gallery-main-photo" src="${photo.src}"${photo.srcset ? ` srcset="${photo.srcset}" sizes="(min-width: 900px) 64vw, 100vw"` : ''} width="${photo.width}" height="${photo.height}" alt="${escape(photo.alt)}" loading="lazy" decoding="async" draggable="false"></div>
      <figcaption class="gallery-caption">
        <p class="gallery-topic">${escape(photo.label)}</p>
        <h3 id="title-${photo.id}" data-gallery-title>${escape(photo.title)}</h3>
        <p>${escape(photo.description)}</p>
        ${photo.credit ? `<p class="gallery-attribution">${escape(photo.credit)}</p>` : ''}
        <div class="gallery-photo-actions"><button type="button" class="gallery-open" data-gallery-open hidden>View full photograph</button><a class="gallery-source" href="${escape(photo.source)}" target="_blank" rel="noopener noreferrer">Photo source<span class="sr-only"> (opens in a new tab)</span></a></div>
      </figcaption>
    </figure>`).join('')}
  </div>
  <div class="gallery-thumbnails" role="group" aria-label="Choose a photograph" hidden>${historyPhotos.map((photo, index) => `
    <button class="gallery-thumbnail" type="button" aria-controls="${photo.id}" aria-pressed="${index === 0}"><img src="${photo.src}" width="${photo.width}" height="${photo.height}" alt="" loading="lazy" decoding="async"><span>${escape(photo.label)}</span><span class="sr-only">: ${escape(photo.title)}</span></button>`).join('')}
  </div>
  <p class="gallery-help" hidden>Swipe across a photograph or choose one below.</p>
</section>
<dialog class="history-dialog" aria-labelledby="history-dialog-title">
  <div class="history-dialog-toolbar"><h2 id="history-dialog-title">Local photograph</h2><button type="button" class="history-dialog-close">Close</button></div>
  <img class="history-dialog-image" alt="">
  <p class="history-dialog-caption"></p>
</dialog>`.replaceAll(/^[\t ]+$/gm, '');
