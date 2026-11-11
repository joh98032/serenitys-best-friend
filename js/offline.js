/* Offline support: registers the service worker, reports whether the book is saved,
   and offers "Save to this device" (install) where the browser allows it. */
(function () {
  const $ = s => document.querySelector(s);
  const status = $('#offline-status'), btn = $('#btn-install'), btnStart = $('#btn-install-start'), hint = $('#install-hint');
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const installed = () => matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches || navigator.standalone === true;
  const setStatus = (text, ok) => { status.textContent = text; status.classList.toggle('ok', !!ok); };

  if (location.protocol === 'file:') { setStatus('Open the book from its web address to save it for offline reading.'); return; }
  if (!('serviceWorker' in navigator)) { setStatus('This browser can’t save the book for offline reading.'); return; }

  navigator.serviceWorker.register('sw.js').catch(err => setStatus('Couldn’t save for offline reading (' + err.message + ').'));

  const ask = () => navigator.serviceWorker.controller && navigator.serviceWorker.controller.postMessage('status');
  navigator.serviceWorker.addEventListener('message', e => {
    if (!e.data || e.data.type !== 'status') return;
    if (e.data.cached >= e.data.total) setStatus('✓ Saved on this device — it works without internet.' + (navigator.onLine ? '' : ' (You’re offline now: using the device’s built-in voice.)'), true);
    else { setStatus('Saving… ' + e.data.cached + ' of ' + e.data.total + ' files'); setTimeout(ask, 800); }
  });
  navigator.serviceWorker.addEventListener('controllerchange', ask);
  navigator.serviceWorker.ready.then(() => setTimeout(ask, 300));
  addEventListener('online', ask); addEventListener('offline', ask);
  $('#btn-settings').addEventListener('click', ask);

  /* install button (Chrome, Edge, Android) */
  let deferred = null;
  const showInstall = on => { btn.hidden = !on; btnStart.hidden = !on; };
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; if (!installed()) showInstall(true); });
  const doInstall = () => {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.finally(() => { deferred = null; showInstall(false); });
  };
  btn.onclick = doInstall; btnStart.onclick = doInstall;
  addEventListener('appinstalled', () => { showInstall(false); hint.hidden = false; hint.textContent = 'Added! Open “Serenity” from your home screen or apps.'; });

  /* iPhone / iPad have no install button: explain the Share menu instead */
  if (isIOS && !installed()) { hint.hidden = false; hint.textContent = 'On iPhone or iPad: tap the Share button, then “Add to Home Screen”.'; }
})();
