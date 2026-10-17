(function () {
  'use strict';
  const key = 'bright-steps-recovery-shown-v1';
  let shown = false, armed = false;
  try { shown = sessionStorage.getItem(key) === '1'; } catch (_) {}
  if (shown) return;
  const token = String(Date.now());
  const started = Date.now();
  const originalState = history.state && typeof history.state === 'object' ? history.state : {};
  function showOffer() {
    if (shown) return;
    shown = true;
    try { sessionStorage.setItem(key, '1'); } catch (_) {}
    const destination = new URL('special-offer.html', location.href);
    destination.search = location.search;
    location.replace(destination.href);
  }
  function arm() {
    if (armed || shown) return;
    armed = true;
    try {
      history.replaceState(Object.assign({}, originalState, {bsRecoveryBase: token}), '', location.href);
      history.pushState(Object.assign({}, originalState, {bsRecoveryGuard: token}), '', location.href);
    } catch (_) {}
  }
  ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach(type =>
    window.addEventListener(type, arm, {once: true, passive: true}));
  window.addEventListener('popstate', event => {
    if (armed && event.state && event.state.bsRecoveryBase === token) showOffer();
  });
  document.addEventListener('mouseout', event => {
    if (armed && !event.relatedTarget && event.clientY <= 0 &&
        Date.now() - started > 8000 && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      showOffer();
    }
  });
})();
