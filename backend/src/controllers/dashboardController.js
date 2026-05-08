const { asyncHandler } = require('../utils/asyncHandler');
const { getDashboardOverview } = require('../services/dataService');

const overview = asyncHandler(async (req, res) => {
  const data = await getDashboardOverview(req.user.userId);
  return res.json(data);
});

module.exports = { overview };
