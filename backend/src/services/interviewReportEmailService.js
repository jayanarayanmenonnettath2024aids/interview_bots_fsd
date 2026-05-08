const { getInterviewById, getReportByUserId, markInterviewReportEmailSent } = require('./dataService');
const { findUserById } = require('./dataService');
const { sendMail } = require('../utils/email');

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildHtml({ userName, interview, report }) {
  const strengths = escapeHtml(report?.strengths || 'Keep practicing to build stronger answers.');
  const weaknesses = escapeHtml(report?.weaknesses || 'Focus on clarity, structure, and examples.');
  const suggestions = escapeHtml(report?.suggestions || 'Review the concept, practice aloud, and try another mock interview.');
  const score = Number(interview?.overall_score || 0).toFixed(2);
  const title = `${escapeHtml(interview.domain)} ${escapeHtml(interview.interview_type)} Interview Report`;

  return `
  <div style="margin:0;padding:0;background:#f3f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:760px;margin:0 auto;padding:32px 16px;">
      <div style="background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 55%,#7c3aed 100%);border-radius:28px 28px 0 0;padding:34px 36px;color:#fff;">
        <div style="font-size:13px;letter-spacing:.16em;text-transform:uppercase;opacity:.85;">AI Interview Bot</div>
        <h1 style="margin:14px 0 8px;font-size:34px;line-height:1.15;">Your interview report is ready</h1>
        <p style="margin:0;font-size:16px;opacity:.95;">Hi ${escapeHtml(userName)}, here is the summary of your completed interview session.</p>
      </div>

      <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 28px 28px;padding:32px 34px;box-shadow:0 12px 34px rgba(15,23,42,.08);">
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:20px;padding:18px 20px;margin-bottom:22px;">
          <div style="font-size:14px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:.08em;">Interview Summary</div>
          <div style="margin-top:8px;font-size:18px;font-weight:700;color:#0f172a;">${title}</div>
          <div style="margin-top:6px;color:#334155;">Overall score: <strong>${score}</strong> / 10</div>
          <div style="margin-top:4px;color:#334155;">Status: <strong>Completed</strong></div>
        </div>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 14px;">
          <tr>
            <td style="vertical-align:top;padding-right:8px;width:33.33%;">
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:18px;min-height:170px;">
                <div style="font-size:15px;font-weight:700;color:#0f766e;margin-bottom:8px;">Strengths</div>
                <div style="font-size:14px;line-height:1.7;color:#334155;">${strengths}</div>
              </div>
            </td>
            <td style="vertical-align:top;padding:0 4px;width:33.33%;">
              <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:18px;padding:18px;min-height:170px;">
                <div style="font-size:15px;font-weight:700;color:#c2410c;margin-bottom:8px;">Weaknesses</div>
                <div style="font-size:14px;line-height:1.7;color:#334155;">${weaknesses}</div>
              </div>
            </td>
            <td style="vertical-align:top;padding-left:8px;width:33.33%;">
              <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:18px;padding:18px;min-height:170px;">
                <div style="font-size:15px;font-weight:700;color:#7c3aed;margin-bottom:8px;">Suggestions</div>
                <div style="font-size:14px;line-height:1.7;color:#334155;">${suggestions}</div>
              </div>
            </td>
          </tr>
        </table>

        <div style="background:#0f172a;border-radius:18px;padding:18px 20px;margin-top:8px;color:#e2e8f0;">
          <div style="font-size:15px;font-weight:700;margin-bottom:6px;">What to do next</div>
          <div style="font-size:14px;line-height:1.7;">
            Open the app, review your feedback, and start another mock interview to improve your score in the next round.
          </div>
        </div>

        <div style="text-align:center;margin:28px 0 10px;">
          <a href="http://localhost:5173/feedback" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:14px 28px;border-radius:14px;font-weight:700;font-size:15px;">View Feedback</a>
        </div>

        <p style="margin:18px 0 0;font-size:12px;line-height:1.7;color:#64748b;text-align:center;">This report was generated automatically after your interview session.</p>
      </div>
    </div>
  </div>`;
}

async function sendInterviewReportEmail(interviewId) {
  const interview = await getInterviewById(interviewId);
  if (!interview) {
    return { sent: false, reason: 'interview_not_found' };
  }

  if (interview.report_email_sent_at) {
    return { sent: false, reason: 'already_sent' };
  }

  const user = await findUserById(interview.user_id);
  if (!user?.email) {
    return { sent: false, reason: 'user_email_missing' };
  }

  const report = await getReportByUserId(interview.user_id);
  if (!report) {
    return { sent: false, reason: 'report_missing' };
  }

  const subject = `Your AI Interview Report - ${interview.domain} (${interview.interview_type})`;
  const text = [
    `Hi ${user.name},`,
    '',
    'Your interview report is ready.',
    `Domain: ${interview.domain}`,
    `Interview Type: ${interview.interview_type}`,
    `Difficulty: ${interview.difficulty}`,
    `Score: ${Number(interview.overall_score || 0).toFixed(2)}/10`,
    '',
    `Strengths: ${report.strengths || 'N/A'}`,
    `Weaknesses: ${report.weaknesses || 'N/A'}`,
    `Suggestions: ${report.suggestions || 'N/A'}`,
    '',
    'Open the app to review the full feedback and continue practicing.',
  ].join('\n');

  const info = await sendMail({
    to: user.email,
    subject,
    text,
    html: buildHtml({ userName: user.name, interview, report }),
  });

  await markInterviewReportEmailSent(interviewId);
  return { sent: true, messageId: info.messageId, to: user.email };
}

module.exports = { sendInterviewReportEmail };
