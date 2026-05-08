const { z } = require('zod');
const { ApiError } = require('../utils/apiError');
const { asyncHandler } = require('../utils/asyncHandler');
const { findUserById, updateUserProfile, getDashboardOverview } = require('../services/dataService');

const updateSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
  }),
});

const getProfile = asyncHandler(async (req, res, next) => {
  const user = await findUserById(req.user.userId);
  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  const overview = await getDashboardOverview(req.user.userId);

  return res.json({
    user,
    stats: overview.summary,
    recentInterviews: overview.recentInterviews,
  });
});

const updateProfile = asyncHandler(async (req, res, next) => {
  const parsed = updateSchema.safeParse({ body: req.body });
  if (!parsed.success) {
    return next(new ApiError(400, 'Validation failed', parsed.error.flatten()));
  }

  const updated = await updateUserProfile(req.user.userId, parsed.data.body);
  if (!updated) {
    return next(new ApiError(404, 'User not found'));
  }

  return res.json({ user: updated });
});

module.exports = { getProfile, updateProfile };
