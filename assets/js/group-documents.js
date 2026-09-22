// Native details/summary keeps the links usable without JavaScript.
const documents = document.querySelector('#group-documents');
if (documents) {
  const toggle = documents.querySelector('summary');
  documents.addEventListener('keydown', event => {
    if (event.key === 'Escape' && documents.open) {
      event.preventDefault();
      event.stopPropagation();
      documents.open = false;
      toggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (documents.open && !documents.contains(event.target)) documents.open = false;
  });
  documents.addEventListener('focusout', event => {
    // Safari can temporarily clear focus before following a tapped link.
    if (event.relatedTarget && !documents.contains(event.relatedTarget)) documents.open = false;
  });
}
