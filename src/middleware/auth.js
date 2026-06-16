const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Cek apakah user masih aktif
    const [rows] = await pool.query(
      'SELECT id, username, id_role, disabled, last_session FROM `user` WHERE id = ?',
      [decoded.id]
    );

    if (!rows.length || rows[0].disabled === 1) {
      return res.status(401).json({ success: false, message: 'Akun tidak aktif atau tidak ditemukan' });
    }

    // Validasi session token cocok (untuk force logout)
    if (rows[0].last_session !== token) {
      return res.status(401).json({ success: false, message: 'Session tidak valid, silakan login ulang' });
    }

    req.user = { ...decoded, id_role: rows[0].id_role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session habis, silakan login ulang', expired: true });
    }
    return res.status(403).json({ success: false, message: 'Token tidak valid' });
  }
};

module.exports = { verifyToken };