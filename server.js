const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const basicAuth = require('basic-auth');

dotenv.config();
const app = express();
app.use(express.json());

app.use('/generate', (req, res, next) => {
  const credentials = basicAuth(req);
  if (!credentials || credentials.name !== process.env.ADMIN_USERNAME || credentials.pass !== process.env.ADMIN_PASSWORD) {
    res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).send('Unauthorized');
  }
  next();
});

app.post('/generate', async (req, res) => {
  const { key, days = 30 } = req.query;
  const expired_at = new Date(Date.now() + days * 86400000).toISOString();

  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/license`, {
      method: 'POST',
      headers: {
        apikey: process.env.SUPABASE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({ key, expired_at })
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal membuat lisensi' });
  }
});

app.get('/validasi', async (req, res) => {
  const { key } = req.query;
  if (!key) return res.status(400).json({ valid: false, message: 'Key diperlukan' });

  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/license?key=eq.${key}`, {
      headers: {
        apikey: process.env.SUPABASE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_KEY}`
      }
    });

    const data = await response.json();
    if (!data.length) return res.status(404).json({ valid: false, message: 'Key tidak ditemukan' });

    const expired = new Date(data[0].expired_at);
    if (expired < new Date()) return res.status(403).json({ valid: false, message: 'Key expired' });

    res.json({ valid: true, message: 'Key valid' });
  } catch (err) {
    res.status(500).json({ valid: false, message: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
