const router = require('express').Router();
const c = require('../controllers/pegawaiController');
const { verifyToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `foto_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});

//profile
router.get('/profile/me', verifyToken, c.getMyProfile);
router.put('/profile/me', verifyToken, upload.single('foto'), c.updateMyProfile);

router.get('/search', verifyToken, c.searchNama);
router.get('/wilayah', verifyToken, c.getWilayah);
router.get('/dashboard-stats', verifyToken, c.getDashboardStats);
router.get('/', verifyToken, checkPermission('pegawai', 'read'), c.getAll);
router.get('/:id', verifyToken, checkPermission('pegawai', 'read'), c.getById);
router.post('/', verifyToken, checkPermission('pegawai', 'create'), upload.single('foto'), c.create);
router.put('/:id', verifyToken, checkPermission('pegawai', 'update'), upload.single('foto'), c.update);
router.delete('/:id', verifyToken, checkPermission('pegawai', 'delete'), c.remove);

module.exports = router;