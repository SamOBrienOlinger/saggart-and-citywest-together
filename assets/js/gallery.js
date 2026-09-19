const gallery = document.querySelector('.photo-gallery');

if (gallery) {
  const slides = [...gallery.querySelectorAll('.gallery-slide')];
  const thumbnails = [...gallery.querySelectorAll('.gallery-thumbnail')];
  const rail = gallery.querySelector('.gallery-thumbnails');
  const counter = gallery.querySelector('[data-gallery-count]');
  const announcement = gallery.querySelector('[data-gallery-announcement]');
  const dialog = document.querySelector('.history-dialog');
  let current = 0;
  let opener;
  const direction = () => getComputedStyle(gallery).direction === 'rtl' ? -1 : 1;

  const showPhoto = (index, announce = true) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    thumbnails.forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
    slides[current].querySelector('.gallery-main-photo').loading = 'eager';
    // Only numbers are generated; labels, titles and captions remain translatable HTML.
    counter.textContent = `${current + 1} / ${slides.length}`;
    announcement.textContent = announce ? `: ${slides[current].querySelector('[data-gallery-title]').textContent}` : '';
    const item = thumbnails[current].getBoundingClientRect();
    const viewport = rail.getBoundingClientRect();
    if (item.left < viewport.left || item.right > viewport.right) {
      rail.scrollBy({ left: item.left - viewport.left - (viewport.width - item.width) / 2, behavior: 'instant' });
    }
  };

  const followPhotoLink = () => {
    const index = slides.findIndex(slide => `#${slide.id}` === location.hash);
    if (index < 0) return;
    showPhoto(index, false);
    requestAnimationFrame(() => slides[index].scrollIntoView({ block: 'start', behavior: 'instant' }));
  };

  gallery.classList.add('is-ready');
  gallery.querySelector('.gallery-navigation').hidden = false;
  gallery.querySelector('.gallery-help').hidden = false;
  rail.hidden = false;
  showPhoto(0, false);
  followPhotoLink();
  window.addEventListener('hashchange', followPhotoLink);
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#photo-"]');
    if (link && link.hash === location.hash) followPhotoLink();
  });

  gallery.querySelectorAll('[data-gallery-step]').forEach(button => {
    button.addEventListener('click', () => showPhoto(current + Number(button.dataset.galleryStep)));
  });
  thumbnails.forEach((button, index) => button.addEventListener('click', () => showPhoto(index)));
  gallery.addEventListener('keydown', event => {
    if (!event.target.closest('button') || event.altKey || event.ctrlKey || event.metaKey) return;
    const destinations = { ArrowLeft: current - direction(), ArrowRight: current + direction(), Home: 0, End: slides.length - 1 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    showPhoto(destinations[event.key]);
    if (rail.contains(event.target)) thumbnails[current].focus({ preventScroll: true });
  });

  slides.forEach(slide => {
    const photo = slide.querySelector('.gallery-main-photo');
    const open = slide.querySelector('[data-gallery-open]');
    if (dialog && typeof dialog.showModal === 'function') {
      open.hidden = false;
      open.addEventListener('click', () => {
        opener = open;
        const image = dialog.querySelector('img');
        image.src = photo.src;
        image.alt = photo.alt;
        dialog.querySelector('h2').textContent = slide.querySelector('[data-gallery-title]').textContent;
        dialog.querySelector('.history-dialog-caption').textContent = [...slide.querySelectorAll('.gallery-caption > p:not(.gallery-topic)')].map(p => p.textContent).join(' ');
        dialog.showModal();
        dialog.querySelector('.history-dialog-close').focus();
      });
    }
    let start = null;
    photo.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      start = { x: event.clientX, y: event.clientY, id: event.pointerId };
      photo.setPointerCapture(event.pointerId);
    });
    photo.addEventListener('pointerup', event => {
      if (!start || start.id !== event.pointerId) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      start = null;
      if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.5) showPhoto(current + (dx < 0 ? 1 : -1) * direction());
    });
    photo.addEventListener('pointercancel', () => { start = null; });
    photo.addEventListener('lostpointercapture', () => { start = null; });
  });
  dialog?.querySelector('.history-dialog-close').addEventListener('click', () => dialog.close());
  dialog?.addEventListener('close', () => opener?.focus({ preventScroll: true }));
  dialog?.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
}
