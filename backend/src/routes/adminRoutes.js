const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');
const { sendTestEmail, regenerateReportsAdmin } = require('../controllers/adminController');

router.post('/send-test-email', authMiddleware, adminMiddleware, sendTestEmail);
router.post('/reports/regenerate', authMiddleware, adminMiddleware, regenerateReportsAdmin);

module.exports = router;
