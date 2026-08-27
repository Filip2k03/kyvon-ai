const CACHE_NAME = 'kyvon-core-v2.3.1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Ignore chrome-extension and non-http(s) schemes
  if (!url.protocol.startsWith('http')) return;

  // Never intercept API or completion streams
  if (url.pathname.startsWith('/v1/') || url.pathname.startsWith('/api/')) return;

  // Network-first strategy with cache fallback
  event.respondWith(
    fetch(req)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          // Do not cache HTML navigation responses as JS/CSS
          const contentType = response.headers.get('content-type') || '';
          if (url.pathname.endsWith('.js') && !contentType.includes('javascript')) {
            return response;
          }
          if (url.pathname.endsWith('.css') && !contentType.includes('css')) {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache).catch(() => {});
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(req).then((cached) => {
          if (cached) return cached;
          if (req.mode === 'navigate') {
            return caches.match('./index.html') || caches.match('/care/index.html') || caches.match('/chat/index.html');
          }
          return new Response('Offline resource unavailable', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});
