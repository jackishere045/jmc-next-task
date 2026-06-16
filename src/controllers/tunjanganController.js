const pool = require('../config/db');
const { logActivity } = require('../middleware/logger');

// ── Setting Tunjangan ──────────────────────────────────────

const getSetting = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM setting_tunjangan ORDER BY berlaku_mulai DESC');
  res.json({ success: true, data: rows });
};

const createSetting = async (req, res) => {
  const { base_fare, berlaku_mulai, min_km, max_km } = req.body;
  try {
    await pool.query(
      'INSERT INTO setting_tunjangan (base_fare, berlaku_mulai, min_km, max_km, created_by) VALUES (?, ?, ?, ?, ?)',
      [base_fare, berlaku_mulai, min_km, max_km, req.user.id]
    );
    await logActivity({ userId: req.user.id, title: 'Tambah Setting Tunjangan', content: { aksi: 'create' }, req });
    res.status(201).json({ success: true, message: 'Setting tunjangan berhasil disimpan' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateSetting = async (req, res) => {
  const { base_fare, berlaku_mulai, min_km, max_km } = req.body;
  try {
    await pool.query(
      'UPDATE setting_tunjangan SET base_fare=?, berlaku_mulai=?, min_km=?, max_km=? WHERE id=?',
      [base_fare, berlaku_mulai, min_km, max_km, req.params.id]
    );
    await logActivity({ userId: req.user.id, title: 'Update Setting Tunjangan', content: { aksi: 'update' }, req });
    res.json({ success: true, message: 'Setting tunjangan berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteSetting = async (req, res) => {
  try {
    await pool.query('DELETE FROM setting_tunjangan WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Setting berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Tunjangan Transport ────────────────────────────────────

const getDaftarBulan = async (req, res) => {
  const { tahun = new Date().getFullYear() } = req.query;
  try {
    const [rows] = await pool.query(
      `SELECT bulan, tahun,
              COUNT(*) AS total_penerima,
              SUM(nominal) AS total_nominal
       FROM tunjangan_transport
       WHERE tahun = ?
       GROUP BY bulan, tahun
       ORDER BY bulan ASC`,
      [tahun]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getDetailBulan = async (req, res) => {
  const { bulan, tahun } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT tt.*, p.nama_pegawai
       FROM tunjangan_transport tt
       LEFT JOIN pegawai p ON tt.id_pegawai = p.id
       WHERE tt.bulan = ? AND tt.tahun = ?
       ORDER BY p.nama_pegawai ASC`,
      [bulan, tahun]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @swagger
 * /tunjangan/hitung/{bulan}/{tahun}:
 *   post:
 *     summary: Hitung tunjangan transport semua pegawai tetap pada bulan/tahun tertentu
 *     tags: [Tunjangan Transport]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bulan
 *         schema: { type: integer }
 *         required: true
 *       - in: path
 *         name: tahun
 *         schema: { type: integer }
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data_kehadiran:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id_pegawai: { type: integer }
 *                     hari_masuk: { type: integer }
 *     responses:
 *       200:
 *         description: Hasil perhitungan tunjangan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_pegawai: { type: integer }
 *                       nama_pegawai: { type: string }
 *                       km: { type: number }
 *                       hari_masuk: { type: integer }
 *                       nominal: { type: number }
 */
const hitungTunjangan = async (req, res) => {
  const { bulan, tahun } = req.params;
  const { data_kehadiran } = req.body; // [{ id_pegawai, hari_masuk }]

  try {
    // Ambil setting tunjangan yang berlaku pada bulan/tahun ini
    const periodeAkhir = `${tahun}-${String(bulan).padStart(2, '0')}-28`;
    const [settings] = await pool.query(
      `SELECT * FROM setting_tunjangan
       WHERE berlaku_mulai <= ?
       ORDER BY berlaku_mulai DESC LIMIT 1`,
      [periodeAkhir]
    );

    if (!settings.length) {
      return res.status(400).json({ success: false, message: 'Belum ada setting tunjangan yang berlaku' });
    }

    const setting = settings[0];
    const { base_fare, min_km, max_km } = setting;

    // Ambil semua pegawai tetap yang aktif
    const [pegawaiTetap] = await pool.query(
      `SELECT id, nama_pegawai, jarak_rumah_kantor
       FROM pegawai
       WHERE status_kontrak = 'tetap' AND status = 'Aktif'`
    );

    // Map kehadiran
    const kehadiranMap = {};
    if (data_kehadiran) {
      for (const d of data_kehadiran) {
        kehadiranMap[d.id_pegawai] = d.hari_masuk;
      }
    }

    const hasil = [];
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      for (const p of pegawaiTetap) {
        const hariMasuk = kehadiranMap[p.id] ?? 0;

        // Aturan: minimal 19 hari kerja
        if (hariMasuk < 19) continue;

        const jarakRaw = p.jarak_rumah_kantor || 0;

        // Aturan jarak minimal 5 km
        if (jarakRaw <= min_km) continue;

        // Aturan jarak maksimal 25 km — lebih dari itu dikap di max_km
        const km = Math.min(jarakRaw, max_km);

        // Pembulatan: < 0.5 ke bawah, >= 0.5 ke atas
        const kmBulat = Math.floor(km) + (km - Math.floor(km) >= 0.5 ? 1 : 0);

        const nominal = base_fare * kmBulat * hariMasuk;

        // Upsert ke tabel tunjangan_transport
        await conn.query(
          `INSERT INTO tunjangan_transport (id_pegawai, bulan, tahun, km, hari_masuk, nominal, id_setting)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE km=VALUES(km), hari_masuk=VALUES(hari_masuk), nominal=VALUES(nominal), id_setting=VALUES(id_setting)`,
          [p.id, bulan, tahun, kmBulat, hariMasuk, nominal, setting.id]
        );

        hasil.push({ id_pegawai: p.id, nama_pegawai: p.nama_pegawai, km: kmBulat, hari_masuk: hariMasuk, nominal });
      }

      await conn.commit();
      await logActivity({ userId: req.user.id, title: 'Hitung Tunjangan', content: { aksi: 'create', bulan, tahun }, req });

      res.json({ success: true, message: `Tunjangan bulan ${bulan}/${tahun} berhasil dihitung`, data: hasil });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getSetting, createSetting, updateSetting, deleteSetting, getDaftarBulan, getDetailBulan, hitungTunjangan };