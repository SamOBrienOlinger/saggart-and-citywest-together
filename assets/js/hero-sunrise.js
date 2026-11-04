// Play once after the artwork is ready; retain the original illustration as a fallback.
const scene = document.querySelector('.home-hero-art[data-sunrise-state]');
const overlay = scene?.querySelector('.hero-sunrise-overlay');

if (scene && overlay) {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let settled = false;
  let timer;

  const finish = (state = 'complete') => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    overlay.setAttribute('hidden', '');
    scene.classList.remove('sunrise-running');
    scene.dataset.sunriseState = state;
    motion.removeEventListener('change', preferenceChanged);
    document.removeEventListener('visibilitychange', startWhenVisible);
  };
  const preferenceChanged = () => { if (motion.matches) finish('skipped'); };
  const startWhenVisible = () => {
    if (settled || document.hidden) return;
    document.removeEventListener('visibilitychange', startWhenVisible);
    if (motion.matches) return finish('skipped');
    overlay.removeAttribute('hidden');
    scene.classList.add('sunrise-running');
    scene.dataset.sunriseState = 'running';
    // Restore the still image even if a browser suppresses animation events.
    timer = setTimeout(() => finish(), 5500);
  };
  const decode = async src => {
    const image = new Image();
    image.src = src;
    await image.decode();
  };

  overlay.addEventListener('animationend', event => {
    if (event.target === overlay && event.animationName === 'hero-sky-settle') finish();
  });
  window.addEventListener('pagehide', () => finish('skipped'), { once: true });
  motion.addEventListener('change', preferenceChanged);

  if (motion.matches) finish('skipped');
  else {
    const sources = [scene.querySelector('.home-hero-still').src,
      ...[...overlay.querySelectorAll('image')].map(image => image.getAttribute('href'))];
    Promise.all(sources.map(decode)).then(() => {
      if (settled) return;
      if (document.hidden) document.addEventListener('visibilitychange', startWhenVisible);
      else startWhenVisible();
    }).catch(() => finish('skipped'));
  }
}
