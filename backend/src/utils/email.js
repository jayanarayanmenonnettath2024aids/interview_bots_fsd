const nodemailer = require('nodemailer');

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';

  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    throw new Error('SMTP_USER and SMTP_PASSWORD must be configured');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

async function sendMail({ to, subject, text, html }) {
  const transporter = getTransporter();
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}

module.exports = { sendMail };
