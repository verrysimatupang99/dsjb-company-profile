/* PT DSITU JAYA BERSAMA — Service Worker v1.0 */
const CACHE_NAME = "dsjb-v1";
const OFFLINE_URL = "/dsjb-company-profile/404.html";

// Assets to pre-cache on install
const PRECACHE = [
  "/dsjb-company-profile/",
  "/dsjb-company-profile/index.html",
  "/dsjb-company-profile/assets/css/styles.css",
  "/dsjb-company-profile/assets/js/main.js",
  "/dsjb-company-profile/assets/img/logo-dsjb-fullcolor-whitebg.webp",
  "/dsjb-company-profile/assets/img/hero-cp-revisi.webp",
  "/dsjb-company-profile/manifest.json",
];

// Install — pre-cache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network-first for HTML, cache-first for assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin
  if (request.method !== "GET" || url.origin !== location.origin) return;

  // HTML pages: network-first
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      });
    })
  );
});
