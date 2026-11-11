/**
 * DEGLA — Service Worker PWA & Mode Hors-ligne
 * Gestion du cache, consultation hors-ligne des contenus visités,
 * et protection des mutations (base de données et génération IA nécessitent le serveur).
 */

const CACHE_VERSION = 'degla-pwa-v2';
const PRECACHE_NAME = `degla-precache-${CACHE_VERSION}`;
const RUNTIME_CACHE_NAME = `degla-runtime-${CACHE_VERSION}`;
const MEDIA_CACHE_NAME = `degla-media-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/offline',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon.svg',
  '/icons/icon-maskable.svg',
  '/images/degla1.webp',
];

// Installation : pré-mise en cache des ressources critiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE_NAME)
      .then(async (cache) => {
        await Promise.allSettled(
          PRECACHE_URLS.map((url) =>
            fetch(url)
              .then((res) => {
                if (res.ok) return cache.put(url, res);
              })
              .catch(() => {})
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  const currentCaches = [PRECACHE_NAME, RUNTIME_CACHE_NAME, MEDIA_CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => !currentCaches.includes(name))
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Écoute des messages (ex: forcer skipWaiting)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Routage et interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-HTTP (ex: chrome-extension, data:, etc.)
  if (!url.protocol.startsWith('http')) return;

  // NE PAS INTERCEPTER les scripts de développement Turbopack / Next.js HMR
  // Évite tout blocage en cours de compilation locale dev
  if (
    url.pathname.includes('webpack') ||
    url.pathname.includes('turbopack') ||
    url.pathname.includes('hot-update') ||
    url.pathname.endsWith('._.js') ||
    url.pathname.endsWith('._.js.map') ||
    url.searchParams.has('turbopack')
  ) {
    return;
  }

  // 1. MUTATIONS & ACTIONS SERVEUR (POST, PUT, DELETE, PATCH)
  // Exigence : "les enregistrements en base et la génération IA nécessiteront encore une connexion au serveur"
  if (request.method !== 'GET') {
    event.respondWith(
      fetch(request).catch(() => {
        const isJson =
          request.headers.get('Accept')?.includes('application/json') ||
          url.pathname.startsWith('/api/') ||
          request.headers.has('Next-Action');

        if (isJson) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: 'Hors ligne',
              message:
                'Vous êtes actuellement hors connexion. Les enregistrements en base de données et les modifications nécessitent une connexion active.',
              offline: true,
            }),
            {
              status: 503,
              statusText: 'Service Unavailable (Offline)',
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        return new Response('Connexion au serveur requise pour cette action.', {
          status: 503,
          statusText: 'Service Unavailable (Offline)',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      })
    );
    return;
  }

  // 2. ROUTES D'INTELLIGENCE ARTIFICIELLE & GÉNÉRATION 3D
  // Strictly Network-Only : ne jamais servir de résultats d'IA depuis un vieux cache
  const isAiRoute =
    url.pathname.includes('/api/trellis') ||
    url.pathname.includes('/api/meshy') ||
    url.pathname.includes('/api/ai') ||
    url.pathname.includes('/generer');

  if (isAiRoute) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            ok: false,
            error: 'IA indisponible hors ligne',
            message:
              'La génération 3D et les services d’intelligence artificielle nécessitent une connexion active au serveur DEGLA.',
            offline: true,
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
    );
    return;
  }

  // 3. NAVIGATION HTML (Pages de l'application)
  // Stratégie : Network-First avec repli sur le cache de la page, puis sur la page /offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(RUNTIME_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;

          const offlineFallback = await caches.match('/offline');
          if (offlineFallback) return offlineFallback;

          return new Response(
            `<!DOCTYPE html>
            <html lang="fr">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Hors ligne · DEGLA</title>
              <style>
                body { font-family: system-ui, sans-serif; background: #FAF5EC; color: #24150F; padding: 2rem; text-align: center; }
                h1 { color: #5A2E1A; font-size: 1.8rem; margin-top: 2rem; }
                p { color: #666; max-width: 480px; margin: 1rem auto; line-height: 1.6; }
                .btn { display: inline-block; background: #B8701F; color: #fff; padding: 0.75rem 1.5rem; border-radius: 9999px; text-decoration: none; font-weight: 600; margin-top: 1rem; }
              </style>
            </head>
            <body>
              <h1>Mode Hors Ligne · DEGLA</h1>
              <p>Vous êtes actuellement hors connexion. Les pages et dattes que vous avez déjà visitées sont conservées en mémoire cache.</p>
              <a href="/" class="btn" onclick="location.reload(); return false;">Réessayer</a>
            </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 4. MÉDIAS, IMAGES & MODÈLES 3D DÉJÀ VISUALISÉS
  // Stratégie : Cache-First avec remplissage réseau
  const isMedia =
    url.pathname.startsWith('/api/media/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/icons/') ||
    /\.(webp|png|jpg|jpeg|svg|gif|ico|glb|gltf|woff2?)$/i.test(url.pathname);

  if (isMedia) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(MEDIA_CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => new Response('', { status: 408 }));
      })
    );
    return;
  }

  // 5. ASSETS STATIQUES DE PRODUCTION (_next/static/)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(RUNTIME_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Pour tout le reste en mode dev, laisser passer directement
  return;
});
