// TG Pics service worker: caches ONLY the app shell. Telegram data and pictures are never cached.
const CACHE = 'tgpics-v2';
const SHELL = ['./', 'index.html', 'styles.css?v=2', 'app.js?v=2', 'tg.js?v=2', 'manifest.webmanifest?v=2', 'icon-192.png?v=2', 'icon-512.png?v=2', 'apple-touch-icon.png?v=2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  const path = u.pathname.replace(/^.*\//, '') + u.search;
  const isShell = e.request.mode === 'navigate' || SHELL.includes(path) || SHELL.includes(u.pathname.replace(/^.*\//, ''));
  if (!isShell) return;
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request.mode === 'navigate' ? 'index.html' : e.request, cp)); } return r; })
    .catch(() => caches.match(e.request.mode === 'navigate' ? 'index.html' : e.request).then(r => r || caches.match('./'))));
});
