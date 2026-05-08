require('dotenv').config({ path: __dirname + '/../.env' });
const { Pool } = require('pg');
const { sendMail } = require('../src/utils/email');

const term = process.argv[2] || 'jayanth';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildHtml({ name, interview, report }) {
  return `
  <div style="margin:0;padding:0;background:#f3f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:760px;margin:0 auto;padding:32px 16px;">
      <div style="background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 55%,#7c3aed 100%);border-radius:28px 28px 0 0;padding:34px 36px;color:#fff;">
        <div style="font-size:13px;letter-spacing:.16em;text-transform:uppercase;opacity:.85;">AI Interview Bot</div>
        <h1 style="margin:14px 0 8px;font-size:34px;line-height:1.15;">Your interview results are ready</h1>
        <p style="margin:0;font-size:16px;opacity:.95;">Hi ${escapeHtml(name)}, here is a summary of your latest interview performance.</p>
      </div>
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 28px 28px;padding:32px 34px;box-shadow:0 12px 34px rgba(15,23,42,.08);">
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:20px;padding:18px 20px;margin-bottom:22px;">
          <div style="font-size:14px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:.08em;">Interview Summary</div>
          <div style="margin-top:8px;font-size:18px;font-weight:700;color:#0f172a;">${escapeHtml(interview.domain)} ${escapeHtml(interview.interview_type)} Interview</div>
          <div style="margin-top:6px;color:#334155;">Difficulty: <strong>${escapeHtml(interview.difficulty)}</strong></div>
          <div style="margin-top:4px;color:#334155;">Overall score: <strong>${Number(interview.overall_score || 0).toFixed(2)}</strong> / 10</div>
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 14px;">
          <tr>
            <td style="vertical-align:top;padding-right:8px;width:33.33%;">
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:18px;min-height:170px;">
                <div style="font-size:15px;font-weight:700;color:#0f766e;margin-bottom:8px;">Strengths</div>
                <div style="font-size:14px;line-height:1.7;color:#334155;">${escapeHtml(report.strengths)}</div>
              </div>
            </td>
            <td style="vertical-align:top;padding:0 4px;width:33.33%;">
              <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:18px;padding:18px;min-height:170px;">
                <div style="font-size:15px;font-weight:700;color:#c2410c;margin-bottom:8px;">Weaknesses</div>
                <div style="font-size:14px;line-height:1.7;color:#334155;">${escapeHtml(report.weaknesses)}</div>
              </div>
            </td>
            <td style="vertical-align:top;padding-left:8px;width:33.33%;">
              <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:18px;padding:18px;min-height:170px;">
                <div style="font-size:15px;font-weight:700;color:#7c3aed;margin-bottom:8px;">Suggestions</div>
                <div style="font-size:14px;line-height:1.7;color:#334155;">${escapeHtml(report.suggestions)}</div>
              </div>
            </td>
          </tr>
        </table>
        <div style="text-align:center;margin:28px 0 10px;">
          <a href="http://localhost:5173/feedback" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:14px 28px;border-radius:14px;font-weight:700;font-size:15px;">Open Feedback</a>
        </div>
        <p style="margin:18px 0 0;font-size:12px;line-height:1.7;color:#64748b;text-align:center;">This report was generated automatically from your latest interview session.</p>
      </div>
    </div>
  </div>`;
}

async function main() {
  try {
    const { rows } = await pool.query(
      `SELECT u.user_id, u.name, u.email, i.interview_id, i.domain, i.interview_type, i.difficulty, i.overall_score, i.report_email_sent_at,
              r.strengths, r.weaknesses, r.suggestions
       FROM users u
       INNER JOIN interviews i ON i.user_id = u.user_id
       INNER JOIN reports r ON r.user_id = u.user_id
       WHERE u.name ILIKE $1 OR u.email ILIKE $1
       ORDER BY i.ended_at DESC NULLS LAST, i.created_at DESC
       LIMIT 1`,
      [`%${term}%`],
    );

    if (!rows.length) {
      console.log('No matching interview/report found.');
      process.exitCode = 1;
      return;
    }

    const row = rows[0];
    const subject = `Your Interview Results - ${row.domain} ${row.interview_type}`;
    const text = [
      `Hi ${row.name},`,
      '',
      'Your interview results are ready.',
      `Domain: ${row.domain}`,
      `Type: ${row.interview_type}`,
      `Difficulty: ${row.difficulty}`,
      `Score: ${Number(row.overall_score || 0).toFixed(2)}/10`,
      '',
      `Strengths: ${row.strengths}`,
      `Weaknesses: ${row.weaknesses}`,
      `Suggestions: ${row.suggestions}`,
      '',
      'Open the app to review the full feedback.',
    ].join('\n');

    const info = await sendMail({
      to: row.email,
      subject,
      text,
      html: buildHtml({ name: row.name, interview: row, report: row }),
    });

    console.log(JSON.stringify({
      user: { user_id: row.user_id, name: row.name, email: row.email },
      subject,
      interviewId: row.interview_id,
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
