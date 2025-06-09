export default async function handler(req, res) {
  const { key, device_id } = req.query;

  if (!key || !device_id) {
    return res.status(400).json({ valid: false, message: "License key dan device_id diperlukan" });
  }

  try {
    const resp = await fetch(`https://czajokwlkqwklzljszmh.supabase.co/rest/v1/license?key=eq.${key}&select=*`, {
      headers: {
        apikey: process.env.SUPABASE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
        "Content-Type": "application/json"
      },
    });

    if (!resp.ok) {
      return res.status(resp.status).json({ valid: false, message: "Gagal mengakses database lisensi" });
    }

    const data = await resp.json();

    if (!data || !data.length) {
      return res.status(404).json({ valid: false, message: "Lisensi tidak ditemukan" });
    }

    const lisensi = data[0];
    const now = new Date();
    const expired = new Date(lisensi.expired_at);

    if (expired < now) {
      return res.status(403).json({ valid: false, message: "Lisensi telah kedaluwarsa" });
    }

    // 1. Jika device_id belum pernah di-set, lock ke device pertama
    if (!lisensi.device_id) {
      const updateResp = await fetch(`https://czajokwlkqwklzljszmh.supabase.co/rest/v1/license?key=eq.${key}`, {
        method: "PATCH",
        headers: {
          apikey: process.env.SUPABASE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ device_id })
      });

      if (!updateResp.ok) {
        return res.status(500).json({ valid: false, message: "Gagal mengunci lisensi ke perangkat" });
      }

      return res.status(200).json({ valid: true, message: "Lisensi valid dan telah dikunci ke perangkat ini" });
    }

    // 2. Jika device_id sudah di-set, harus sama
    if (lisensi.device_id !== device_id) {
      return res.status(403).json({ valid: false, message: "Lisensi digunakan di perangkat lain" });
    }

    // Valid
    return res.status(200).json({ valid: true, message: "Lisensi valid untuk perangkat ini" });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ valid: false, message: "Terjadi kesalahan server" });
  }
}
