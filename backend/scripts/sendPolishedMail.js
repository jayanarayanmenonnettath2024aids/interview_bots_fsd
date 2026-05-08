require('dotenv').config({ path: __dirname + '/../.env' });
const { Pool } = require('pg');
const { sendMail } = require('../src/utils/email');

const term = process.argv[2] || 'jayanth';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function buildEmailHtml(name) {
  return `
  <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <div style="max-width:720px;margin:0 auto;padding:32px 16px;">
      <div style="background:linear-gradient(135deg,#5b21b6 0%,#7c3aed 50%,#2563eb 100%);border-radius:24px 24px 0 0;padding:28px 32px;color:white;">
        <div style="font-size:14px;letter-spacing:.12em;text-transform:uppercase;opacity:.9;">AI Interview Bot</div>
        <h1 style="margin:12px 0 6px;font-size:34px;line-height:1.15;">Your interview practice space is ready</h1>
        <p style="margin:0;font-size:16px;opacity:.95;">Hi ${name}, we built a polished experience to help you practice smarter and improve faster.</p>
      </div>

      <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 24px 24px;padding:32px;box-shadow:0 10px 30px rgba(15,23,42,.08);">
        <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">
          Welcome to <strong>AI Interview Bot</strong> - your personal mock interview companion for structured practice, instant AI feedback, and performance tracking.
        </p>

        <div style="display:grid;grid-template-columns:1fr;gap:14px;margin:24px 0;">
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:18px;">
            <div style="font-size:15px;font-weight:700;color:#111827;margin-bottom:6px;">What you can do</div>
            <ul style="margin:0;padding-left:20px;line-height:1.8;color:#374151;">
              <li>Run mock interviews by domain, difficulty, and interview type</li>
              <li>Get AI-generated questions and feedback after every answer</li>
              <li>Review your performance history and question bank</li>
              <li>Track strengths, weaknesses, and improvement suggestions</li>
            </ul>
          </div>

          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:18px;padding:18px;">
            <div style="font-size:15px;font-weight:700;color:#1e3a8a;margin-bottom:6px;">Quick start</div>
            <p style="margin:0;color:#1e3a8a;line-height:1.7;">
              Sign in, open <strong>Mock Interviews</strong>, choose your domain, and start practicing in a few clicks.
              Your latest feedback will be saved automatically so you can revisit it anytime.
            </p>
          </div>
        </div>

        <div style="text-align:center;margin:28px 0 12px;">
          <a href="http://localhost:5173" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:14px;font-weight:700;font-size:15px;">
            Open AI Interview Bot
          </a>
        </div>

        <p style="margin:18px 0 0;color:#6b7280;font-size:13px;line-height:1.7;text-align:center;">
          If this email reached you unexpectedly, you can safely ignore it.
        </p>
      </div>
    </div>
  </div>`;
}

async function main() {
  try {
    const { rows } = await pool.query(
      'SELECT user_id, name, email FROM users WHERE name ILIKE $1 OR email ILIKE $1 ORDER BY created_at DESC LIMIT 1',
      [`%${term}%`],
    );

    if (!rows.length) {
      console.log('No matching user found.');
      process.exitCode = 1;
      return;
    }

    const user = rows[0];
    const subject = 'Welcome to AI Interview Bot - start practicing today';
    const text = [
      `Hi ${user.name},`,
      '',
      'Welcome to AI Interview Bot - your personal mock interview companion for structured practice, instant AI feedback, and performance tracking.',
      '',
      'You can run mock interviews, review performance history, and revisit AI-generated feedback anytime.',
      '',
      'Open the app and start practicing: http://localhost:5173',
      '',
      'Regards,',
      'AI Interview Bot',
    ].join('\n');

    const info = await sendMail({
      to: user.email,
      subject,
      text,
      html: buildEmailHtml(user.name),
    });

    console.log(JSON.stringify({
      user: { user_id: user.user_id, name: user.name, email: user.email },
      subject,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    }, null, 2));
  } catch (error) {
    console.error('Send failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
