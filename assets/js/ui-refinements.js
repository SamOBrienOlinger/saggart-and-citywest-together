/** Optional enhancements; email, service links and all reading content remain native HTML. */
export function initialiseUIRefinements() {
  const copy = document.querySelector('#copy-email');
  const address = document.querySelector('#contact-email');
  const status = document.querySelector('#copy-email-status');
  if (copy && address && status) {
    copy.hidden = false;
    let busy = false;
    let announcement;
    const announce = id => {
      // Read translated messages from the page; never replace them with hard-coded English.
      const message = document.getElementById(id)?.textContent.trim() || '';
      cancelAnimationFrame(announcement);
      status.textContent = '';
      announcement = requestAnimationFrame(() => { status.textContent = message; });
    };
    copy.addEventListener('click', async () => {
      if (busy) return;
      busy = true;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(address.textContent.trim());
        announce('copy-email-success');
      } catch {
        // Clipboard permissions can be denied. Select the visible, unmodified address,
        // explain the manual route, and do not falsely announce a successful copy.
        try {
          const selection = window.getSelection();
          if (!selection) throw new Error('Selection unavailable');
          const range = document.createRange();
          range.selectNodeContents(address);
          selection.removeAllRanges();
          selection.addRange(range);
          announce('copy-email-fallback');
        } catch { announce('copy-email-error'); }
      } finally { busy = false; }
    });
  }
  const cta = document.querySelector('.community-actions > a.pill-button');
  if (!cta) return;
  cta.setAttribute('data-press-ready', '');
  const reset = () => cta.removeAttribute('data-pressed');
  cta.addEventListener('pointerdown', event => {
    if (event.button === 0 && event.isPrimary) cta.setAttribute('data-pressed', '');
  });
  cta.addEventListener('pointerleave', reset);
  cta.addEventListener('blur', reset);
  cta.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.repeat) cta.setAttribute('data-pressed', '');
  });
  for (const type of ['pointerup', 'pointercancel', 'keyup', 'blur', 'pageshow']) {
    window.addEventListener(type, reset);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
}
