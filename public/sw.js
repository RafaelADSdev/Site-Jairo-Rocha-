/* Service worker do portal Jairo Rocha.
   Navegação: network-first com fallback para cache e, por último, /offline.
   Estáticos versionados (/_astro, fontes, ícones): cache-first.
   Imagens: stale-while-revalidate com teto de entradas. */

const VERSION = 'v1';
const SHELL = `jr-shell-${VERSION}`;
const PAGES = `jr-pages-${VERSION}`;
const ASSETS = `jr-assets-${VERSION}`;
const IMAGES = `jr-images-${VERSION}`;
const CURRENT = [SHELL, PAGES, ASSETS, IMAGES];

const OFFLINE_URL = '/offline';
const NAV_TIMEOUT = 4000;
const IMAGE_LIMIT = 80;

const PRECACHE = [
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/images/logo.webp',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    // Um item indisponível não pode invalidar a instalação inteira, e a resposta
    // é regravada sob a URL pedida para sobreviver a redirecionamentos de rota.
    await Promise.all(PRECACHE.map(async (url) => {
      try {
        const res = await fetch(url, {cache: 'reload'});
        if (res.ok) await cache.put(url, new Response(await res.blob(), {headers: res.headers}));
      } catch {
        /* offline durante a instalação */
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('jr-') && !CURRENT.includes(k)).map((k) => caches.delete(k)));
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});

async function trim(cacheName, limit) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - limit; i++) await cache.delete(keys[i]);
}

// Network-first com timeout: em 3G ruim vale mais servir a versão em cache.
async function networkFirst(event) {
  const cache = await caches.open(PAGES);
  try {
    const preload = await event.preloadResponse;
    const fresh = preload || await Promise.race([
      fetch(event.request),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), NAV_TIMEOUT)),
    ]);
    if (fresh && fresh.ok) cache.put(event.request, fresh.clone());
    return fresh;
  } catch {
    return (await cache.match(event.request, {ignoreSearch: true}))
      || (await caches.match(OFFLINE_URL))
      || Response.error();
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const fresh = await fetch(request);
  if (fresh.ok) cache.put(request, fresh.clone());
  return fresh;
}

async function staleWhileRevalidate(request, cacheName, limit) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  const update = fetch(request).then((fresh) => {
    if (fresh.ok) cache.put(request, fresh.clone()).then(() => limit && trim(cacheName, limit));
    return fresh;
  }).catch(() => hit);
  return hit || update;
}

self.addEventListener('fetch', (event) => {
  const {request} = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // A área administrativa e os modelos 3D pesados ficam sempre online.
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/models/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(event));
    return;
  }

  if (url.pathname.startsWith('/_astro/') || url.pathname.startsWith('/icons/') || /\.(?:woff2?|css|js)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, ASSETS));
    return;
  }

  if (request.destination === 'image') {
    event.respondWith(staleWhileRevalidate(request, IMAGES, IMAGE_LIMIT));
  }
});
