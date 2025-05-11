// api/[shortId].js
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY_JSON || '{}');
if (!initializeApp.length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}
const db = getFirestore();

export default async function handler(req, res) {
  const { shortId } = req.query;
  try {
    const doc = await db.collection('links').doc(shortId).get();
    if (!doc.exists) return res.status(404).send('Link tidak ditemukan');
    res.redirect(doc.data().longUrl);
  } catch {
    res.status(500).send('Server error');
  }
}
