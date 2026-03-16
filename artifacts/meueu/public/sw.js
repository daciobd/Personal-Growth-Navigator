/**
 * MeuEu Service Worker v3 — produção apenas.
 * Força limpeza do cache antigo e não cacheia em dev.
 */
const CACHE_NAME = "meueu-v3";

const STATIC_ASSETS = [
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  // Não intercepta paths internos do Replit/Expo dev
  if (
    url.pathname.startsWith("/__replco") ||
    url.pathname.startsWith("/_expo") ||
    url.pathname.startsWith("/node_modules")
  ) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(
          JSON.stringify({ error: "Você está offline. Tente novamente." }),
          { status: 503, headers: { "Content-Type": "application/json" } }
        )
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (
            response.ok &&
            (url.pathname.endsWith(".png") ||
              url.pathname.endsWith(".woff2") ||
              url.pathname === "/manifest.json")
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          if (event.request.destination === "document") {
            return caches.match("/");
          }
        });
    })
  );
});
