const CACHE_NAME = 'my-tech-news-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  // Force this new service worker to activate immediately, overriding the old one
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', event => {
  // Take control of all open pages immediately
  event.waitUntil(self.clients.claim());
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Clearing old service worker cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Never intercept or cache API backend endpoints
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  // Network-First Strategy: Always fetch fresh assets from the web, fallback to cache if offline.
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache the fresh asset if it's a valid GET request
        if (response.status === 200 && event.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network is unavailable
        return caches.match(event.request);
      })
  );
});
