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
    + '.group-documents-list a, .nav-list a[href], .site-footer a:not(:has(img))';
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
  // Local service links deliberately retain the illustrated reference design.
  // Guard against the shared button rules shrinking or whitening their icons again.
  const serviceLinks = [...document.querySelectorAll('#local-services .service-links a')]
    .filter(element => element.getClientRects().length
      && !element.matches(':hover, :focus-visible, :active'));
  const iconColours = new Set();
  for (const link of serviceLinks) {
    const icon = link.querySelector('.service-icon');
    const iconStyle = icon && getComputedStyle(icon);
    const linkStyle = getComputedStyle(link);
    if (!iconStyle || parseFloat(iconStyle.width) < 40 || parseFloat(iconStyle.height) < 40
      || iconStyle.color === 'rgb(255, 255, 255)' || iconStyle.filter !== 'none'
      || linkStyle.borderRadius !== '0px') {
      issues.push({ label: link.textContent.trim(), issue: 'Local service icon or illustrated link styling was lost.' });
    }
    if (iconStyle) iconColours.add(iconStyle.color);
  }
  if (serviceLinks.length === 3 && iconColours.size !== 3) {
    issues.push({ issue: 'Local services must retain the teal, coral and gold icon colours.' });
  }
  return { standard, checked: controls.length + serviceLinks.length, issues };
}
