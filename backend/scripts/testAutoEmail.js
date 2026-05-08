require('dotenv').config({ path: __dirname + '/../.env' });

const API_BASE = process.env.TEST_API_BASE || 'http://localhost:5001/api';
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  return { status: response.status, ok: response.ok, data };
}

async function main() {
  try {
    const email = `autoemail_${Date.now()}@example.com`;
    const reg = await api('/auth/register', {
      method: 'POST',
      body: { name: 'Auto Email User', email, password: 'test1234' },
    });
    if (!reg.ok) throw new Error(`register failed ${reg.status}`);
    const headers = { Authorization: `Bearer ${reg.data.token}` };

    const start = await api('/interview/start', {
      method: 'POST',
      headers,
      body: { domain: 'Backend', difficulty: 'Medium', interviewType: 'Technical', questionCount: 1 },
    });
    if (!start.ok) throw new Error(`start failed ${start.status}`);
    const interviewId = start.data.interview.interview_id;

    const q = await api('/interview/question', {
      method: 'POST',
      headers,
      body: { interviewId },
    });
    if (!q.ok) throw new Error(`question failed ${q.status}`);

    const a = await api('/interview/answer', {
      method: 'POST',
      headers,
      body: {
        interviewId,
        questionId: q.data.question.question_id,
        questionText: q.data.question.question_text,
        answerText: 'Node.js handles concurrency using the event loop and non-blocking I/O.',
        domain: 'Backend',
        difficulty: 'Medium',
        interviewType: 'Technical',
      },
    });
    if (!a.ok) throw new Error(`answer failed ${a.status}`);

    const complete = await api('/interview/complete', {
      method: 'POST',
      headers,
      body: { interviewId },
    });
    if (!complete.ok) throw new Error(`complete failed ${complete.status}`);

    const { rows } = await pool.query('SELECT report_email_sent_at, status FROM interviews WHERE interview_id = $1 LIMIT 1', [interviewId]);
    const interview = rows[0];
    if (!interview) throw new Error('interview row not found');
    if (!interview.report_email_sent_at) throw new Error('report_email_sent_at was not set');

    console.log(JSON.stringify({
      email,
      interviewId,
      status: interview.status,
      report_email_sent_at: interview.report_email_sent_at,
    }, null, 2));
  } catch (error) {
    console.error('Auto email test failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
