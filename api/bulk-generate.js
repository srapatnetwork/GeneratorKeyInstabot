// /api/bulk-generate.js

const express = require('express');
const shortid = require('shortid');
const admin = require('firebase-admin');
const cors = require('cors');

const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// Validasi URL
function isValidUrl(url) {
  const regex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  return regex.test(url);
}

// Endpoint untuk generate shortlinks secara bulk
app.post('/bulk-generate', async (req, res) => {
  const { longUrl, total } = req.body;
  const count = parseInt(total) || 100;
  if (!longUrl) return res.status(400).json({ error: 'longUrl wajib diisi' });
  if (!isValidUrl(longUrl)) return res.status(400).json({ error: 'URL tidak valid' });

  try {
    const links = [];
    const batch = db.batch();

    for (let i = 0; i < count; i++) {
      const shortId = shortid.generate();
      const docRef = db.collection('links').doc(shortId);
      batch.set(docRef, { longUrl });
      links.push(`https://your-vercel-url.vercel.app/api/${shortId}`);
    }

    await batch.commit();
    res.json({ links });
  } catch (err) {
    res.status(500).json({ error: 'Gagal generate link', details: err.message });
  }
});

// Ekspor aplikasi Express
module.exports = app;
