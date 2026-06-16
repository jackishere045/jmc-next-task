// routes/users.js
const router = require('express').Router();
const c = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.get('/', verifyToken, (req, res, next) => {
  console.log('📥 GET /users - User:', req.user?.id, 'Role:', req.user?.id_role);
  next();
}, checkPermission('users', 'read'), c.getAll);

router.get('/check-username', verifyToken, c.checkUsername);
router.get('/generate-password', verifyToken, c.generatePass);
router.get('/:id', verifyToken, checkPermission('users', 'read'), c.getById);
router.post('/', verifyToken, checkPermission('users', 'create'), c.create);
router.put('/:id', verifyToken, checkPermission('users', 'update'), c.update);
router.delete('/:id', verifyToken, checkPermission('users', 'delete'), c.remove);

module.exports = router;