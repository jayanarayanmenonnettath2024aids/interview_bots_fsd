const { z } = require('zod');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/apiError');
const { sendMail } = require('../utils/email');
const { regenerateReports } = require('../services/reportService');

const sendTestEmailSchema = z.object({
  body: z.object({
    to: z.string().email().optional(),
    subject: z.string().min(3).optional(),
    message: z.string().min(3).optional(),
  }),
});

const regenerateSchema = z.object({
  body: z.object({
    userId: z.string().uuid().optional(),
    enforceEnglish: z.boolean().optional(),
  }).optional(),
});

const sendTestEmail = asyncHandler(async (req, res, next) => {
  const parsed = sendTestEmailSchema.safeParse({ body: req.body || {} });
  if (!parsed.success) {
    return next(new ApiError(400, 'Validation failed', parsed.error.flatten()));
  }

  const to = parsed.data.body.to || req.user.email;
  if (!to) {
    return next(new ApiError(400, 'Recipient email is required'));
  }

  const subject = parsed.data.body.subject || 'AI Interview Bot - SMTP Test';
  const message = parsed.data.body.message || 'SMTP is configured and working.';

  const info = await sendMail({
    to,
    subject,
    text: message,
    html: `<p>${message}</p>`,
  });

  return res.json({
    message: 'Test email sent',
    to,
    messageId: info.messageId,
  });
});

const regenerateReportsAdmin = asyncHandler(async (req, res, next) => {
  const parsed = regenerateSchema.safeParse({ body: req.body || {} });
  if (!parsed.success) {
    return next(new ApiError(400, 'Validation failed', parsed.error.flatten()));
  }

  const body = parsed.data.body || {};
  const result = await regenerateReports({
    userId: body.userId || null,
    enforceEnglish: body.enforceEnglish !== false,
  });

  return res.json({
    message: 'Report regeneration completed',
    result,
  });
});

module.exports = {
  sendTestEmail,
  regenerateReportsAdmin,
};
