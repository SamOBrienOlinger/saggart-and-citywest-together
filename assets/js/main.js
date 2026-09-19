import{initialiseTranslationControl}from'./translation.js?v=plain-20260920';
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('#site-menu');
const header = document.querySelector('.site-header');
const toggleLabel = toggle?.querySelector('[aria-hidden="true"]');
const compactNavigation = window.matchMedia('(max-width: 70rem)');

const updateMenuHeight = () => {
  if (!header) return;
  const viewport = window.visualViewport;
  const bottom = viewport ? viewport.height + viewport.offsetTop : window.innerHeight;
  header.style.setProperty('--menu-max-height', `${Math.max(0, bottom - header.getBoundingClientRect().bottom)}px`);
};
const setMenuState = open => {
  if (!toggle || !menu) return;
  toggle.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('open', open);
  if (toggleLabel) toggleLabel.textContent = open ? '×' : '☰';
  if (!open) menu.dispatchEvent(new Event('navigationclose'));
  updateMenuHeight();
};
if (toggle && menu) {
  setMenuState(false);
  header.classList.add('nav-ready');
  toggle.addEventListener('click', () => setMenuState(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', event => {
    if (event.target.closest('a') && !event.target.closest('.translation-panel')) setMenuState(false);
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) setMenuState(false);
  });
  header.addEventListener('focusout', event => {
    // WebKit may blur a focused control without focusing the tapped link.
    // Keep the link visible until its click fires; outside clicks close it above.
    if (event.relatedTarget && !header.contains(event.relatedTarget)) setMenuState(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !event.defaultPrevented && toggle.getAttribute('aria-expanded') === 'true') {
      event.preventDefault();
      setMenuState(false);
      toggle.focus();
    }
  });
  const resetNavigation = () => {
    const focusInMenu = menu.contains(document.activeElement);
    const focusOnToggle = document.activeElement === toggle;
    setMenuState(false);
    if (compactNavigation.matches && focusInMenu) toggle.focus();
    else if (!compactNavigation.matches && focusOnToggle) menu.querySelector('a')?.focus();
  };
  if (compactNavigation.addEventListener) compactNavigation.addEventListener('change', resetNavigation);
  else compactNavigation.addListener(resetNavigation);
  window.addEventListener('resize', updateMenuHeight);
  window.visualViewport?.addEventListener('resize', updateMenuHeight);
  window.visualViewport?.addEventListener('scroll', updateMenuHeight);
  if ('ResizeObserver' in window) new ResizeObserver(updateMenuHeight).observe(header);
}
const page=document.body.dataset.page;
const current=document.querySelector(`[data-nav="${page}"]`);if(current)current.setAttribute('aria-current','page');
document.querySelectorAll('a[target="_blank"]').forEach(link=>{link.rel='noopener noreferrer'});


initialiseTranslationControl(menu);
