import { getApps, initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export async function setupFirebaseMessaging() {
  if (!config.apiKey || !config.projectId || !config.messagingSenderId || !config.appId) return null;
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !(await isSupported())) return null;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;
  const app = getApps().length ? getApps()[0] : initializeApp(config);
  const registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}firebase-messaging-sw.js`, { scope: import.meta.env.BASE_URL });
  const messaging = getMessaging(app);
  const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY, serviceWorkerRegistration: registration });
  onMessage(messaging, (payload) => { if (Notification.permission === 'granted') new Notification(payload.notification?.title || 'Trendgram · nova análise', { body: payload.notification?.body || 'A análise das 19h está disponível.', icon: `${import.meta.env.BASE_URL}icon.svg` }); });
  return token;
}
