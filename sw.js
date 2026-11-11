/* Service worker: keeps the whole book on the device so it can be read offline.
   Bump VERSION whenever any file changes so devices pick up the new copy. */
const VERSION = 'serenity-v4';
const FONT_CACHE = 'serenity-fonts';
const DEV = ['localhost', '127.0.0.1'].includes(self.location.hostname);
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Andika:wght@400;700&family=Fredoka:wght@500;600;700&display=swap';

const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/book.css',
  'js/util.js',
  'js/audio.js',
  'js/narrator.js',
  'js/art/parts.js',
  'js/art/parts2.js',
  'js/art/scenes.js',
  'js/art/scenes2.js',
  'js/story.js',
  'js/engine.js',
  'js/offline.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(FILES.map(f => new Request(f, { cache: 'reload' })));
    // fonts are a bonus: if they can't be fetched the book falls back to system fonts
    try {
      const fonts = await caches.open(FONT_CACHE);
      const res = await fetch(FONT_CSS, { mode: 'cors' });
      if (res.ok) {
        const css = await res.clone().text();
        await fonts.put(FONT_CSS, res);
        const urls = [...css.matchAll(/url\((https:[^)]+)\)/g)].map(m => m[1]);
        await Promise.all(urls.map(u => fetch(u, { mode: 'cors' }).then(r => r.ok && fonts.put(u, r)).catch(() => {})));
      }
    } catch (e) { /* offline during install: fonts get cached on next online visit */ }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION && k !== FONT_CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Fonts: serve from cache, refresh in the background when online
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith((async () => {
      const cache = await caches.open(FONT_CACHE);
      const hit = await cache.match(req);
      const fresh = fetch(req).then(r => { if (r.ok) cache.put(req, r.clone()); return r; }).catch(() => null);
      return hit || (await fresh) || new Response('', { status: 504 });
    })());
    return;
  }

  if (url.origin !== self.location.origin) return;

  // The book itself: cache first (works offline), page navigations fall back to index.html.
  // On localhost (development) use network first so edits show up immediately.
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    if (DEV) {
      try { const res = await fetch(req, { cache: 'no-store' }); if (res.ok) cache.put(req, res.clone()); return res; }
      catch (e) { const hit = await cache.match(req, { ignoreSearch: true }); if (hit) return hit; if (req.mode === 'navigate') return cache.match('index.html'); throw e; }
    }
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    } catch (e) {
      if (req.mode === 'navigate') return cache.match('index.html');
      throw e;
    }
  })());
});

self.addEventListener('message', event => {
  if (event.data === 'status') {
    caches.open(VERSION).then(c => c.keys()).then(keys => {
      event.source.postMessage({ type: 'status', cached: keys.length, total: FILES.length, version: VERSION });
    });
  }
});
