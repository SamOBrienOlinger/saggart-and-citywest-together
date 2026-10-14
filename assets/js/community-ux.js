/* Optional conveniences only: email, links and the complete directory work without JS. */
const copyButton = document.querySelector('[data-copy-email]');
const emailLink = document.querySelector('#community-email');
const copySuccess = document.querySelector('[data-copy-success]');
const copyFailure = document.querySelector('[data-copy-failure]');

if (copyButton && emailLink && copySuccess && copyFailure) {
  copyButton.hidden = false;
  copyButton.addEventListener('click', async () => {
    const hadFocus = document.activeElement === copyButton;
    copySuccess.hidden = true;
    copyFailure.hidden = true;
    copyButton.disabled = true;
    try {
      if (!window.isSecureContext || typeof navigator.clipboard?.writeText !== 'function') {
        throw new Error('Clipboard writing is unavailable');
      }
      // Run directly in the click handler so browsers retain user activation.
      await navigator.clipboard.writeText(emailLink.textContent.trim());
      copySuccess.hidden = false;
    } catch {
      // Never claim success after a denied permission. Leave a usable manual fallback.
      copyFailure.hidden = false;
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(emailLink);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } finally {
      copyButton.disabled = false;
      // Disabling a focused control can move focus to the body in some browsers.
      // Restore it only when the visitor has not moved to a different control.
      if (hadFocus && document.activeElement === document.body) {
        copyButton.focus({ preventScroll: true });
      }
    }
  });
}

const filter = document.querySelector('[data-support-filter]');
const category = document.querySelector('#support-category');
const reset = document.querySelector('[data-reset-supports]');
const count = document.querySelector('[data-support-count]');
const rows = [...document.querySelectorAll('[data-support-category]')];

if (filter && category && reset && count && rows.length) {
  const applyFilter = () => {
    let visible = 0;
    rows.forEach(row => {
      row.hidden = category.value !== 'all' && row.dataset.supportCategory !== category.value;
      if (!row.hidden) visible += 1;
    });
    count.textContent = String(visible);
    reset.hidden = category.value === 'all';
  };
  const revealLinkedSupport = () => {
    let id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    const row = target?.closest('[data-support-category]');
    if (!row) return;
    category.value = 'all';
    applyFilter();
    // An anchor must remain discoverable even after a visitor has used the filter.
    requestAnimationFrame(() => row.scrollIntoView({ block: 'start', behavior: 'auto' }));
  };
  category.addEventListener('change', applyFilter);
  reset.addEventListener('click', () => {
    category.value = 'all';
    applyFilter();
    // The reset control is now hidden; keep keyboard focus on a visible control.
    category.focus();
  });
  window.addEventListener('hashchange', revealLinkedSupport);
  window.addEventListener('pageshow', () => { applyFilter(); revealLinkedSupport(); });
  filter.hidden = false;
  applyFilter();
  revealLinkedSupport();
}
