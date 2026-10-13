// Self-contained so both Playwright and native Safari can inspect rendered controls.
export function inspectButtonAppearance(reference) {
  const properties = ['backgroundColor', 'color', 'fontFamily', 'fontSize',
    'fontWeight', 'lineHeight', 'borderRadius', 'borderWidth', 'minHeight',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'textAlign',
    'textDecorationLine', 'transform', 'transitionDuration', 'animationName'];
  const appearance = element => {
    const styles = getComputedStyle(element);
    return Object.fromEntries(properties.map(property => [property, styles[property]]));
  };
  const prototype = document.querySelector('.pill-button');
  const standard = reference || (prototype && appearance(prototype));
  if (!standard) throw new Error('The Get involved button reference is required.');
  const selectors = 'button:not(.photo-open, .carousel-thumb, .gallery-thumbnail), summary, '
    + '.button, .pill-button, .service-button, .explore-topic, .back-top, .text-link, '
    + '.quiz-link, .story-link, .translation-link, .facts-jumps a, .facts-back, '
    + '.service-links a, .group-documents-list a';
  const controls = [...document.querySelectorAll(selectors)].filter(element =>
    element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden'
    && !element.matches(':disabled, :hover, :focus-visible, :active'));
  const issues = [];
  for (const element of controls) {
    const actual = appearance(element);
    const differences = properties.filter(property => actual[property] !== standard[property]);
    if (differences.length) issues.push({
      label: element.getAttribute('aria-label') || element.textContent.trim().slice(0, 90),
      differences: Object.fromEntries(differences.map(property => [property, {
        expected: standard[property], actual: actual[property],
      }])),
    });
  }
  return { standard, checked: controls.length, issues };
}
