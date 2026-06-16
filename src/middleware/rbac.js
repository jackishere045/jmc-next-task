const pool = require('../config/db');

const checkPermission = (kodeModul, aksi) => {
  return async (req, res, next) => {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM role_permission 
         WHERE id_role = ? AND kode_modul = ?`,
        [req.user.id_role, kodeModul]
      );

      if (!rows.length || !rows[0].akses) {
        return res.status(403).json({ success: false, message: 'Akses ditolak' });
      }

      const perm = rows[0];

      if (aksi === 'create' && !perm.create) {
        return res.status(403).json({ success: false, message: 'Tidak punya hak create' });
      }
      if (aksi === 'read' && perm.read === 'No') {
        return res.status(403).json({ success: false, message: 'Tidak punya hak read' });
      }
      if (aksi === 'update' && perm.update === 'No') {
        return res.status(403).json({ success: false, message: 'Tidak punya hak update' });
      }
      if (aksi === 'delete' && perm.delete === 'No') {
        return res.status(403).json({ success: false, message: 'Tidak punya hak delete' });
      }

      req.permission = perm;
      next();
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  };
};

module.exports = { checkPermission };