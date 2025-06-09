import { useState } from 'react';

export default function GenerateLicense() {
  const [key, setKey] = useState('');
  const [days, setDays] = useState(30);
  const [message, setMessage] = useState('');

  const generate = async () => {
    const expired_at = new Date(Date.now() + days * 86400000).toISOString();

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
      setMessage(`Lisensi berhasil dibuat: ${JSON.stringify(data)}`);
    } else {
      setMessage(`Gagal: ${JSON.stringify(data)}`);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Generator Lisensi</h1>
      <input placeholder="License key" value={key} onChange={e => setKey(e.target.value)} />
      <input type="number" value={days} onChange={e => setDays(e.target.value)} />
      <button onClick={generate}>Generate</button>
      <pre>{message}</pre>
    </div>
  );
}
