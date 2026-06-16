const pool = require('../config/db');

const getAll = async (req, res) => {
  const [roles] = await pool.query('SELECT * FROM user_role ORDER BY id');
  res.json({ success: true, data: roles });
};

const getDetail = async (req, res) => {
  const [roles] = await pool.query('SELECT * FROM user_role WHERE id = ?', [req.params.id]);
  if (!roles.length) return res.status(404).json({ success: false, message: 'Role tidak ditemukan' });
  const [perms] = await pool.query('SELECT * FROM role_permission WHERE id_role = ? ORDER BY id', [req.params.id]);
  res.json({ success: true, data: { ...roles[0], permissions: perms } });
};

module.exports = { getAll, getDetail };