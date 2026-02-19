/**
 * DocHub Service Worker
 * 
 * Provides offline support by caching the app shell and assets.
 * Handles share_target POST requests so the app appears in "Open with" / "Share" sheets.
 * Strategy: Cache-first for static assets, network-first for dynamic content.
 */

const CACHE_NAME = 'dochub-v3';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install: pre-cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: handle share_target POST, cache-first for assets, network-first for HTML
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  /* ---- Handle Web Share Target (POST with file) ---- */
  if (request.method === 'POST' && url.pathname === '/') {
    event.respondWith(
      (async () => {
        // Read the shared form data
        const formData = await request.formData();
        const file = formData.get('file');

        // Store the file temporarily so the app can pick it up
        if (file) {
          const clients = await self.clients.matchAll({ type: 'window' });
          // Redirect to the app with a marker param
          const redirectUrl = `/?share=1`;
          
          // If there's already an open window, post the file to it
          if (clients.length > 0) {
            const client = clients[0];
            client.postMessage({
              type: 'SHARED_FILE',
              file: file,
            });
            client.focus();
            return Response.redirect(redirectUrl, 303);
          }

          // No open window: cache the file and open the app
          const cache = await caches.open('dochub-shared');
          // Store the file as a response so it persists briefly
          await cache.put('/_shared_file_', new Response(file, {
            headers: {
              'X-File-Name': encodeURIComponent(file.name),
              'X-File-Type': file.type,
            },
          }));
          return Response.redirect(redirectUrl, 303);
        }

        // No file in the POST, just load the app
        return Response.redirect('/', 303);
      })()
    );
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests (CDN, API calls)
  if (!request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      // For navigation requests (HTML), try network first
      if (request.mode === 'navigate') {
        return fetch(request)
          .then((response) => {
            // Cache the latest version
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
          .catch(() => cached || caches.match('/index.html'));
      }

      // For assets (JS, CSS, images), use cache-first
      if (cached) return cached;

      return fetch(request).then((response) => {
        // Don't cache error responses
        if (!response || response.status !== 200) return response;

        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      });
    })
  );
});
