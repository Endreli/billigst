const CACHE_NAME = "billigst-v3";
const STATIC_ASSETS = ["/", "/handlekurv", "/produkter", "/butikker"];

// API responses to cache for offline use
const API_CACHE_NAME = "billigst-api-v1";
const API_CACHE_TTL = 60 * 60 * 1000; // 1 hour

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== API_CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // API requests: network first, cache fallback
  if (url.pathname.startsWith("/api/")) {
    // Only cache safe read endpoints
    if (url.pathname.includes("/search") || url.pathname.includes("/browse") || url.pathname.includes("/trending")) {
      event.respondWith(
        fetch(request)
          .then((res) => {
            const clone = res.clone();
            caches.open(API_CACHE_NAME).then((cache) => cache.put(request, clone));
            return res;
          })
          .catch(() => caches.match(request))
      );
    }
    return;
  }

  // Static assets: cache first
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached ||
        fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return res;
        })
      )
    );
    return;
  }

  // Pages: network first, cache fallback
  event.respondWith(
    fetch(request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return res;
      })
      .catch(() => caches.match(request))
  );
});
