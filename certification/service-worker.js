/**
 * HayMedics Final Exam — service worker
 *
 * Caches the PWA shell (index.html, manifest, icons) so the app installs cleanly
 * and shows a friendly splash even when the student is offline. Does NOT cache
 * the Apps Script iframe content — exam state belongs on the server, never
 * stale copies on the student's device.
 */

var CACHE_VERSION = 'haymedics-finalexam-v3';
var SHELL = [
  './',
  './index.html',
  './manifest.json',
  './favicon-16.png',
  './favicon-32.png',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png'
];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll(SHELL).catch(function () { /* ignore partial failures */ });
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_VERSION; })
                            .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

/**
 * Serve the shell from cache, hit network first for everything else.
 * Script.google.com iframe requests are let through untouched — no caching.
 */
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  var isShell = url.origin === self.location.origin;
  if (!isShell) return;  // let the browser handle cross-origin (Apps Script) itself

  e.respondWith(
    caches.match(e.request).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        // Opportunistically cache successful shell responses
        if (res.ok && e.request.method === 'GET') {
          var copy = res.clone();
          caches.open(CACHE_VERSION).then(function (c) { c.put(e.request, copy); }).catch(function(){});
        }
        return res;
      }).catch(function () {
        // Offline fallback for navigations — return the cached index.html
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
