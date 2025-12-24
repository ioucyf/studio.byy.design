const CACHE_NAME = 'cache-__BUILD_SHA__';
const ASSETS = __ASSETS__;

// Install event: cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching all assets');
        // Add the root path to the assets array to ensure it's cached.
        const assetsToCache = ['/', ...ASSETS];
        return cache.addAll(assetsToCache);
      })
      .then(() => {
        console.log('[SW] All assets cached');
      })
      .catch(error => {
        console.error('[SW] Caching failed:', error);
      })
  );
});

// Activate event: delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Tell the active service worker to take control of the page immediately.
      return self.clients.claim();
    })
  );
});

// Fetch event: serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse;
        }
        // Otherwise, fetch from network
        return fetch(event.request).then(networkResponse => {
          // Optionally, cache the new response for future requests
          // Be careful with what you cache, especially for dynamic APIs.
          return networkResponse;
        });
      })
  );
});

// Message event: listen for a message from the client to skip waiting
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
