// Service Worker for BD ESPORTS MS PWA / Android App
const CACHE_NAME = 'bd-esports-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/app_icon.jpg',
  '/app_icon.png',
  '/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Don't intercept dynamic backend API routes to avoid caching stale admin numbers
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    // Fast network with 3s timeout, falling back immediately to cache
    new Promise((resolve) => {
      let isResolved = false;
      const timeoutId = setTimeout(async () => {
        if (!isResolved) {
          isResolved = true;
          const cached = await caches.match(event.request);
          if (cached) {
            resolve(cached);
          } else if (event.request.mode === 'navigate') {
            const fallback = (await caches.match('/index.html')) || (await caches.match('/'));
            if (fallback) resolve(fallback);
          }
        }
      }, 2500);

      fetch(event.request)
        .then((networkResponse) => {
          clearTimeout(timeoutId);
          if (!isResolved) {
            isResolved = true;
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone).catch(() => {});
              });
            }
            resolve(networkResponse);
          }
        })
        .catch(async () => {
          clearTimeout(timeoutId);
          if (!isResolved) {
            isResolved = true;
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) {
              resolve(cachedResponse);
            } else if (event.request.mode === 'navigate') {
              const fallback = (await caches.match('/index.html')) || (await caches.match('/'));
              if (fallback) resolve(fallback);
            }
          }
        });
    })
  );
});
