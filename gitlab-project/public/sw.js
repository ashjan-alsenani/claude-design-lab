/* Offline cache for the app shell only. Sign-in (auth/) and data (api/) always go to the server and are never cached. */
const CACHE = "dtd-__BUILD_ID__"; // replaced on every build (vite.config.ts)
const SHELL = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "assets/styles.css",
  "assets/boot.js",
  "assets/app.js",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/apple-touch-icon.png",
  "assets/fonts/carlito-latin-400.woff2",
  "assets/fonts/carlito-latin-700.woff2",
  "assets/fonts/carlito-latin-ext-400.woff2",
  "assets/fonts/carlito-latin-ext-700.woff2",
  "assets/fonts/noto-sans-arabic.woff2",
  "assets/tour/bell.jpg",
  "assets/tour/dashboard.jpg",
  "assets/tour/directory.jpg",
  "assets/tour/drill.jpg",
  "assets/tour/home.jpg",
  "assets/tour/orgchart.jpg",
  "assets/tour/profile.jpg",
  "assets/tour/settings.jpg",
  "assets/tour/en/bell.jpg",
  "assets/tour/en/dashboard.jpg",
  "assets/tour/en/directory.jpg",
  "assets/tour/en/drill.jpg",
  "assets/tour/en/home.jpg",
  "assets/tour/en/orgchart.jpg",
  "assets/tour/en/profile.jpg",
  "assets/tour/en/settings.jpg"
];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request;
  const u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin || /\/(api|auth)\//.test(u.pathname) || /\/(healthz|readyz)$/.test(u.pathname)) return;
  // Network first so updates show up; fall back to the cache when offline.
  e.respondWith(fetch(r).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); } return res; })
    .catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || (r.mode === "navigate" ? caches.match("index.html") : undefined))));
});
