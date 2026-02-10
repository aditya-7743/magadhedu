// Service Worker for Vidyarthi PWA

const CACHE_NAME = 'vidyarthi-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/auth.js',
    '/firebase-config.js',
    '/student-dashboard.js',
    '/teacher-dashboard.js',
    '/courses.js',
    '/live-class.js',
    '/mock-test.js',
    '/video-player.js',
    '/certificate.js',
    '/payment.js',
    '/analytics.js',
    '/notifications.js',
    '/settings.js',
    '/manifest.json'
];

// Install: cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: network-first with cache fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip cross-origin API requests (Firebase, CDNs)
    if (!request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        fetch(request)
            .then((response) => {
                // Clone and cache successful responses
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Network failed, try cache
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;

                    // For navigation requests, return cached index.html (SPA fallback)
                    if (request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }

                    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
                });
            })
    );
});
