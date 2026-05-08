const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/apiError');

const authMiddleware = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication token is required'));
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    };
    return next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
};

module.exports = { authMiddleware };
