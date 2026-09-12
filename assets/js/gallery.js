const gallery = document.querySelector('.photo-gallery');

if (gallery) {
  const slides = [...gallery.querySelectorAll('.gallery-slide')];
  const thumbnails = [...gallery.querySelectorAll('.gallery-thumbnail')];
  const rail = gallery.querySelector('.gallery-thumbnails');
  const navigation = gallery.querySelector('.gallery-navigation');
  const counter = gallery.querySelector('[data-gallery-count]');
  const announcement = gallery.querySelector('[data-gallery-announcement]');
  let current = 0;

  const showPhoto = (index, announce = true) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    thumbnails.forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
    // Load the selected image promptly, even when it was initially outside the viewport.
    slides[current].querySelector('.gallery-main-photo').loading = 'eager';
    counter.textContent = `${current + 1} of ${slides.length}`;
    announcement.textContent = announce ? `: ${slides[current].querySelector('h2').textContent}` : '';
    const selected = thumbnails[current];
    const item = selected.getBoundingClientRect();
    const viewport = rail.getBoundingClientRect();
    if (item.left < viewport.left || item.right > viewport.right) {
      rail.scrollBy({ left: item.left - viewport.left - (viewport.width - item.width) / 2, behavior: 'instant' });
    }
  };

  // With JavaScript unavailable, the HTML remains a readable six-photo gallery.
  gallery.classList.add('is-ready');
  navigation.hidden = false;
  rail.hidden = false;
  showPhoto(0, false);

  gallery.querySelectorAll('[data-gallery-step]').forEach(button => {
    button.addEventListener('click', () => showPhoto(current + Number(button.dataset.galleryStep)));
  });
  thumbnails.forEach((button, index) => button.addEventListener('click', () => showPhoto(index)));
  gallery.addEventListener('keydown', event => {
    if (!event.target.closest('button') || event.altKey || event.ctrlKey || event.metaKey) return;
    const destinations = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: slides.length - 1 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    showPhoto(destinations[event.key]);
    if (rail.contains(event.target)) thumbnails[current].focus({ preventScroll: true });
  });

  slides.forEach(slide => {
    const photo = slide.querySelector('.gallery-main-photo');
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
      if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.5) showPhoto(current + (dx < 0 ? 1 : -1));
    });
    photo.addEventListener('pointercancel', () => { start = null; });
    photo.addEventListener('lostpointercapture', () => { start = null; });
  });
}
