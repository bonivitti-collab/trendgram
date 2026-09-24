import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

function admin() { if (!getApps().length) initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') }) }); return { db: getFirestore(), messaging: getMessaging() }; }
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).json({ error: 'Unauthorized' });
  try { const { db, messaging } = admin(); const snapshot = await db.collection('pushTokens').get(); const tokens = snapshot.docs.map((doc) => String(doc.data().token)).filter(Boolean); if (!tokens.length) return res.status(200).json({ ok: true, sent: 0 }); const result = await messaging.sendEachForMulticast({ tokens, notification: { title: 'Trendgram · nova análise', body: 'A análise das 19h está disponível.' }, webpush: { fcmOptions: { link: 'https://bonivitti-collab.github.io/trendgram/' }, notification: { icon: '/trendgram/icon.svg', tag: 'trendgram-daily-analysis' } } }); result.responses.forEach((item, index) => { if (!item.success && item.error?.code?.includes('registration-token-not-registered')) void snapshot.docs[index].ref.delete(); }); return res.status(200).json({ ok: true, sent: result.successCount, failed: result.failureCount }); } catch (error) { return res.status(500).json({ error: error instanceof Error ? error.message : 'Push failed' }); }
}
