const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const { getReports } = require('../controllers/reportController');

router.get('/:userId', authMiddleware, getReports);
router.get('/', authMiddleware, getReports);

module.exports = router;
