import express from "express";
import cors from "cors";
import shortid from "shortid";
import admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/bulk-generate", async (req, res) => {
  const { longUrl, total } = req.body;
  const count = parseInt(total) || 100;
  if (!longUrl) return res.status(400).json({ error: "longUrl wajib diisi" });

  try {
    const links = [];
    const batch = db.batch();

    for (let i = 0; i < count; i++) {
      const shortId = shortid.generate();
      const docRef = db.collection("links").doc(shortId);
      batch.set(docRef, { longUrl });
      links.push(`https://onlbio.web.app/${shortId}`);
    }

    await batch.commit();
    res.status(200).json({ links });
  } catch (err) {
    res.status(500).json({ error: "Gagal generate link", details: err.message });
  }
});

export default app;
