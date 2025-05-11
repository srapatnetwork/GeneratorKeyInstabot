// api/bulk-generate.js
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import shortid from 'shortid';

const serviceAccount = JSON.parse(
  process.env.SERVICE_ACCOUNT_KEY_JSON || '{}'  
);

if (!initializeApp.length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}
const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { longUrl, total } = req.body;
  const count = parseInt(total) || 100;
  if (!longUrl || !/^https?:\/\/\S+$/i.test(longUrl)) {
    return res.status(400).json({ error: 'URL tidak valid atau kosong' });
  }

  try {
    const links = [];
    const batch = db.batch();
    for (let i = 0; i < count; i++) {
      const id = shortid.generate();
      const ref = db.collection('links').doc(id);
      batch.set(ref, { longUrl });
      links.push(`${req.headers['x-forwarded-proto']}://${req.headers.host}/${id}`);
    }
    await batch.commit();
    res.status(200).json({ links });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
