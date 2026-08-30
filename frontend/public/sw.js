/* eslint-disable no-restricted-globals */
// Network-first service worker: always tries the network first (so the
// installed PWA is never stuck showing an old bundle while online), and
// only falls back to cache when genuinely offline. Takes over immediately
// on install/activate instead of waiting for all tabs to close.
const CACHE_NAME = "votesecure-cache-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
