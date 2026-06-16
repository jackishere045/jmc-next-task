const pool = require('../config/db');
const { hitungUsia, hitungMasaKerja } = require('../utils/helpers');
const { logActivity } = require('../middleware/logger');
const path = require('path');
const fs = require('fs');

const getAll = async (req, res) => {
  try {
    const { search, jabatan, masa_kerja_min, masa_kerja_max, status_kontrak, page = 1, limit = 10, sort = 'id', order = 'ASC' } = req.query;

    let where = ['1=1'];
    let params = [];

    if (search) {
      where.push('(p.nama_pegawai LIKE ? OR p.nip LIKE ? OR mj.nama LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (jabatan) {
      const jabatanList = jabatan.split(',');
      where.push(`mj.id IN (${jabatanList.map(() => '?').join(',')})`);
      params.push(...jabatanList);
    }
    if (status_kontrak) {
      where.push('p.status_kontrak = ?');
      params.push(status_kontrak);
    }

    const offset = (page - 1) * limit;
    const allowedSort = ['nip', 'nama_pegawai', 'tanggal_masuk', 'id'];
    const sortCol = allowedSort.includes(sort) ? sort : 'id';

    const sql = `
      SELECT p.*, mj.nama AS jabatan, md.nama AS departemen,
             mw.kecamatan, mw.kabupaten, mw.provinsi
      FROM pegawai p
      LEFT JOIN master_data mj ON p.id_jabatan = mj.id
      LEFT JOIN master_data md ON p.id_departemen = md.id
      LEFT JOIN master_wilayah mw ON p.id_kecamatan = mw.id
      WHERE ${where.join(' AND ')}
      ORDER BY p.${sortCol} ${order === 'DESC' ? 'DESC' : 'ASC'}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(sql, [...params, parseInt(limit), offset]);
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM pegawai p
       LEFT JOIN master_data mj ON p.id_jabatan = mj.id
       WHERE ${where.join(' AND ')}`,
      params
    );

    const data = rows.map(p => ({
      ...p,
      masa_kerja: hitungMasaKerja(p.tanggal_masuk),
      usia: hitungUsia(p.tanggal_lahir),
    }));

    // Filter masa kerja setelah hitung
    const filtered = data.filter(p => {
      if (masa_kerja_min !== undefined && p.masa_kerja < parseInt(masa_kerja_min)) return false;
      if (masa_kerja_max !== undefined && p.masa_kerja > parseInt(masa_kerja_max)) return false;
      return true;
    });

    res.json({ success: true, data: filtered, total: countRows[0].total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, mj.nama AS jabatan, md.nama AS departemen,
              mw.kecamatan, mw.kabupaten, mw.provinsi
       FROM pegawai p
       LEFT JOIN master_data mj ON p.id_jabatan = mj.id
       LEFT JOIN master_data md ON p.id_departemen = md.id
       LEFT JOIN master_wilayah mw ON p.id_kecamatan = mw.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Pegawai tidak ditemukan' });

    const [pendidikan] = await pool.query('SELECT * FROM pegawai_pendidikan WHERE id_pegawai = ?', [req.params.id]);

    res.json({ success: true, data: { ...rows[0], pendidikan, masa_kerja: hitungMasaKerja(rows[0].tanggal_masuk) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      nip, nama_pegawai, email, nomor_hp, tempat_lahir,
      id_kecamatan, alamat_lengkap, jarak_rumah_kantor,
      tanggal_lahir, status_kawin, jumlah_anak,
      tanggal_masuk, id_jabatan, id_departemen,
      status_kontrak, status, pendidikan
    } = req.body;

    const usia = hitungUsia(tanggal_lahir);
    const foto = req.file ? req.file.filename : null;

    // 🔥 KONVERSI status_kawin
    let statusKawinValue = status_kawin;
    if (status_kawin === 'Belum Menikah') statusKawinValue = 'tidak kawin';
    if (status_kawin === 'Menikah') statusKawinValue = 'kawin';

    // Konversi id ke integer atau null
    const kecamatanValue = id_kecamatan && id_kecamatan !== '' ? parseInt(id_kecamatan) : null;
    const jabatanValue = id_jabatan && id_jabatan !== '' ? parseInt(id_jabatan) : null;
    const departemenValue = id_departemen && id_departemen !== '' ? parseInt(id_departemen) : null;

    const [result] = await conn.query(
      `INSERT INTO pegawai (nip, nama_pegawai, email, nomor_hp, tempat_lahir, id_kecamatan,
       alamat_lengkap, jarak_rumah_kantor, tanggal_lahir, status_kawin, jumlah_anak,
       tanggal_masuk, id_jabatan, id_departemen, usia, status_kontrak, status, foto_pegawai)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nip, nama_pegawai, email, nomor_hp, tempat_lahir, kecamatanValue,
       alamat_lengkap, jarak_rumah_kantor, tanggal_lahir, statusKawinValue, jumlah_anak,
       tanggal_masuk, jabatanValue, departemenValue, usia, status_kontrak, status, foto]
    );

    const pegawaiId = result.insertId;

    if (pendidikan && Array.isArray(JSON.parse(pendidikan))) {
      const pend = JSON.parse(pendidikan);
      for (const p of pend) {
        await conn.query(
          'INSERT INTO pegawai_pendidikan (id_pegawai, tingkat_pendidikan, nama_sekolah, tahun_lulus) VALUES (?, ?, ?, ?)',
          [pegawaiId, p.tingkat_pendidikan, p.nama_sekolah, p.tahun_lulus]
        );
      }
    }

    await conn.commit();
    await logActivity({ userId: req.user.id, title: 'Tambah Pegawai', content: { aksi: 'create', nip }, req });

    res.status(201).json({ success: true, message: 'Pegawai berhasil ditambahkan', id: pegawaiId });
  } catch (err) {
    await conn.rollback();
    console.error('Error create pegawai:', err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

const update = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { id } = req.params;

    // Admin HRD tidak boleh hapus/edit pegawai superadmin
    const [target] = await conn.query(
      `SELECT u.id_role FROM pegawai p
       LEFT JOIN \`user\` u ON u.id_pegawai = p.id
       WHERE p.id = ?`,
      [id]
    );
    if (target.length && target[0].id_role === 1 && req.user.id_role === 3) {
      return res.status(403).json({ success: false, message: 'Tidak boleh mengedit data pegawai superadmin' });
    }

    const {
      nip, nama_pegawai, email, nomor_hp, tempat_lahir,
      id_kecamatan, alamat_lengkap, jarak_rumah_kantor,
      tanggal_lahir, status_kawin, jumlah_anak,
      tanggal_masuk, id_jabatan, id_departemen,
      status_kontrak, status, pendidikan
    } = req.body;

    const usia = hitungUsia(tanggal_lahir);
    const foto = req.file ? req.file.filename : undefined;

    // 🔥 KONVERSI status_kawin (sama seperti di create)
    let statusKawinValue = status_kawin;
    if (status_kawin === 'Belum Menikah') statusKawinValue = 'tidak kawin';
    if (status_kawin === 'Menikah') statusKawinValue = 'kawin';

    // Konversi id ke integer atau null
    const kecamatanValue = id_kecamatan && id_kecamatan !== '' ? parseInt(id_kecamatan) : null;
    const jabatanValue = id_jabatan && id_jabatan !== '' ? parseInt(id_jabatan) : null;
    const departemenValue = id_departemen && id_departemen !== '' ? parseInt(id_departemen) : null;

    let sql = `UPDATE pegawai SET nip=?, nama_pegawai=?, email=?, nomor_hp=?, tempat_lahir=?,
               id_kecamatan=?, alamat_lengkap=?, jarak_rumah_kantor=?, tanggal_lahir=?,
               status_kawin=?, jumlah_anak=?, tanggal_masuk=?, id_jabatan=?, id_departemen=?,
               usia=?, status_kontrak=?, status=?`;
    let params = [nip, nama_pegawai, email, nomor_hp, tempat_lahir, kecamatanValue,
                  alamat_lengkap, jarak_rumah_kantor, tanggal_lahir, statusKawinValue, jumlah_anak,
                  tanggal_masuk, jabatanValue, departemenValue, usia, status_kontrak, status];

    if (foto) { sql += ', foto_pegawai=?'; params.push(foto); }
    sql += ' WHERE id=?';
    params.push(id);

    await conn.query(sql, params);

    if (pendidikan) {
      await conn.query('DELETE FROM pegawai_pendidikan WHERE id_pegawai = ?', [id]);
      const pend = JSON.parse(pendidikan);
      for (const p of pend) {
        await conn.query(
          'INSERT INTO pegawai_pendidikan (id_pegawai, tingkat_pendidikan, nama_sekolah, tahun_lulus) VALUES (?, ?, ?, ?)',
          [id, p.tingkat_pendidikan, p.nama_sekolah, p.tahun_lulus]
        );
      }
    }

    await conn.commit();
    await logActivity({ userId: req.user.id, title: 'Update Pegawai', content: { aksi: 'update', id }, req });

    res.json({ success: true, message: 'Data pegawai berhasil diperbarui' });
  } catch (err) {
    await conn.rollback();
    console.error('Error update pegawai:', err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const [target] = await pool.query(
      `SELECT u.id_role FROM pegawai p LEFT JOIN \`user\` u ON u.id_pegawai = p.id WHERE p.id = ?`, [id]
    );
    if (target.length && target[0].id_role === 1) {
      return res.status(403).json({ success: false, message: 'Tidak boleh menghapus data pegawai superadmin' });
    }
    await pool.query('DELETE FROM pegawai WHERE id = ?', [id]);
    await logActivity({ userId: req.user.id, title: 'Hapus Pegawai', content: { aksi: 'delete', id }, req });
    res.json({ success: true, message: 'Pegawai berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const searchNama = async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json({ success: true, data: [] });
  const [rows] = await pool.query(
    'SELECT id, nama_pegawai, nip FROM pegawai WHERE nama_pegawai LIKE ? LIMIT 10',
    [`%${q}%`]
  );
  res.json({ success: true, data: rows });
};

const getWilayah = async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 3) return res.json({ success: true, data: [] });
  const [rows] = await pool.query(
    'SELECT id, kecamatan, kabupaten, provinsi FROM master_wilayah WHERE kecamatan LIKE ? LIMIT 20',
    [`%${q}%`]
  );
  res.json({ success: true, data: rows });
};

const getDashboardStats = async (req, res) => {
  try {
    const [total] = await pool.query("SELECT COUNT(*) as total FROM pegawai WHERE status = 'Aktif'");
    const [kontrak] = await pool.query("SELECT COUNT(*) as total FROM pegawai WHERE status_kontrak = 'kontrak' AND status = 'Aktif'");
    const [tetap] = await pool.query("SELECT COUNT(*) as total FROM pegawai WHERE status_kontrak = 'tetap' AND status = 'Aktif'");
    const [magang] = await pool.query("SELECT COUNT(*) as total FROM pegawai WHERE status_kontrak = 'magang' AND status = 'Aktif'");
    const [gender] = await pool.query("SELECT COUNT(*) as total FROM pegawai WHERE status = 'Aktif'"); // placeholder
    const [terbaru] = await pool.query(
      `SELECT p.id, p.nama_pegawai, p.tanggal_masuk, p.status_kontrak, mj.nama AS jabatan
       FROM pegawai p
       LEFT JOIN master_data mj ON p.id_jabatan = mj.id
       ORDER BY p.tanggal_masuk DESC LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        total: total[0].total,
        kontrak: kontrak[0].total,
        tetap: tetap[0].total,
        magang: magang[0].total,
        terbaru,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// controllers/pegawaiController.js - perbaiki getMyProfile

const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`[GET MY PROFILE] User ID: ${userId}`);

    // Cek dulu tabel user dan role yang tersedia
    // Kemungkinan role ada di tabel user langsung atau terpisah
    
    // Query untuk mendapatkan data pegawai berdasarkan user ID
    const [rows] = await pool.query(
      `SELECT 
        p.id,
        p.nip,
        p.nama_pegawai,
        p.email,
        p.nomor_hp,
        p.tempat_lahir,
        p.alamat_lengkap,
        p.tanggal_lahir,
        p.foto_pegawai,
        p.status_kawin,
        p.jumlah_anak,
        p.tanggal_masuk,
        p.status_kontrak,
        p.status,
        p.usia,
        p.id_jabatan,
        p.id_departemen,
        p.id_kecamatan,
        mj.nama AS jabatan,
        md.nama AS departemen,
        mw.kecamatan,
        mw.kabupaten,
        mw.provinsi,
        u.username,
        u.id_role,
        u.disabled
      FROM pegawai p
      INNER JOIN \`user\` u ON u.id_pegawai = p.id
      LEFT JOIN master_data mj ON p.id_jabatan = mj.id
      LEFT JOIN master_data md ON p.id_departemen = md.id
      LEFT JOIN master_wilayah mw ON p.id_kecamatan = mw.id
      WHERE u.id = ?`,
      [userId]
    );

    if (!rows.length) {
      console.log(`[GET MY PROFILE] No pegawai found for user ID: ${userId}`);
      
      // Coba cari berdasarkan username
      const [userRows] = await pool.query(
        `SELECT u.id, u.username, u.id_role, u.disabled
         FROM \`user\` u
         WHERE u.id = ?`,
        [userId]
      );
      
      if (userRows.length) {
        // Ambil nama role dari user jika ada kolom nama_role
        let roleName = '';
        if (userRows[0].id_role) {
          // Coba cari nama role
          try {
            const [roleRows] = await pool.query(
              'SELECT nama FROM role WHERE id = ?',
              [userRows[0].id_role]
            );
            if (roleRows.length) {
              roleName = roleRows[0].nama;
            }
          } catch (roleErr) {
            console.log('[GET MY PROFILE] Role table error:', roleErr.message);
            // Jika tabel role tidak ada, gunakan id_role sebagai nama
            roleName = `Role ${userRows[0].id_role}`;
          }
        }

        return res.json({
          success: true,
          data: {
            id: null,
            nama_pegawai: userRows[0].username || 'User',
            username: userRows[0].username,
            email: '',
            nomor_hp: '',
            tempat_lahir: '',
            alamat_lengkap: '',
            tanggal_lahir: '',
            foto_pegawai: '',
            jabatan: roleName || '',
            departemen: '',
            is_user_only: true,
            disabled: userRows[0].disabled,
            message: 'Data pegawai belum lengkap, silakan hubungi administrator'
          }
        });
      }
      
      return res.status(404).json({
        success: false,
        message: 'Data pegawai tidak ditemukan'
      });
    }

    const data = rows[0];
    
    // Ambil nama role
    let roleName = '';
    if (data.id_role) {
      try {
        const [roleRows] = await pool.query(
          'SELECT nama FROM role WHERE id = ?',
          [data.id_role]
        );
        if (roleRows.length) {
          roleName = roleRows[0].nama;
        }
      } catch (roleErr) {
        console.log('[GET MY PROFILE] Role table error:', roleErr.message);
        roleName = `Role ${data.id_role}`;
      }
    }
    
    // Format response
    const result = {
      id: data.id,
      nip: data.nip || '-',
      nama_pegawai: data.nama_pegawai || '',
      email: data.email || '',
      nomor_hp: data.nomor_hp || '',
      tempat_lahir: data.tempat_lahir || '',
      alamat_lengkap: data.alamat_lengkap || '',
      tanggal_lahir: data.tanggal_lahir ? new Date(data.tanggal_lahir).toISOString().split('T')[0] : '',
      foto_pegawai: data.foto_pegawai || '',
      status_kawin: data.status_kawin || '',
      jumlah_anak: data.jumlah_anak || 0,
      tanggal_masuk: data.tanggal_masuk ? new Date(data.tanggal_masuk).toISOString().split('T')[0] : '',
      status_kontrak: data.status_kontrak || '',
      status: data.status || '',
      usia: data.usia || 0,
      jabatan: data.jabatan || '',
      departemen: data.departemen || '',
      kecamatan: data.kecamatan || '',
      kabupaten: data.kabupaten || '',
      provinsi: data.provinsi || '',
      username: data.username || '',
      role: roleName || '',
      id_role: data.id_role || '',
      disabled: data.disabled,
      masa_kerja: hitungMasaKerja(data.tanggal_masuk)
    };

    console.log(`[GET MY PROFILE] Success for user: ${data.nama_pegawai}`);
    res.json({ success: true, data: result });
    
  } catch (err) {
    console.error('[GET MY PROFILE] Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Gagal mengambil data profil'
    });
  }
};

// Tambahkan juga fungsi untuk update profile sendiri
const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`[UPDATE MY PROFILE] User ID: ${userId}`);

    // Cari pegawai ID dari user
    const [userRows] = await pool.query(
      'SELECT id_pegawai FROM `user` WHERE id = ?',
      [userId]
    );

    if (!userRows.length || !userRows[0].id_pegawai) {
      return res.status(404).json({
        success: false,
        message: 'Data pegawai tidak ditemukan'
      });
    }

    const pegawaiId = userRows[0].id_pegawai;
    const {
      nama_pegawai,
      email,
      nomor_hp,
      tempat_lahir,
      alamat_lengkap,
      tanggal_lahir
    } = req.body;

    // Validasi
    if (!nama_pegawai) {
      return res.status(400).json({
        success: false,
        message: 'Nama pegawai wajib diisi'
      });
    }

    // Update data
    let foto = null;
    if (req.file) {
      foto = req.file.filename;
    }

    let sql = `UPDATE pegawai SET 
      nama_pegawai = ?,
      email = ?,
      nomor_hp = ?,
      tempat_lahir = ?,
      alamat_lengkap = ?,
      tanggal_lahir = ?`;
    
    let params = [nama_pegawai, email, nomor_hp, tempat_lahir, alamat_lengkap, tanggal_lahir];

    if (foto) {
      sql += ', foto_pegawai = ?';
      params.push(foto);
    }

    sql += ' WHERE id = ?';
    params.push(pegawaiId);

    await pool.query(sql, params);

    // Log activity
    await logActivity({
      userId: req.user.id,
      title: 'Update Profile',
      content: { aksi: 'update_profile', pegawaiId },
      req
    });

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui'
    });

  } catch (err) {
    console.error('[UPDATE MY PROFILE] Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Gagal memperbarui profil'
    });
  }
};

module.exports = { getAll, getById, create, update, remove, searchNama, getWilayah, getDashboardStats, getMyProfile, updateMyProfile};