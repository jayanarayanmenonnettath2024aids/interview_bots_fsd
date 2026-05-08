const { ApiError } = require('../utils/apiError');

const notFoundHandler = (_req, _res, next) => {
  next(new ApiError(404, 'Route not found'));
};

const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    message,
    details: error.details || null,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });
};

module.exports = { errorHandler, notFoundHandler };
