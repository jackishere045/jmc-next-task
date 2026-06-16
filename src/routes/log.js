const router = require('express').Router();
const { getAll } = require('../controllers/logController');
const { verifyToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.get('/', verifyToken, checkPermission('log', 'read'), getAll);

module.exports = router;