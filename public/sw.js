// Service Worker for BD ESPORTS MS PWA / Android App
const CACHE_NAME = 'bd-esports-v4.0-' + Date.now();
const ASSETS_TO_CACHE = [
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
      // Purge all old caches immediately
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Allow app to trigger a native system notification through the Service Worker
  if (event.data && event.data.type === 'SHOW_NATIVE_NOTIFICATION') {
    const notif = event.data.notification || {};
    const title = notif.title || 'BD ESPORTS MS';
    const linkTab = notif.linkTab || 'play';
    const options = {
      body: notif.message || 'নতুন টুর্নামেন্ট ও রুম কোড চেক করুন!',
      icon: '/app_icon.png',
      badge: '/app_icon.png',
      vibrate: [200, 100, 200, 100, 200],
      tag: notif.id || 'bdesports-' + Date.now(),
      renotify: true,
      requireInteraction: true,
      data: {
        url: `/?tab=${linkTab}`,
        linkTab: linkTab,
      },
      actions: [
        { action: 'open_app', title: '🎮 অ্যাপে যান' }
      ]
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

// Real Web Push Event: Triggers when server broadcasts notification via WebPush VAPID
// Even if the app or browser tab is completely closed!
self.addEventListener('push', (event) => {
  let data = {
    title: 'BD ESPORTS MS',
    message: 'নতুন টুর্নামেন্ট ও রুম কোড চেক করুন!',
    icon: '/app_icon.png',
    badge: '/app_icon.png',
    linkTab: 'play',
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (e) {
    if (event.data) {
      data.message = event.data.text();
    }
  }

  const title = data.title || 'BD ESPORTS MS';
  const linkTab = data.linkTab || 'play';
  const options = {
    body: data.message || data.body || 'অ্যাপে নতুন টুর্নামেন্ট এসেছে, জয়েন করুন!',
    icon: data.icon || '/app_icon.png',
    badge: data.badge || '/app_icon.png',
    image: data.image || undefined,
    vibrate: [300, 100, 300, 100, 300],
    tag: data.tag || 'bdesports-' + (data.id || Date.now()),
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || `/?tab=${linkTab}`,
      linkTab: linkTab,
    },
    actions: [
      { action: 'open_app', title: '🎮 অ্যাপে যান' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification Click Event: When user taps the notification in phone's notification bar
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const linkTab = event.notification.data?.linkTab || 'play';
  const targetUrl = event.notification.data?.url || `/?tab=${linkTab}`;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If an existing window is open, focus it and tell it which tab to navigate to
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'NAVIGATE_TAB', tab: linkTab });
          return client.focus();
        }
      }
      // If no window is open, open a new window to the target tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  // Don't intercept API calls or Vite dev modules
  if (
    url.includes('/api/') ||
    url.includes('/@vite') ||
    url.includes('/@fs') ||
    url.includes('/@id') ||
    url.includes('node_modules') ||
    !url.startsWith('http')
  ) {
    return;
  }

  // FOR NAVIGATION / HTML REQUESTS: ALWAYS NETWORK FIRST (NO-STORE)
  if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone).catch(() => {});
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const fallback = (await caches.match('/index.html')) || (await caches.match('/'));
          return fallback || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        })
    );
    return;
  }

  // FOR ASSETS (JS/CSS/IMAGES): Network First with quick fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        return cachedResponse || Response.error();
      })
  );
});
