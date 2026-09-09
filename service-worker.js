// Service Worker for Mini Court Calculator PWA
/* يُرفع الرقم عند كل تغيير في الملفات: الجلب من الذاكرة أوّلاً،
   فلولا رفعه لبقي من زار الموقع سابقاً على النسخة القديمة. */
const CACHE_NAME = 'court-calculator-v7';
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
  const req = event.request;
  if (req.method !== 'GET') return;

  const sameOrigin = new URL(req.url).origin === self.location.origin;

  /* ملفات التطبيق: الشبكة أوّلاً والذاكرة احتياطاً عند انقطاعها.
     كانت الذاكرة أوّلاً، فيبقى من زار الموقع على نسخته الأولى ولا
     يصله تحديث إلّا برفع رقم الذاكرة وتحديثَين متتاليَين. */
  if (req.mode === 'navigate' || sameOrigin) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((c) => {
          if (c) return c;
          if (req.mode === 'navigate') return caches.match('/mini-court-calculator/index.html');
          return Response.error();
        }))
    );
    return;
  }

  /* مصادر خارجية (خطوط وأنماط): الذاكرة أوّلاً فهي لا تتغيّر */
  event.respondWith(
    caches.match(req).then((c) => c || fetch(req).then((res) => {
      if (res && res.status === 200) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cc) => cc.put(req, copy));
      }
      return res;
    }))
  );
});
