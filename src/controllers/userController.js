const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { generatePassword } = require('../utils/helpers');
const { logActivity } = require('../middleware/logger');

const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', status = '', sort = 'id', order = 'ASC' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT u.id, u.username, u.nama, u.email, u.disabled, u.created_at,
             ur.nama_role, ur.deskripsi,
             md_j.nama AS jabatan, md_d.nama AS departemen,
             p.nama_pegawai
      FROM \`user\` u
      LEFT JOIN user_role ur ON u.id_role = ur.id
      LEFT JOIN pegawai p ON u.id_pegawai = p.id
      LEFT JOIN master_data md_j ON p.id_jabatan = md_j.id
      LEFT JOIN master_data md_d ON p.id_departemen = md_d.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (u.nama LIKE ? OR u.username LIKE ? OR p.nama_pegawai LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    
    if (role) {
      query += ` AND u.id_role = ?`;
      params.push(role);
    }
    
    if (status !== '') {
      query += ` AND u.disabled = ?`;
      params.push(status === '1' ? 0 : 1);
    }
    
    // Count total
    const countQuery = query.replace(
      /SELECT u\.id, u\.username, u\.nama, u\.email, u\.disabled, u\.created_at, ur\.nama_role, ur\.deskripsi, md_j\.nama AS jabatan, md_d\.nama AS departemen, p\.nama_pegawai/,
      'SELECT COUNT(*) as total'
    );
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0]?.total || 0;
    
    // Add order and limit
    query += ` ORDER BY u.${sort} ${order} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await pool.query(query, params);
    
    res.json({ 
      success: true, 
      data: rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.nama, u.email, u.id_role, u.id_pegawai, u.disabled,
              p.nama_pegawai, p.nip
       FROM \`user\` u
       LEFT JOIN pegawai p ON u.id_pegawai = p.id
       WHERE u.id = ?`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  const { id_pegawai, username, id_role, password, disabled } = req.body;

  try {
    // Cek username unik
    const [exist] = await pool.query('SELECT id FROM `user` WHERE username = ?', [username]);
    if (exist.length) {
      return res.status(400).json({ success: false, message: 'Username sudah digunakan' });
    }

    // Ambil data dari pegawai
    const [pegawai] = await pool.query('SELECT nama_pegawai, email, nomor_hp FROM pegawai WHERE id = ?', [id_pegawai]);
    if (!pegawai.length) {
      return res.status(400).json({ success: false, message: 'Pegawai tidak ditemukan' });
    }

    const hashed = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      `INSERT INTO \`user\` (id_role, id_pegawai, username, password_hash, nama, email, disabled, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id_role, id_pegawai, username, hashed, pegawai[0].nama_pegawai, pegawai[0].email, disabled ? 1 : 0]
    );

    await logActivity({ 
      userId: req.user.id, 
      title: 'Tambah User', 
      content: { aksi: 'create', username, id_pegawai }, 
      req 
    });

    res.status(201).json({ 
      success: true, 
      message: 'User berhasil dibuat',
      data: { id: result.insertId }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  const { username, id_role, disabled } = req.body;
  const targetId = req.params.id;

  // Tidak boleh menonaktifkan diri sendiri
  if (parseInt(targetId) === req.user.id && disabled === 1) {
    return res.status(400).json({ 
      success: false, 
      message: 'Tidak boleh menonaktifkan akun sendiri' 
    });
  }

  try {
    // Cek username unik (kecuali dirinya sendiri)
    const [exist] = await pool.query(
      'SELECT id FROM `user` WHERE username = ? AND id != ?',
      [username, targetId]
    );
    if (exist.length) {
      return res.status(400).json({ success: false, message: 'Username sudah digunakan' });
    }

    await pool.query(
      'UPDATE `user` SET username = ?, id_role = ?, disabled = ? WHERE id = ?',
      [username, id_role, disabled, targetId]
    );

    // Jika dinonaktifkan, hapus session
    if (disabled === 1) {
      await pool.query('UPDATE `user` SET last_session = NULL WHERE id = ?', [targetId]);
    }

    await logActivity({ 
      userId: req.user.id, 
      title: 'Update User', 
      content: { aksi: 'update', targetId }, 
      req 
    });

    res.json({ success: true, message: 'User berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  const targetId = req.params.id;

  if (parseInt(targetId) === req.user.id) {
    return res.status(400).json({ 
      success: false, 
      message: 'Tidak boleh menghapus akun sendiri' 
    });
  }

  try {
    await pool.query('DELETE FROM `user` WHERE id = ?', [targetId]);
    await logActivity({ 
      userId: req.user.id, 
      title: 'Hapus User', 
      content: { aksi: 'delete', targetId }, 
      req 
    });
    res.json({ success: true, message: 'User berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const generatePass = async (req, res) => {
  const password = generatePassword();
  res.json({ success: true, password });
};

const checkUsername = async (req, res) => {
  const { username } = req.query;
  const usernameRegex = /^[a-z0-9_]{6,}$/;
  if (!usernameRegex.test(username)) {
    return res.json({ 
      success: false, 
      available: false, 
      message: 'Username minimal 6 karakter, hanya huruf kecil, angka, dan underscore' 
    });
  }
  const [rows] = await pool.query('SELECT id FROM `user` WHERE username = ?', [username]);
  res.json({ success: true, available: rows.length === 0 });
};

module.exports = { 
  getAll, 
  getById, 
  create, 
  update, 
  remove, 
  generatePass, 
  checkUsername 
};