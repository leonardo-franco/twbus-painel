// TwBus Service Worker
// Implementa cache e funcionalidade offline

const CACHE_NAME = 'twbus-v1.0.0';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/tests.html',
  '/tests.js',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Cache aberto');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log('✅ Service Worker: Arquivos cacheados');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Service Worker: Erro no cache:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Service Worker: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Ativado');
        return self.clients.claim();
      })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('cdnjs.cloudflare.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se disponível
        if (response) {
          console.log('📦 Service Worker: Servindo do cache:', event.request.url);
          return response;
        }

        // Tenta buscar da rede
        return fetch(event.request)
          .then(response => {
            // Verifica se a resposta é válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona a resposta para o cache
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
                console.log('💾 Service Worker: Adicionado ao cache:', event.request.url);
              });

            return response;
          })
          .catch(error => {
            console.log('🔌 Service Worker: Offline, servindo fallback');
            
            // Fallback para HTML pages
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            // Fallback para imagens
            if (event.request.destination === 'image') {
              return new Response('', { 
                status: 200, 
                statusText: 'OK' 
              });
            }
            
            throw error;
          });
      })
  );
});

// Mensagens do cliente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏭️ Service Worker: Pulando espera...');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Background Sync (para funcionalidades futuras)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Service Worker: Background sync executado');
    // Implementar sincronização de dados quando necessário
  }
});

// Push notifications (para funcionalidades futuras)
self.addEventListener('push', event => {
  console.log('🔔 Service Worker: Push notification recebida');
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      data: data,
      actions: [
        {
          action: 'open',
          title: 'Abrir TwBus'
        },
        {
          action: 'close',
          title: 'Fechar'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Clique em notificação
self.addEventListener('notificationclick', event => {
  console.log('👆 Service Worker: Notificação clicada');
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
