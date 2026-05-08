const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { ApiError } = require('../utils/apiError');
const { asyncHandler } = require('../utils/asyncHandler');
const { createUser, findUserByEmail, findUserById } = require('../services/dataService');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

function buildToken(user) {
  return jwt.sign(
    { userId: user.user_id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
}

const register = asyncHandler(async (req, res, next) => {
  const parsed = registerSchema.safeParse({ body: req.body });
  if (!parsed.success) {
    return next(new ApiError(400, 'Validation failed', parsed.error.flatten()));
  }

  const { name, email, password } = parsed.data.body;
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    return next(new ApiError(409, 'Email already registered'));
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({ name, email, passwordHash });
  const token = buildToken(user);

  return res.status(201).json({
    message: 'Registration successful',
    token,
    user,
  });
});

const login = asyncHandler(async (req, res, next) => {
  const parsed = loginSchema.safeParse({ body: req.body });
  if (!parsed.success) {
    return next(new ApiError(400, 'Validation failed', parsed.error.flatten()));
  }

  const { email, password } = parsed.data.body;
  const user = await findUserByEmail(email);

  if (!user) {
    return next(new ApiError(401, 'Invalid email or password'));
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return next(new ApiError(401, 'Invalid email or password'));
  }

  const token = buildToken(user);
  const safeUser = {
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
  };

  return res.json({
    message: 'Login successful',
    token,
    user: safeUser,
  });
});

const me = asyncHandler(async (req, res, next) => {
  const user = await findUserById(req.user.userId);
  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  return res.json({ user });
});

module.exports = { register, login, me };
