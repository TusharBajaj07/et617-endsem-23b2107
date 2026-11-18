// Offline cache for weak evening signal: app shell is cache-first, /api is never cached.
// v2: only our own files and Google Fonts are cached. Live data (Supabase) must never be cached, or the
// teacher sees stale progress and the learner never receives the teacher's reply.
const CACHE = 'gc-v2'
const CACHEABLE = (url) => url.origin === self.location.origin || /(^|\.)(fonts\.googleapis|fonts\.gstatic)\.com$/.test(url.hostname)
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/', '/index.html', '/favicon.svg', '/manifest.webmanifest'])))
  self.skipWaiting()
})
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))))
  self.clients.claim()
})
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  if (e.request.method !== 'GET' || url.pathname.startsWith('/api/') || !CACHEABLE(url)) return
  // Pages: network first (fresh deploys), fall back to cache offline. Assets and fonts: cache first.
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then((r) => { caches.open(CACHE).then((c) => c.put('/', r.clone())); return r }).catch(() => caches.match('/')))
    return
  }
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => {
      if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)) }
      return r
    })),
  )
})
