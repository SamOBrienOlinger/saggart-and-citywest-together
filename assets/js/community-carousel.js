// Native horizontal scrolling provides touch swiping and a no-JavaScript fallback.
const carousel = document.querySelector('.community-carousel');
if (carousel) {
  const viewport = carousel.querySelector('.carousel-viewport');
  const slides = [...carousel.querySelectorAll('.community-slide')];
  const thumbs = [...carousel.querySelectorAll('[data-slide]')];
  const thumbnailRail = carousel.querySelector('.carousel-thumbnails');
  const count = carousel.querySelector('[data-current]');
  const caption = carousel.querySelector('.carousel-caption');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dialog = document.querySelector('.image-dialog');
  let current = 0;
  let scrollFrame;
  let opener;

  const update = index => {
    current = Math.max(0, Math.min(slides.length - 1, index));
    count.textContent = String(current + 1);
    caption.textContent = slides[current].dataset.caption;
    slides.forEach((slide, i) => {
      slide.setAttribute('aria-hidden', String(i !== current));
      slide.inert = i !== current;
      slide.querySelector('button').tabIndex = i === current ? 0 : -1;
    });
    thumbs.forEach((thumb, i) => {
      if (i === current) thumb.setAttribute('aria-current', 'true');
      else thumb.removeAttribute('aria-current');
      thumb.tabIndex = i === current ? 0 : -1;
    });
    const railBox = thumbnailRail.getBoundingClientRect();
    const thumbBox = thumbs[current].getBoundingClientRect();
    if (thumbBox.left < railBox.left || thumbBox.right > railBox.right) {
      thumbnailRail.scrollBy({left: thumbBox.left - railBox.left, behavior: motion.matches ? 'auto' : 'smooth'});
    }
  };
  const goTo = (index, smooth = true) => {
    const next = (index + slides.length) % slides.length;
    const direction = getComputedStyle(viewport).direction === 'rtl' ? -1 : 1;
    viewport.scrollTo({left: next * viewport.clientWidth * direction, behavior: smooth && !motion.matches ? 'smooth' : 'auto'});
    if (!smooth || motion.matches) update(next);
  };
  carousel.querySelector('[data-previous]').addEventListener('click', () => goTo(current - 1));
  carousel.querySelector('[data-next]').addEventListener('click', () => goTo(current + 1));
  thumbs.forEach((thumb, index) => thumb.addEventListener('click', () => { goTo(index, false); thumb.focus({preventScroll: true}); }));
  carousel.addEventListener('keydown', event => {
    const rtl = getComputedStyle(viewport).direction === 'rtl';
    let next;
    if (event.key === 'ArrowRight') next = current + (rtl ? -1 : 1);
    if (event.key === 'ArrowLeft') next = current + (rtl ? 1 : -1);
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = slides.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    const index = (next + slides.length) % slides.length;
    goTo(index, false);
    if (event.target.closest('.carousel-thumb')) thumbs[index].focus({preventScroll: true});
  });
  viewport.addEventListener('scroll', () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => update(Math.round(Math.abs(viewport.scrollLeft) / viewport.clientWidth)));
  }, {passive: true});
  let lastWidth = viewport.clientWidth;
  if ('ResizeObserver' in window) new ResizeObserver(() => {
    if (viewport.clientWidth !== lastWidth) {
      lastWidth = viewport.clientWidth;
      goTo(current, false);
    }
  }).observe(viewport);

  if (dialog && typeof dialog.showModal === 'function') {
    carousel.querySelectorAll('[data-image-index]').forEach(button => button.addEventListener('click', () => {
      const slide = slides[Number(button.dataset.imageIndex)];
      const photo = slide.querySelector('img');
      const fullImage = dialog.querySelector('.dialog-image');
      fullImage.src = photo.currentSrc || photo.src;
      fullImage.alt = photo.alt;
      dialog.querySelector('#image-dialog-title').textContent = slide.dataset.caption;
      dialog.querySelector('.dialog-caption').textContent = photo.alt;
      opener = button;
      dialog.showModal();
    }));
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) {
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    }});
    dialog.addEventListener('close', () => opener?.focus({preventScroll: true}));
  }
  carousel.querySelector('.carousel-controls').hidden = false;
  thumbnailRail.hidden = false;
  update(0);
}
