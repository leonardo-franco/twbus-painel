// TwBus Service Worker v1.3.0
// Implementa cache inteligente e funcionalidade offline

const CACHE_NAME = 'twbus-v1.3.0';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/admin-login.html',
  '/admin-dashboard.html',
  '/style.css',
  '/script.js',
  '/security-config.js',
  '/tests.js',
  '/version.js',
  '/manifest.json',
  '/icon.svg',
  '/icon-512.svg',
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

// Interceptação de requisições com cache inteligente
self.addEventListener('fetch', event => {
  // Skip cross-origin requests (exceto CDNs permitidos)
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('cdnjs.cloudflare.com')) {
    return;
  }

  // Cache-first strategy para recursos estáticos
  if (event.request.url.includes('.css') || 
      event.request.url.includes('.js') || 
      event.request.url.includes('.svg') ||
      event.request.url.includes('manifest.json')) {
    
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            console.log('📦 Service Worker: Servindo do cache (estático):', event.request.url);
            return response;
          }
          
          return fetch(event.request)
            .then(response => {
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                    console.log('💾 Service Worker: Recurso estático cacheado:', event.request.url);
                  });
              }
              return response;
            });
        })
    );
    return;
  }

  // Network-first strategy para páginas HTML (sempre buscar versão mais recente)
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
              console.log('💾 Service Worker: Página HTML atualizada no cache:', event.request.url);
            });
          
          console.log('🌐 Service Worker: Servindo da rede (HTML):', event.request.url);
          return response;
        }
        
        // Se falhar, tenta do cache
        return caches.match(event.request);
      })
      .catch(error => {
        console.log('🔌 Service Worker: Offline, servindo do cache:', event.request.url);
        
        return caches.match(event.request)
          .then(response => {
            if (response) {
              console.log('📦 Service Worker: Servindo do cache (offline):', event.request.url);
              return response;
            }
            
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
