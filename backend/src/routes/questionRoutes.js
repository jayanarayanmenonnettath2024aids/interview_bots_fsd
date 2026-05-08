const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const { listQuestions } = require('../controllers/questionController');

router.get('/bank', authMiddleware, listQuestions);

module.exports = router;
