const { asyncHandler } = require('../utils/asyncHandler');
const { getQuestionBank } = require('../services/dataService');

const listQuestions = asyncHandler(async (req, res) => {
  const questions = await getQuestionBank(req.user.userId, {
    domain: req.query.domain,
    difficulty: req.query.difficulty,
    search: req.query.search,
  });

  return res.json({ questions });
});

module.exports = { listQuestions };
