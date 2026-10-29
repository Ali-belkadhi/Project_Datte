/* DEGLA — Service Worker (mode hors ligne de la PWA).
 *
 * Stratégies :
 *  - pages (navigation)          : réseau d'abord, copie en cache ; hors ligne → dernière version en cache, sinon /hors-ligne
 *  - fichiers /_next/static      : cache d'abord (noms versionnés) — en développement : réseau d'abord
 *  - images, icônes, polices     : cache puis mise à jour en arrière-plan (stale-while-revalidate)
 *  - API, Server Actions (POST)  : jamais mis en cache (paiement, commandes : toujours le réseau)
 */
const VERSION = "degla-v1";
const DEV = new URL(self.location.href).searchParams.has("dev");
const CACHE_PAGES = `${VERSION}-pages`;
const CACHE_STATIQUE = `${VERSION}-statique`;
const CACHE_MEDIAS = `${VERSION}-medias`;
const PAGE_HORS_LIGNE = "/hors-ligne";
const PRECACHE = [PAGE_HORS_LIGNE, "/", "/catalogue", "/panier", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", "/favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_PAGES)
      // une page indisponible ne doit pas bloquer l'installation
      .then((cache) => Promise.allSettled(PRECACHE.map((url) => cache.add(new Request(url, { cache: "reload" })))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cles) => Promise.all(cles.filter((c) => !c.startsWith(VERSION)).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

async function reseauDabord(requete, nomCache, repli) {
  const cache = await caches.open(nomCache);
  try {
    const reponse = await fetch(requete);
    if (reponse.ok) cache.put(requete, reponse.clone());
    return reponse;
  } catch {
    const enCache = await cache.match(requete, { ignoreSearch: requete.mode === "navigate" });
    if (enCache) return enCache;
    if (repli) return (await caches.match(repli)) ?? Response.error();
    return Response.error();
  }
}

async function cacheDabord(requete, nomCache) {
  const enCache = await caches.match(requete);
  if (enCache) return enCache;
  const reponse = await fetch(requete);
  if (reponse.ok) (await caches.open(nomCache)).put(requete, reponse.clone());
  return reponse;
}

async function cachePuisMaj(requete, nomCache) {
  const cache = await caches.open(nomCache);
  const enCache = await cache.match(requete);
  const maj = fetch(requete)
    .then((r) => {
      if (r.ok) cache.put(requete, r.clone());
      return r;
    })
    .catch(() => enCache);
  return enCache ?? maj;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return; // données dynamiques : toujours le réseau
  if (request.headers.get("RSC") || request.headers.get("Next-Router-Prefetch")) return; // navigation interne de Next.js

  if (request.mode === "navigate") {
    event.respondWith(reseauDabord(request, CACHE_PAGES, PAGE_HORS_LIGNE));
  } else if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(DEV ? reseauDabord(request, CACHE_STATIQUE) : cacheDabord(request, CACHE_STATIQUE));
  } else if (/\.(png|jpe?g|webp|avif|svg|ico|woff2?)$/.test(url.pathname) || url.pathname.startsWith("/_next/image")) {
    event.respondWith(cachePuisMaj(request, CACHE_MEDIAS));
  }
});
