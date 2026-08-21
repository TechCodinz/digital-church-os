const CACHE_NAME = 'digital-church-living-sanctuary-v5-1';
const OFFLINE_CACHE = [
    '/',
    '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(OFFLINE_CACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;

    if (request.method !== 'GET') return;

    // Always prefer the current deployment for navigations so a previously
    // installed PWA cannot pin users to an older release after production
    // changes. The cached home shell exists only as an offline fallback.
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => caches.match('/') )
        );
        return;
    }

    // Next.js immutable build assets are content-hashed. Let the browser/CDN
    // fetch their exact current URL rather than maintaining a second stale
    // application-shell cache in the service worker.
    if (new URL(request.url).pathname.startsWith('/_next/')) {
        return;
    }

    event.respondWith(
        fetch(request).catch(() => caches.match(request))
    );
});
