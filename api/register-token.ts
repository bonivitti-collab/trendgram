import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

function admin() {
  if (!getApps().length) initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') }) });
  return { db: getFirestore(), messaging: getMessaging() };
}
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const token = String(req.body?.token || '');
  if (!token || token.length < 20) return res.status(400).json({ error: 'Invalid token' });
  try { const { db } = admin(); await db.collection('pushTokens').doc(Buffer.from(token).toString('base64url').slice(0, 120)).set({ token, updatedAt: new Date().toISOString() }, { merge: true }); return res.status(200).json({ ok: true }); } catch (error) { return res.status(500).json({ error: error instanceof Error ? error.message : 'Registration failed' }); }
}
