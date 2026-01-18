self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open('runcatcher-v1').then((cache) => cache.addAll([
            '/',
            '/static/index.html',
            '/static/style.css',
            '/static/app.js',
            'https://cdn.jsdelivr.net/npm/bootswatch@5.3.2/dist/united/bootstrap.min.css',
            'https://unpkg.com/lucide@latest'
        ])),
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request)),
    );
});
