const { asyncHandler } = require('../utils/asyncHandler');
const { getReportByUserId } = require('../services/dataService');

const getReports = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user.userId;
  const report = await getReportByUserId(userId);

  return res.json({ report });
});

module.exports = { getReports };
