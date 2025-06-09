import { useState } from 'react';

export default function GenerateLicense() {
  const [key, setKey] = useState('');
  const [days, setDays] = useState(30);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!key || days <= 0) {
      return setMessage("Key tidak boleh kosong dan durasi harus lebih dari 0 hari.");
    }

    setLoading(true);
    setMessage("");

    const expired_at = new Date(Date.now() + days * 86400000).toISOString();

    try {
      const res = await fetch(`https://czajokwlkqwklzljszmh.supabase.co/rest/v1/license`, {
        method: 'POST',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_KEY,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({ key, expired_at }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Lisensi berhasil dibuat:\n${JSON.stringify(data, null, 2)}`);
        setKey('');
        setDays(30);
      } else {
        setMessage(`❌ Gagal membuat lisensi:\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setMessage(`❌ Error jaringan atau server: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h2>Generator Lisensi</h2>
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          placeholder="License key"
          value={key}
          onChange={e => setKey(e.target.value)}
          style={{ padding: 5, marginRight: 10 }}
        />
        <input
          type="number"
          value={days}
          onChange={e => setDays(Number(e.target.value))}
          style={{ padding: 5, width: 60 }}
        />
        <span style={{ marginLeft: 5 }}>hari</span>
      </div>
      <button onClick={generate} disabled={loading} style={{ padding: '6px 12px' }}>
        {loading ? 'Memproses...' : 'Generate'}
      </button>
      <pre style={{ marginTop: 20, whiteSpace: 'pre-wrap' }}>{message}</pre>
    </div>
  );
}
