import { promises as fs } from 'fs';
import path from 'path';

const LICENSES_PATH = path.join(process.cwd(), 'licenses.json');

export default async function handler(req, res) {
  const { key, device_id } = req.query;
  if (!key || !device_id) {
    return res.status(400).json({ valid: false, message: 'Missing key or device_id' });
  }

  try {
    const text = await fs.readFile(LICENSES_PATH, 'utf8');
    const licenses = JSON.parse(text);
    const idx = licenses.findIndex(l => l.key === key);

    if (idx === -1) {
      return res.status(403).json({ valid: false, message: 'Lisensi tidak ditemukan' });
    }

    const lic = licenses[idx];
    if (!lic.device_id) {
      licenses[idx].device_id = device_id;
      await fs.writeFile(LICENSES_PATH, JSON.stringify(licenses, null, 2));
      return res.json({ valid: true, message: 'Lisensi berhasil diikat ke device ini' });
    }

    if (lic.device_id === device_id) {
      return res.json({ valid: true, message: 'Lisensi valid' });
    } else {
      return res.status(403).json({ valid: false, message: 'Lisensi sudah digunakan di device lain' });
    }
  } catch (err) {
    return res.status(500).json({ valid: false, message: 'Server error' });
  }
}
