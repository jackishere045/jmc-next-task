const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { logActivity } = require('../middleware/logger');

// HAPUS baris: const { v4: uuidv4 } = require('uuid');

// Simpan captcha di memory
const captchaStore = new Map();

const getCaptcha = (req, res) => {
  try {
    // Generate captcha 5 karakter
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let captcha = '';
    for (let i = 0; i < 5; i++) {
      captcha += chars[Math.floor(Math.random() * chars.length)];
    }

    // Generate session ID MANUAL (tanpa uuid)
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    const sessionId = timestamp + random;

    // Simpan ke memory
    captchaStore.set(sessionId, { 
      text: captcha, 
      exp: Date.now() + 5 * 60 * 1000 // 5 menit
    });

    // Bersihkan expired captcha
    for (const [key, value] of captchaStore) {
      if (value.exp < Date.now()) {
        captchaStore.delete(key);
      }
    }

    console.log('✅ Captcha generated:', { sessionId, captcha });

    res.json({ 
      success: true, 
      sessionId, 
      captcha 
    });
  } catch (error) {
    console.error('❌ Error generating captcha:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal generate captcha' 
    });
  }
};

const login = async (req, res) => {
  const { identifier, password, captcha, captchaSessionId, rememberMe } = req.body;

  // Validasi captcha
  const stored = captchaStore.get(captchaSessionId);
  if (!stored || stored.text !== captcha?.toUpperCase() || stored.exp < Date.now()) {
    captchaStore.delete(captchaSessionId);
    return res.status(400).json({ success: false, message: 'Captcha salah atau kadaluarsa' });
  }
  captchaStore.delete(captchaSessionId);

  try {
    // Cari user by username, email, atau nomor_hp
    const [rows] = await pool.query(
      `SELECT u.*, ur.nama_role FROM \`user\` u
       LEFT JOIN user_role ur ON u.id_role = ur.id
       WHERE u.username = ? OR u.email = ? OR u.nomor_hp = ?`,
      [identifier, identifier, identifier]
    );

    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Username/email/no HP tidak ditemukan' });
    }

    const user = rows[0];

    if (user.disabled === 1) {
      return res.status(401).json({ success: false, message: 'Akun Anda dinonaktifkan' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Password salah' });
    }

    const expiresIn = rememberMe ? '30d' : process.env.JWT_EXPIRES_IN;

    const token = jwt.sign(
      { id: user.id, username: user.username, id_role: user.id_role, nama: user.nama },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Simpan token ke last_session
    await pool.query(
      'UPDATE `user` SET last_session = ?, last_login = NOW() WHERE id = ?',
      [token, user.id]
    );

    await logActivity({
      userId: user.id,
      title: 'Login',
      content: { aksi: 'login', user: user.username },
      req,
    });

    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        email: user.email,
        id_role: user.id_role,
        nama_role: user.nama_role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const logout = async (req, res) => {
  try {
    await pool.query('UPDATE `user` SET last_session = NULL WHERE id = ?', [req.user.id]);

    await logActivity({
      userId: req.user.id,
      title: 'Logout',
      content: { aksi: 'logout', user: req.user.username },
      req,
    });

    res.json({ success: true, message: 'Logout berhasil' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.nama, u.email, u.nomor_hp, u.id_role, ur.nama_role,
              u.id_pegawai, u.last_login
       FROM \`user\` u
       LEFT JOIN user_role ur ON u.id_role = ur.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!rows.length) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

    // Ambil permissions
    const [perms] = await pool.query(
      'SELECT * FROM role_permission WHERE id_role = ?',
      [req.user.id_role]
    );

    res.json({ success: true, data: { ...rows[0], permissions: perms } });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  const { nama, email, nomor_hp, password_lama, password_baru } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM `user` WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

    const user = rows[0];
    const updates = { nama, email, nomor_hp };

    if (password_baru) {
      if (!password_lama) return res.status(400).json({ success: false, message: 'Password lama wajib diisi' });
      const valid = await bcrypt.compare(password_lama, user.password_hash);
      if (!valid) return res.status(400).json({ success: false, message: 'Password lama salah' });

      const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{}]).{8,}$/;
      if (!passRegex.test(password_baru)) {
        return res.status(400).json({
          success: false,
          message: 'Password baru minimal 8 karakter, harus ada huruf besar, kecil, angka, dan karakter khusus',
        });
      }
      updates.password_hash = await bcrypt.hash(password_baru, 12);
    }

    const fields = Object.entries(updates).filter(([, v]) => v !== undefined);
    const sql = `UPDATE \`user\` SET ${fields.map(([k]) => `${k} = ?`).join(', ')} WHERE id = ?`;
    await pool.query(sql, [...fields.map(([, v]) => v), req.user.id]);

    await logActivity({ 
      userId: req.user.id, 
      title: 'Update Profile', 
      content: { aksi: 'update', modul: 'profile' }, 
      req 
    });

    res.json({ success: true, message: 'Profil berhasil diperbarui' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

module.exports = { getCaptcha, login, logout, getMe, updateProfile };