require('dotenv').config({ path: __dirname + '/../.env' });

const API_BASE = process.env.TEST_API_BASE || 'http://localhost:5001/api';
const FRONTEND_URL = process.env.TEST_FRONTEND_URL || 'http://localhost:5173';
const ADMIN_KEY = process.env.ADMIN_API_KEY || '';

const state = {
  token: null,
  userEmail: null,
  interviewId: null,
  question1: null,
  question2: null,
};

const results = [];

async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (_e) {
    data = { raw: text };
  }

  return { status: response.status, ok: response.ok, data };
}

async function web(url) {
  const response = await fetch(url);
  return { status: response.status, ok: response.ok };
}

function addResult(name, pass, detail) {
  results.push({ name, pass, detail });
  const prefix = pass ? '[PASS]' : '[FAIL]';
  console.log(`${prefix} ${name} - ${detail}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function testSmoke() {
  const health = await api('/health');
  assert(health.ok, `health status ${health.status}`);
  assert(health.data && health.data.status === 'ok', 'health payload mismatch');
  addResult('Smoke: API health', true, `status=${health.status}`);

  const frontend = await web(FRONTEND_URL);
  assert(frontend.ok, `frontend status ${frontend.status}`);
  addResult('Smoke: Frontend HTTP', true, `status=${frontend.status}`);
}

async function testAuthAndProfile() {
  const email = `e2e_${Date.now()}@example.com`;
  const register = await api('/auth/register', {
    method: 'POST',
    body: { name: 'E2E User', email, password: 'test1234' },
  });

  assert(register.ok, `register failed ${register.status}`);
  assert(register.data && register.data.token, 'register missing token');

  state.token = register.data.token;
  state.userEmail = email;

  addResult('E2E: Register', true, `email=${email}`);

  const authHeaders = { Authorization: `Bearer ${state.token}` };

  const me = await api('/auth/me', { headers: authHeaders });
  assert(me.ok, `auth/me failed ${me.status}`);
  assert(me.data && me.data.user && me.data.user.email === email, 'auth/me email mismatch');
  addResult('E2E: Auth me', true, `email=${me.data.user.email}`);

  const profile = await api('/profile', { headers: authHeaders });
  assert(profile.ok, `profile failed ${profile.status}`);
  assert(profile.data && profile.data.user && profile.data.user.email === email, 'profile email mismatch');
  addResult('E2E: Profile', true, `email=${profile.data.user.email}`);
}

async function testInterviewFlow() {
  const authHeaders = { Authorization: `Bearer ${state.token}` };

  const start = await api('/interview/start', {
    method: 'POST',
    headers: authHeaders,
    body: {
      domain: 'Backend',
      difficulty: 'Medium',
      interviewType: 'Technical',
      questionCount: 2,
    },
  });

  assert(start.ok, `start interview failed ${start.status}`);
  state.interviewId = start.data.interview.interview_id;
  addResult('E2E: Start interview', true, `interviewId=${state.interviewId}`);

  const q1 = await api('/interview/question', {
    method: 'POST',
    headers: authHeaders,
    body: { interviewId: state.interviewId },
  });
  assert(q1.ok, `question1 failed ${q1.status}`);
  state.question1 = q1.data.question;
  addResult('E2E: Generate question 1', true, `questionId=${state.question1.question_id}`);

  const a1 = await api('/interview/answer', {
    method: 'POST',
    headers: authHeaders,
    body: {
      interviewId: state.interviewId,
      questionId: state.question1.question_id,
      questionText: state.question1.question_text,
      answerText: 'Node.js uses event loop and non-blocking I/O for scalable backend APIs.',
      domain: 'Backend',
      difficulty: 'Medium',
      interviewType: 'Technical',
    },
  });
  assert(a1.ok, `answer1 failed ${a1.status}`);
  addResult('E2E: Submit answer 1', true, `score=${a1.data.evaluation.score}`);

  const q2 = await api('/interview/question', {
    method: 'POST',
    headers: authHeaders,
    body: { interviewId: state.interviewId },
  });
  assert(q2.ok, `question2 failed ${q2.status}`);
  state.question2 = q2.data.question;
  addResult('E2E: Generate question 2', true, `questionId=${state.question2.question_id}`);

  const a2 = await api('/interview/answer', {
    method: 'POST',
    headers: authHeaders,
    body: {
      interviewId: state.interviewId,
      questionId: state.question2.question_id,
      questionText: state.question2.question_text,
      answerText: 'I would use indexes, query optimization, pagination and caching for performance.',
      domain: 'Backend',
      difficulty: 'Medium',
      interviewType: 'Technical',
    },
  });
  assert(a2.ok, `answer2 failed ${a2.status}`);
  addResult('E2E: Submit answer 2', true, `score=${a2.data.evaluation.score}`);

  const q3 = await api('/interview/question', {
    method: 'POST',
    headers: authHeaders,
    body: { interviewId: state.interviewId },
  });
  assert(q3.status === 409, `expected 409 on third question, got ${q3.status}`);
  addResult('E2E: Question limit enforcement', true, `status=${q3.status}`);

  const complete = await api('/interview/complete', {
    method: 'POST',
    headers: authHeaders,
    body: { interviewId: state.interviewId },
  });
  assert(complete.ok, `complete failed ${complete.status}`);
  addResult('E2E: Complete interview', true, `status=${complete.data.interview.status}`);
}

async function testReadApis() {
  const authHeaders = { Authorization: `Bearer ${state.token}` };

  const history = await api('/interview/history', { headers: authHeaders });
  assert(history.ok, `history failed ${history.status}`);
  addResult('E2E: Interview history', true, `count=${history.data.interviews.length}`);

  const dashboard = await api('/dashboard/overview', { headers: authHeaders });
  assert(dashboard.ok, `dashboard failed ${dashboard.status}`);
  addResult('E2E: Dashboard', true, `interviewsTaken=${dashboard.data.summary.interviewsTaken}`);

  const qb = await api('/questions/bank', { headers: authHeaders });
  assert(qb.ok, `question bank failed ${qb.status}`);
  addResult('E2E: Question bank', true, `count=${qb.data.questions.length}`);

  const report = await api('/reports', { headers: authHeaders });
  assert(report.ok, `reports failed ${report.status}`);
  const hasChinese = !!(
    report.data &&
    report.data.report &&
    /[\u3400-\u9FBF]/.test(
      `${report.data.report.strengths || ''} ${report.data.report.weaknesses || ''} ${report.data.report.suggestions || ''}`,
    )
  );
  addResult('E2E: Reports API', true, `reportPresent=${Boolean(report.data.report)} chineseDetected=${hasChinese}`);
}

async function testAdminApis() {
  const headers = {
    Authorization: `Bearer ${state.token}`,
    'x-admin-key': ADMIN_KEY,
  };

  const regen = await api('/admin/reports/regenerate', {
    method: 'POST',
    headers,
    body: { enforceEnglish: true },
  });
  assert(regen.ok, `admin regenerate failed ${regen.status}`);
  addResult('E2E: Admin regenerate reports', true, `updated=${regen.data.result.updated}`);

  const mail = await api('/admin/send-test-email', {
    method: 'POST',
    headers,
    body: {
      to: process.env.SMTP_USER,
      subject: 'AI Interview Bot E2E SMTP Test',
      message: 'E2E SMTP verification successful.',
    },
  });
  assert(mail.ok, `admin send email failed ${mail.status}`);
  addResult('E2E: Admin send test email', true, `to=${mail.data.to}`);
}

async function main() {
  try {
    await testSmoke();
    await testAuthAndProfile();
    await testInterviewFlow();
    await testReadApis();
    await testAdminApis();

    const failed = results.filter((r) => !r.pass);
    console.log('');
    console.log('===== E2E SUMMARY =====');
    console.log(`Total: ${results.length}`);
    console.log(`Passed: ${results.length - failed.length}`);
    console.log(`Failed: ${failed.length}`);

    if (failed.length > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    addResult('Test run aborted', false, error.message);
    console.log('');
    console.log('===== E2E SUMMARY =====');
    console.log(`Total: ${results.length}`);
    console.log(`Passed: ${results.filter((r) => r.pass).length}`);
    console.log(`Failed: ${results.filter((r) => !r.pass).length}`);
    process.exitCode = 1;
  }
}

main();
