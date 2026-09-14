// WordMaster — қарапайым offline service worker.
// App shell-ды (HTML, manifest, иконкалар, сөздер JSON-дары) кэштейді,
// сөйтіп қосымша интернетсіз де ашыла алады (нағыз Android қосымшасына
// жақындататын PWA/TWA талабы).

const CACHE_NAME = 'wordmaster-v3';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './data/manifest.json',
  './data/words/A1.json',
  './data/words/A2.json',
  './data/words/B1.json',
  './data/words/B2.json',
  './data/words/C1.json',
  './data/words/ML.json',
];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL).catch(function () {
        // Кейбір файлдар жетіспесе де орнатуды үзбейміз.
      });
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

// Network-first (жаңа деректерді артық көреді), сәтсіз болса кэштен береді.
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
        return response;
      })
      .catch(function () {
        return caches.match(event.request).then(function (cached) {
          return cached || caches.match('./index.html');
        });
      })
  );
});
