// Service Worker para PWA
const CACHE_NAME = 'lista-compras-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/script.js',
    '/manifest.json',
    '/assets/icons/icon-192.png',
    '/assets/icons/icon-512.png',
    // Adicione aqui outros recursos estáticos que você queira cachear
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Service Worker: Cacheando arquivos...');
            return cache.addAll(urlsToCache);
        }).catch(error => {
            console.error('Service Worker: Falha ao cachear', error);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // Retorna o recurso do cache se encontrado
            if (response) {
                console.log('Service Worker: Servindo do cache:', event.request.url);
                return response;
            }
            // Caso contrário, busca na rede
            console.log('Service Worker: Buscando na rede:', event.request.url);
            return fetch(event.request).then(networkResponse => {
                // Tenta cachear novas requisições de sucesso para uso futuro
                if (networkResponse.ok && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(error => {
                console.error('Service Worker: Erro ao buscar na rede:', error);
                // Você pode retornar uma página offline aqui, se tiver uma
                // return caches.match('/offline.html');
            });
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME).map(name => {
                    console.log('Service Worker: Limpando cache antigo:', name);
                    return caches.delete(name);
                })
            );
        })
    );
});