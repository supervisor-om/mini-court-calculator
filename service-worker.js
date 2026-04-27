// Service Worker for Mini Court Calculator PWA
const CACHE_NAME = 'court-calculator-v1';
const ASSETS = [
  '/mini-court-calculator/',
  '/mini-court-calculator/index.html',
  '/mini-court-calculator/manifest.json',
  // External resources will be cached on first load
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(ASSETS);
      })
      .catch((err) => {
        console.error('Cache failed:', err);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((networkResponse) => {
            // Cache new requests for external resources (CDN)
            if (event.request.method === 'GET' && 
                (event.request.url.includes('cdn.tailwindcss.com') ||
                 event.request.url.includes('fonts.googleapis.com') ||
                 event.request.url.includes('fonts.gstatic.com'))) {
              return caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
            }
            return networkResponse;
          });
      })
      .catch(() => {
        // Fallback for offline
        if (event.request.mode === 'navigate') {
          return caches.match('/mini-court-calculator/index.html');
        }
      })
  );
});
