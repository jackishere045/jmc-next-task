/**
 * @swagger
 * tags:
 *   name: Tunjangan Transport
 *   description: API modul tunjangan transport pegawai
 */

/**
 * @swagger
 * /tunjangan/setting:
 *   get:
 *     summary: Ambil semua setting tunjangan
 *     tags: [Tunjangan Transport]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List setting tunjangan
 */

const router = require('express').Router();
const c = require('../controllers/tunjanganController');
const { verifyToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

// Setting tunjangan — hanya Admin HRD
router.get('/setting', verifyToken, c.getSetting);
router.post('/setting', verifyToken, checkPermission('setting_tunjangan', 'create'), c.createSetting);
router.put('/setting/:id', verifyToken, checkPermission('setting_tunjangan', 'update'), c.updateSetting);
router.delete('/setting/:id', verifyToken, checkPermission('setting_tunjangan', 'delete'), c.deleteSetting);

// Tunjangan transport
router.get('/bulan', verifyToken, checkPermission('tunjangan', 'read'), c.getDaftarBulan);
router.get('/detail/:bulan/:tahun', verifyToken, checkPermission('tunjangan', 'read'), c.getDetailBulan);
router.post('/hitung/:bulan/:tahun', verifyToken, checkPermission('tunjangan', 'create'), c.hitungTunjangan);

module.exports = router;