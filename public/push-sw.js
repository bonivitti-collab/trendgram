self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = { title: 'Trendgram · nova análise', body: 'A análise das 19h está disponível.', url: '/trendgram/' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // Use the default notification when the push payload is not JSON.
  }
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/trendgram/icon.svg',
    badge: '/trendgram/icon.svg',
    tag: 'trendgram-daily-analysis',
    renotify: true,
    data: { url: data.url }
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/trendgram/';
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    const existing = windows.find((client) => 'focus' in client);
    if (existing) {
      existing.navigate(url);
      return existing.focus();
    }
    return clients.openWindow(url);
  }));
});
