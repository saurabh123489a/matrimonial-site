// Service Worker for Push Notifications
const CACHE_NAME = 'matrimonial-v1';
const urlsToCache = [
  '/',
  '/notifications',
  '/messages',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'New Notification',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'notification',
    data: {
      url: '/notifications',
    },
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        image: data.image,
        tag: data.tag || notificationData.tag,
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false,
        data: {
          ...notificationData.data,
          ...data.data,
          url: data.data?.url || data.url || '/notifications',
        },
      };
    } catch (e) {
      console.error('Error parsing push data:', e);
    }
  }

  // Mobile-optimized notification options
  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    image: notificationData.image,
    tag: notificationData.tag,
    requireInteraction: notificationData.requireInteraction,
    silent: notificationData.silent,
    data: notificationData.data,
    vibrate: [200, 100, 200],
    // Mobile-friendly actions
    actions: [
      {
        action: 'open',
        title: 'Open',
        icon: '/icon-192x192.png',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
    // Mobile-specific options
    dir: 'auto', // Support RTL languages
    lang: 'en',
    renotify: true, // Re-notify if tag matches
    sticky: false, // Don't require user interaction on mobile
  };

  const promiseChain = self.registration.showNotification(notificationData.title, notificationOptions);

  event.waitUntil(promiseChain);
});

// Notification click event - handle user clicking on notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/notifications';
  const baseUrl = self.location.origin;

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ 
        type: 'window', 
        includeUncontrolled: true 
      })
        .then((clientList) => {
          // Check if there's already a window/tab open
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            // Check if client URL matches or is on the same origin
            if (client.url.startsWith(baseUrl) && 'focus' in client) {
              // Focus existing window and navigate if needed
              client.focus();
              // Try to navigate to the notification URL
              if ('navigate' in client && client.navigate) {
                return client.navigate(urlToOpen);
              }
              return Promise.resolve();
            }
          }
          // If no window is open, open a new one
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
        .catch((error) => {
          console.error('Error handling notification click:', error);
          // Fallback: try to open window anyway
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  }
});

// Background sync (optional - for offline support)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(
      // Sync notifications when back online
      fetch('/api/notifications')
        .then((response) => response.json())
        .catch((error) => {
          console.error('Sync failed:', error);
        })
    );
  }
});

