const express = require('express');
const shortid = require('shortid');
const admin = require('firebase-admin');
const cors = require('cors');

// Pastikan kamu sudah menambahkan file serviceAccountKey.json
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

// Endpoint: Generate banyak shortlink
app.post("/api/bulk-generate", async (req, res) => {  // Pastikan ada `/api/`
  const { longUrl, total } = req.body;
  const count = parseInt(total) || 100;
  if (!longUrl) return res.status(400).json({ error: "longUrl wajib diisi" });
  if (!isValidUrl(longUrl)) return res.status(400).json({ error: "URL tidak valid" });

  try {
    const links = [];
    const batch = db.batch();

    for (let i = 0; i < count; i++) {
      const shortId = shortid.generate();
      const docRef = db.collection("links").doc(shortId);
      batch.set(docRef, { longUrl });
      links.push(`https://your-app.vercel.app/${shortId}`);
    }

    await batch.commit();
    res.json({ links });
  } catch (err) {
    res.status(500).json({ error: "Gagal generate link", details: err.message });
  }
});

// Endpoint: Redirect
app.get("/:shortId", async (req, res) => {
  const { shortId } = req.params;
  try {
    const doc = await db.collection("links").doc(shortId).get();
    if (doc.exists) {
      res.redirect(doc.data().longUrl);
    } else {
      res.status(404).send("Link tidak ditemukan");
    }
  } catch (err) {
    res.status(500).send("Server error");
  }
});

module.exports = app;
