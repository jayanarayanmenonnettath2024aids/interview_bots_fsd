const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const { overview } = require('../controllers/dashboardController');

router.get('/overview', authMiddleware, overview);

module.exports = router;
