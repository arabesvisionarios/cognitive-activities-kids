(function () {
  'use strict';
  const key = 'bright-steps-recovery-shown-v1';
  let shown = false, armed = false;
  try { shown = sessionStorage.getItem(key) === '1'; } catch (_) {}
  if (shown) return;
  const token = String(Date.now());
  let exitTimer = null;
  function cancelExit() {
    clearTimeout(exitTimer);
    exitTimer = null;
  }
  const originalState = history.state && typeof history.state === 'object' ? history.state : {};
  function showOffer() {
    if (shown) return;
    cancelExit();
    shown = true;
    try { sessionStorage.setItem(key, '1'); } catch (_) {}
    const destination = new URL('special-offer.html', location.href);
    destination.search = location.search;
    location.replace(destination.href);
  }
  function arm() {
    if (armed || shown) return;
    try {
      history.replaceState(Object.assign({}, originalState, {bsRecoveryBase: token}), '', location.href);
      history.pushState(Object.assign({}, originalState, {bsRecoveryGuard: token}), '', location.href);
      armed = true;
    } catch (_) {}
  }
  arm();
  ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach(type =>
    window.addEventListener(type, arm, {once: true, passive: true}));
  window.addEventListener('popstate', event => {
    if (armed && event.state && event.state.bsRecoveryBase === token) showOffer();
  });
  document.addEventListener('mouseout', event => {
    if (!shown && !event.relatedTarget && event.clientY <= 0 &&
        matchMedia('(hover: hover) and (pointer: fine)').matches) {
      cancelExit();
      exitTimer = setTimeout(showOffer, 1000);
    }
  });
  document.addEventListener('mouseover', cancelExit);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelExit();
  });
})();
