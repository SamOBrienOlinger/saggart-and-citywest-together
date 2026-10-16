// Decorative only: this module never changes answers, scores or stored results.
const celebration = Object.freeze({
  name: 'celebration', count: 84, minDuration: 2600, maxDuration: 4000,
  maxDelay: 600, drift: 90, minSpin: 360, maxSpin: 900,
});
const gentle = Object.freeze({
  name: 'gentle', count: 6, minDuration: 12000, maxDuration: 16000,
  maxDelay: 900, drift: 22, minSpin: 30, maxSpin: 90,
});
const colours = ['#e8c36e', '#e45c2f', '#42b9ae', '#85cbd2', '#bd91c8'];

export function getConfettiProfile(score, total = 10) {
  if (!Number.isInteger(score) || !Number.isInteger(total) || total <= 0 || score < 0 || score > total) return null;
  if (score / total >= 0.7) return celebration;
  if (score / total < 0.4) return gentle;
  // Keep the existing result display for 4–6/10; no effect was requested there.
  return null;
}

export function createQuizConfetti({ stopButton, focusTarget, documentRef = document, windowRef = window } = {}) {
  const motion = windowRef.matchMedia?.('(prefers-reduced-motion: reduce)');
  let layer = null;
  let timer = null;

  function stop() {
    if (timer !== null) windowRef.clearTimeout(timer);
    timer = null;
    layer?.remove();
    layer = null;
    // Do not leave keyboard focus on a control that is about to be hidden.
    if (documentRef.activeElement === stopButton && !documentRef.hidden && focusTarget?.getClientRects().length) {
      focusTarget.focus({ preventScroll: true });
    }
    if (stopButton) stopButton.hidden = true;
    stopButton?.removeEventListener('click', stop);
    windowRef.removeEventListener('pagehide', stop);
    documentRef.removeEventListener('visibilitychange', onVisibilityChange);
    if (motion?.removeEventListener) motion.removeEventListener('change', onMotionChange);
    else motion?.removeListener?.(onMotionChange);
  }

  function onVisibilityChange() { if (documentRef.hidden) stop(); }
  function onMotionChange(event) { if (event.matches) stop(); }

  function play(score, total = 10) {
    stop();
    const profile = getConfettiProfile(score, total);
    if (!profile || motion?.matches || documentRef.hidden) return false;
    layer = documentRef.createElement('div');
    layer.className = 'quiz-confetti';
    layer.dataset.confettiMode = profile.name;
    layer.setAttribute('aria-hidden', 'true');
    layer.setAttribute('inert', '');
    const pieces = documentRef.createDocumentFragment();
    let lastFinish = 0;
    for (let index = 0; index < profile.count; index++) {
      const piece = documentRef.createElement('span');
      piece.className = 'quiz-confetti-piece';
      const duration = profile.minDuration + Math.random() * (profile.maxDuration - profile.minDuration);
      const delay = Math.random() * profile.maxDelay;
      const spin = (profile.minSpin + Math.random() * (profile.maxSpin - profile.minSpin)) * (index % 2 ? 1 : -1);
      // Even distribution keeps a small handful visible on narrow screens too.
      piece.style.left = `${(index + 0.2 + Math.random() * 0.6) / profile.count * 100}%`;
      piece.style.setProperty('--confetti-colour', colours[index % colours.length]);
      piece.style.setProperty('--confetti-size', `${0.35 + Math.random() * 0.3}rem`);
      piece.style.setProperty('--confetti-duration', `${duration}ms`);
      piece.style.setProperty('--confetti-delay', `${delay}ms`);
      piece.style.setProperty('--confetti-drift', `${(Math.random() - 0.5) * profile.drift}px`);
      piece.style.setProperty('--confetti-spin', `${spin}deg`);
      pieces.append(piece);
      lastFinish = Math.max(lastFinish, duration + delay);
    }
    layer.append(pieces);
    documentRef.body.append(layer);
    if (stopButton) stopButton.hidden = false;
    stopButton?.addEventListener('click', stop);
    windowRef.addEventListener('pagehide', stop);
    documentRef.addEventListener('visibilitychange', onVisibilityChange);
    if (motion?.addEventListener) motion.addEventListener('change', onMotionChange);
    else motion?.addListener?.(onMotionChange);
    timer = windowRef.setTimeout(stop, Math.ceil(lastFinish) + 100);
    return true;
  }

  return { play, stop };
}
