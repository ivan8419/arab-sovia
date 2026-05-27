const CACHE_NAME = 'duolinggo-sov-v2'
const APP_ASSETS = ['/', '/manifest.json']
const STATIC_ASSET_PATTERN =
  /\.(?:css|js|png|jpg|jpeg|svg|webp|gif|ico|woff2?)$/i

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key.startsWith('duolinggo-sov-') && key !== CACHE_NAME
            )
            .map((key) => caches.delete(key))
        )
      )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  const url = new URL(event.request.url)

  // Biarkan request internal Next.js berjalan langsung ke network.
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/_next/') ||
    url.searchParams.has('_rsc') ||
    event.request.mode === 'navigate'
  ) {
    return
  }

  if (
    !STATIC_ASSET_PATTERN.test(url.pathname) &&
    url.pathname !== '/manifest.json'
  ) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse
        }

        const responseToCache = networkResponse.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return networkResponse
      })
    })
  )
})
