importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'REPLACE_FIREBASE_API_KEY',
  authDomain: 'REPLACE_FIREBASE_AUTH_DOMAIN',
  projectId: 'REPLACE_FIREBASE_PROJECT_ID',
  storageBucket: 'REPLACE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'REPLACE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'REPLACE_FIREBASE_APP_ID'
});
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => self.registration.showNotification(payload.notification?.title || 'Trendgram · nova análise', { body: payload.notification?.body || 'A análise das 19h está disponível.', icon: '/trendgram/icon.svg', badge: '/trendgram/icon.svg', tag: 'trendgram-daily-analysis', renotify: true, data: { url: '/trendgram/' } }));
self.addEventListener('notificationclick', (event) => { event.notification.close(); event.waitUntil(clients.openWindow(event.notification.data?.url || '/trendgram/')); });
