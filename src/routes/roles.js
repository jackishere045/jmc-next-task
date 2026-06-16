const router = require('express').Router();
const { getAll, getDetail } = require('../controllers/roleController');
const { verifyToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.get('/', verifyToken, checkPermission('roles', 'read'), getAll);
router.get('/:id', verifyToken, checkPermission('roles', 'read'), getDetail);

module.exports = router;