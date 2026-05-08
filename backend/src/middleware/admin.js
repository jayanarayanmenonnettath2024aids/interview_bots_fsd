const { ApiError } = require('../utils/apiError');

const adminMiddleware = (req, _res, next) => {
  const configuredKey = process.env.ADMIN_API_KEY;
  if (!configuredKey) {
    return next(new ApiError(500, 'ADMIN_API_KEY is not configured'));
  }

  const providedKey = req.headers['x-admin-key'];
  if (!providedKey || providedKey !== configuredKey) {
    return next(new ApiError(403, 'Admin access denied'));
  }

  return next();
};

module.exports = { adminMiddleware };
