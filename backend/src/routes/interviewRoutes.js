const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const { startInterview, generateQuestion, submitAnswer, history, finishInterview } = require('../controllers/interviewController');

router.post('/start', authMiddleware, startInterview);
router.post('/question', authMiddleware, generateQuestion);
router.post('/answer', authMiddleware, submitAnswer);
router.get('/history', authMiddleware, history);
router.post('/complete', authMiddleware, finishInterview);

module.exports = router;
