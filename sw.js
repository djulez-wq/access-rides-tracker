const CACHE_NAME = 'access-rides-app-v2';

const APP_FILES = [
  './app.html',
  './manifest.json',
  './assets/logo.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key =>
          key.startsWith('access-rides-app-') &&
          key !== CACHE_NAME
        ).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const allowed = APP_FILES.find(path => {
    const target = new URL(path, self.registration.scope);
    return target.origin === url.origin &&
           target.pathname === url.pathname;
  });

  if (!allowed) return;

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.open(CACHE_NAME).then(cache =>
        cache.match(new URL(allowed, self.registration.scope).href)
      )
    )
  );
});
