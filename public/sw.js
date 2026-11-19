const CACHE_NAME = 'passguard-shell-v1'
const CORE_FILES = [
  '/passguard-mark.svg',
  '/passguard-lock.png',
  '/favicon-16.png',
  '/favicon-32.png',
  '/favicon-48.png',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/icons/passguard-192.png',
  '/icons/passguard-512.png',
  '/manifest.webmanifest',
]

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME)
    const response = await fetch('/')
    const html = await response.clone().text()
    await cache.put('/', response)

    // Precache production entry assets referenced by the HTML shell.
    const assets = Array.from(html.matchAll(/(?:src|href)=["']([^"']+)["']/g))
      .map((match) => match[1])
      .filter((path) => path?.startsWith('/assets/'))
    const precacheFiles = Array.from(new Set([...CORE_FILES, ...assets]))
    await cache.addAll(precacheFiles)
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter((key) => key.startsWith('passguard-') && key !== CACHE_NAME).map((key) => caches.delete(key)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.search) return

  const isShell = url.pathname === '/' || url.pathname === '/index.html'
  const isAsset = url.pathname.startsWith('/assets/') || CORE_FILES.includes(url.pathname)
  if (!isShell && !isAsset) return

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME)
    const cached = await cache.match(request) || (isShell ? await cache.match('/') : undefined)

    if (isShell) {
      try {
        const response = await fetch(request)
        if (response.ok) await cache.put('/', response.clone())
        return response
      } catch {
        return cached || Response.error()
      }
    }

    if (cached) return cached
    try {
      const response = await fetch(request)
      if (response.ok && response.type === 'basic') await cache.put(request, response.clone())
      return response
    } catch {
      return Response.error()
    }
  })())
})
