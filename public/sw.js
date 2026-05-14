// Service Worker — AI Oil & Gas Conference
// Handles Web Push notifications. Kept intentionally minimal (no offline cache
// here; that can be added later without touching push behaviour).

self.addEventListener('install', () => {
  // Activate this SW immediately, don't wait for old tabs to close.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_e) {
    payload = { title: 'AI Oil & Gas', body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'AI Oil & Gas Conference';
  const options = {
    body: payload.body || '',
    icon: '/icons/icon.svg',
    badge: '/icons/icon.svg',
    tag: payload.tag || 'aiog-notification',
    renotify: true,
    data: { url: payload.url || '/now' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/now';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus an already-open tab if one exists.
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) client.navigate(targetUrl);
          return;
        }
      }
      // Otherwise open a new window.
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    }),
  );
});
