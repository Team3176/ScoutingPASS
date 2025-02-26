const CACHE_NAME = 'frc-scouting-v1';

// Add any additional URLs that you want to cache
const urlsToCache = [
    '/',
    '/index.html',
    '/offline.html',
    '/assets/images/icon.png',
    '/assets/images/splash-icon.png',
    '/assets/images/adaptive-icon.png'
];

// Install service worker and cache all resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Failed to cache resources:', error);
            })
    );
});

// Fetch resources from cache or network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
            .catch(() => caches.match('offline.html'))
    );
});

// Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
}); 