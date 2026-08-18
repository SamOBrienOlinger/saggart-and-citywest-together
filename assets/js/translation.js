export const translationLanguages = Object.freeze([
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', direction: 'rtl' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', direction: 'ltr' },
  { code: 'nl', label: 'Dutch', nativeLabel: 'Nederlands', direction: 'ltr' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', direction: 'ltr' },
  { code: 'it', label: 'Italian', nativeLabel: 'Italiano', direction: 'ltr' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', direction: 'ltr' }
]);

const storageKey = 'sctLanguage';
const callbackName = 'sctGoogleTranslateInit';
const widgetId = 'google-translate-element';
const scriptId = 'google-translate-script';

const readLanguage = () => {
  try {
    const saved = localStorage.getItem(storageKey);
    return translationLanguages.some(language => language.code === saved) ? saved : 'en';
  } catch {
    return 'en';
  }
};

const saveLanguage = language => {
  try {
    localStorage.setItem(storageKey, language);
  } catch {}
};

const applyDocumentLanguage = language => {
  const selected = translationLanguages.find(item => item.code === language);
  document.documentElement.lang = selected?.code || 'en';
  document.documentElement.dir = selected?.direction || 'ltr';
};

const clearTranslationCookie = () => {
  const expired = 'googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  document.cookie = expired;
  document.cookie = `${expired};domain=.${location.hostname}`;
};

export const initialiseTranslationControl = menu => {
  if (!menu || menu.querySelector('.translate-menu')) return;

  const savedLanguage = readLanguage();
  const item = document.createElement('li');
  item.className = 'translate-menu notranslate';
  item.setAttribute('translate', 'no');

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'translate-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'translation-panel');
  toggle.setAttribute('aria-haspopup', 'true');
  toggle.textContent = 'Translate';

  const panel = document.createElement('div');
  panel.id = 'translation-panel';
  panel.className = 'translation-panel';
  panel.hidden = true;

  const heading = document.createElement('p');
  heading.className = 'translation-heading';
  heading.textContent = 'Translate this page';

  const languages = document.createElement('p');
  languages.className = 'translation-languages';
  languages.textContent = translationLanguages.map(language => language.nativeLabel).join(' · ');

  const status = document.createElement('p');
  status.className = 'translation-status';
  status.setAttribute('role', 'status');
  status.textContent = 'Choose a language to load machine translation.';

  const widget = document.createElement('div');
  widget.id = widgetId;

  const original = document.createElement('button');
  original.type = 'button';
  original.className = 'translation-original';
  original.textContent = 'Show original English';
  original.hidden = savedLanguage === 'en';

  const note = document.createElement('p');
  note.className = 'translation-note';
  note.textContent = 'Machine translation by Google may contain errors.';

  panel.append(heading, languages, status, widget, original, note);
  item.append(toggle, panel);
  menu.append(item);

  const closePanel = returnFocus => {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) toggle.focus();
  };

  const configureSelect = (attempt = 0) => {
    const select = widget.querySelector('.goog-te-combo');
    if (!select && attempt < 40) {
      window.setTimeout(() => configureSelect(attempt + 1), 100);
      return;
    }
    if (!select) {
      status.textContent = 'Translation options could not be loaded. Please try again later.';
      return;
    }
    select.setAttribute('aria-label', 'Choose translation language');
    status.hidden = true;
    select.addEventListener('change', () => {
      const language = select.value;
      if (!translationLanguages.some(item => item.code === language)) return;
      saveLanguage(language);
      applyDocumentLanguage(language);
      original.hidden = false;
    });
    if (savedLanguage !== 'en' && select.value !== savedLanguage) {
      select.value = savedLanguage;
      select.dispatchEvent(new Event('change'));
    }
  };

  const initialiseWidget = () => {
    const TranslateElement = window.google?.translate?.TranslateElement;
    if (!TranslateElement) {
      status.textContent = 'Translation options could not be loaded. Please try again later.';
      return;
    }
    const options = {
      pageLanguage: 'en',
      includedLanguages: translationLanguages.map(language => language.code).join(','),
      autoDisplay: false
    };
    if (TranslateElement.InlineLayout?.SIMPLE) options.layout = TranslateElement.InlineLayout.SIMPLE;
    new TranslateElement(options, widgetId);
    configureSelect();
  };

  const loadWidget = () => {
    if (window.google?.translate?.TranslateElement) {
      initialiseWidget();
      return;
    }
    if (document.getElementById(scriptId)) return;
    status.hidden = false;
    status.textContent = 'Loading translation options…';
    window[callbackName] = initialiseWidget;
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://translate.google.com/translate_a/element.js?cb=${callbackName}`;
    script.async = true;
    script.onerror = () => {
      status.textContent = 'Translation options could not be loaded. Please try again later.';
    };
    document.head.append(script);
  };

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) loadWidget();
  });

  original.addEventListener('click', () => {
    saveLanguage('en');
    clearTranslationCookie();
    applyDocumentLanguage('en');
    location.reload();
  });

  document.addEventListener('click', event => {
    if (!panel.hidden && !item.contains(event.target)) closePanel(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) closePanel(true);
  });

  if (savedLanguage !== 'en') {
    applyDocumentLanguage(savedLanguage);
    loadWidget();
  }
};
