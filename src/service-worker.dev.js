const CACHE_NAME = "cache-__BUILD_SHA__";
const ASSETS = __ASSETS__;

// Install event: cache all assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW-DEV] Caching all assets");
        // Add the root path to the assets array to ensure it's cached.
        const assetsToCache = ["/", ...ASSETS];
        return cache.addAll(assetsToCache);
      })
      .then(() => {
        console.log("[SW-DEV] All assets cached. Forcing update.");
        // Force the waiting service worker to become the active service worker.
        self.skipWaiting();
      })
      .catch((error) => {
        console.error("[SW-DEV] Caching failed:", error);
      }),
  );
});

// Activate event: delete old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[SW-DEV] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }).then(() => {
      // Tell the active service worker to take control of the page immediately.
      return self.clients.claim();
    }),
  );
});

// Fetch event: serve from cache, fall back to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse;
        }
        // Otherwise, fetch from network
        return fetch(event.request).then((networkResponse) => {
          // Optionally, cache the new response for future requests
          // Be careful with what you cache, especially for dynamic APIs.
          return networkResponse;
        });
      }),
  );
});

// No 'message' listener needed for dev, as we skip waiting automatically.
