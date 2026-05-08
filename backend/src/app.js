const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const reportRoutes = require('./routes/reportRoutes');
const profileRoutes = require('./routes/profileRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const questionRoutes = require('./routes/questionRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ai-interview-bot-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app };
