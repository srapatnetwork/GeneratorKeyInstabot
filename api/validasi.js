export default async function handler(req, res) {
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ valid: false, message: "License key diperlukan" });
  }

  try {
    const resp = await fetch(`https://czajokwlkqwklzljszmh.supabase.co/rest/v1/license?key=eq.${key}`, {
      headers: {
        apikey: process.env.SUPABASE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
      },
    });

    const data = await resp.json();

    if (!data.length) {
      return res.status(404).json({ valid: false, message: "Lisensi tidak ditemukan" });
    }

    const lisensi = data[0];
    const now = new Date();
    const expired = new Date(lisensi.expired_at);

    if (expired < now) {
      return res.status(403).json({ valid: false, message: "Lisensi telah kedaluwarsa" });
    }

    return res.status(200).json({ valid: true, message: "Lisensi valid" });
  } catch (e) {
    return res.status(500).json({ valid: false, message: "Server error" });
  }
}
