/* HayMedics Hospital — service worker (network-first, so updates always show) */
const CACHE = 'haymedics-hospital-v3';
const ICONS = ['./icon-192.png', './icon-512.png', './icon-512-maskable.png', './apple-touch-icon.png', './favicon-32.png'];

self.addEventListener('install', function (e) {
  // pre-cache only the icons; the page + app are always fetched fresh
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ICONS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // the live app (script.google.com) always goes straight to the network
  // Network-first: always try fresh, fall back to cache only when offline.
  e.respondWith(
    fetch(e.request).then(function (r) {
      var copy = r.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return r;
    }).catch(function () { return caches.match(e.request); })
  );
});
