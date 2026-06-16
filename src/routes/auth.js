const router = require('express').Router();
const { getCaptcha, login, logout, getMe, updateProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Terlalu banyak percobaan login' });

router.get('/captcha', getCaptcha);
router.post('/login', loginLimiter, login);
router.post('/logout', verifyToken, logout);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);

router.put('/change-password', verifyToken, async (req, res) => {
  const { current_password, new_password } = req.body;
  const userId = req.user.id;

  try {
    // Cek user
    const [rows] = await pool.query('SELECT password_hash FROM `user` WHERE id = ?', [userId]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    // Verifikasi password lama
    const isValid = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Password saat ini salah' });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(new_password, 12);

    // Update password
    await pool.query('UPDATE `user` SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);

    res.json({ success: true, message: 'Password berhasil diubah' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;