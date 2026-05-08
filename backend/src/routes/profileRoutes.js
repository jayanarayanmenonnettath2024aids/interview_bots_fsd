const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const { getProfile, updateProfile } = require('../controllers/profileController');

router.get('/', authMiddleware, getProfile);
router.put('/update', authMiddleware, updateProfile);

module.exports = router;
