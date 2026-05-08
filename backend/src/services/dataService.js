const { pool } = require('../config/db');

async function findUserByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  return rows[0] || null;
}

async function findUserById(userId) {
  const { rows } = await pool.query('SELECT user_id, name, email, created_at FROM users WHERE user_id = $1 LIMIT 1', [userId]);
  return rows[0] || null;
}

async function createUser({ name, email, passwordHash }) {
  const { rows } = await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING user_id, name, email, created_at',
    [name, email, passwordHash],
  );
  return rows[0];
}

async function updateUserProfile(userId, { name, email }) {
  const { rows } = await pool.query(
    'UPDATE users SET name = COALESCE($2, name), email = COALESCE($3, email) WHERE user_id = $1 RETURNING user_id, name, email, created_at',
    [userId, name || null, email || null],
  );
  return rows[0] || null;
}

async function createInterview({ userId, domain, difficulty, interviewType, questionCount }) {
  const { rows } = await pool.query(
    'INSERT INTO interviews (user_id, domain, difficulty, interview_type, question_count) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, domain, difficulty, interviewType, questionCount || 5],
  );
  return rows[0];
}

async function getInterviewById(interviewId) {
  const { rows } = await pool.query('SELECT * FROM interviews WHERE interview_id = $1 LIMIT 1', [interviewId]);
  return rows[0] || null;
}

async function updateInterviewScore(interviewId, score) {
  const { rows } = await pool.query(
    'UPDATE interviews SET overall_score = $2, updated_at = NOW() WHERE interview_id = $1 RETURNING *',
    [interviewId, score],
  );
  return rows[0] || null;
}

async function completeInterview(interviewId) {
  const { rows } = await pool.query(
    "UPDATE interviews SET status = 'completed', ended_at = NOW(), updated_at = NOW() WHERE interview_id = $1 RETURNING *",
    [interviewId],
  );
  return rows[0] || null;
}
async function markInterviewReportEmailSent(interviewId) {
  const { rows } = await pool.query(
    'UPDATE interviews SET report_email_sent_at = NOW(), updated_at = NOW() WHERE interview_id = $1 RETURNING *',
    [interviewId],
  );
  return rows[0] || null;
}

async function createQuestion({ interviewId, questionText, questionType, domain, difficulty }) {
  const { rows } = await pool.query(
    'INSERT INTO questions (interview_id, question_text, question_type, domain, difficulty) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [interviewId, questionText, questionType, domain, difficulty],
  );
  return rows[0];
}

async function listQuestionsByInterview(interviewId) {
  const { rows } = await pool.query(
    'SELECT * FROM questions WHERE interview_id = $1 ORDER BY created_at ASC',
    [interviewId],
  );
  return rows;
}

async function createResponse({ questionId, answerText, score, feedback, strengths, weaknesses, suggestions }) {
  const { rows } = await pool.query(
    'INSERT INTO responses (question_id, answer_text, score, feedback, strengths, weaknesses, suggestions) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [questionId, answerText, score, feedback, strengths, weaknesses, suggestions],
  );
  return rows[0];
}

async function upsertReport({ userId, strengths, weaknesses, suggestions }) {
  const { rows } = await pool.query(
    `INSERT INTO reports (user_id, strengths, weaknesses, suggestions, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET strengths = EXCLUDED.strengths, weaknesses = EXCLUDED.weaknesses, suggestions = EXCLUDED.suggestions, updated_at = NOW()
     RETURNING *`,
    [userId, strengths, weaknesses, suggestions],
  );
  return rows[0];
}

async function getReportByUserId(userId) {
  const { rows } = await pool.query('SELECT * FROM reports WHERE user_id = $1 LIMIT 1', [userId]);
  return rows[0] || null;
}

async function listInterviewHistory(userId) {
  const { rows } = await pool.query(
    `SELECT i.*, COUNT(q.question_id) AS question_total,
            COALESCE(ROUND(AVG(r.score)::numeric, 2), i.overall_score) AS response_average,
            COALESCE(MAX(r.feedback), '') AS latest_feedback
     FROM interviews i
     LEFT JOIN questions q ON q.interview_id = i.interview_id
     LEFT JOIN responses r ON r.question_id = q.question_id
     WHERE i.user_id = $1
     GROUP BY i.interview_id
     ORDER BY i.created_at DESC`,
    [userId],
  );
  return rows;
}

async function getDashboardOverview(userId) {
  const [summaryResult, recentResult, trendResult, domainResult] = await Promise.all([
    pool.query(
      `SELECT COUNT(*)::int AS interviews_taken,
              COALESCE(ROUND(AVG(overall_score)::numeric, 2), 0) AS average_score,
              COALESCE(MAX(overall_score), 0) AS highest_score,
              COALESCE(COUNT(DISTINCT domain), 0) AS skills_practiced
       FROM interviews
       WHERE user_id = $1`,
      [userId],
    ),
    pool.query(
      `SELECT i.interview_id,
              i.domain,
              i.interview_type,
              i.difficulty,
              i.overall_score,
              i.created_at,
              COALESCE(MAX(r.feedback), 'No feedback yet') AS feedback
       FROM interviews i
       LEFT JOIN questions q ON q.interview_id = i.interview_id
       LEFT JOIN responses r ON r.question_id = q.question_id
       WHERE i.user_id = $1
       GROUP BY i.interview_id
       ORDER BY i.created_at DESC
       LIMIT 4`,
      [userId],
    ),
    pool.query(
      `SELECT TO_CHAR(created_at, 'Mon DD') AS label, ROUND(overall_score::numeric, 2) AS score
       FROM interviews
       WHERE user_id = $1
       ORDER BY created_at ASC
       LIMIT 6`,
      [userId],
    ),
    pool.query(
      `SELECT domain, ROUND(AVG(overall_score)::numeric, 2) AS score, COUNT(*)::int AS total
       FROM interviews
       WHERE user_id = $1
       GROUP BY domain
       ORDER BY score DESC`,
      [userId],
    ),
  ]);

  const summary = summaryResult.rows[0] || {
    interviews_taken: 0,
    average_score: 0,
    highest_score: 0,
    skills_practiced: 0,
  };

  return {
    summary: {
      interviewsTaken: Number(summary.interviews_taken),
      averageScore: Number(summary.average_score),
      highestScore: Number(summary.highest_score),
      skillsPracticed: Number(summary.skills_practiced),
    },
    recentInterviews: recentResult.rows.map((row) => ({
      interviewId: row.interview_id,
      title: `${row.domain} Interview`,
      domain: row.domain,
      date: row.created_at,
      score: Number(row.overall_score),
      feedback: row.feedback || 'Pending',
    })),
    trend: trendResult.rows.map((row) => ({ label: row.label, score: Number(row.score) })),
    domainPerformance: domainResult.rows.map((row) => ({ name: row.domain, score: Number(row.score), total: Number(row.total) })),
  };
}

async function getQuestionBank(userId, filters = {}) {
  // Return a global question bank (questions generated for any interviews)
  // Filters apply to question fields (domain, difficulty, search).
  const values = [];
  const conditions = ['1=1'];

  if (filters.domain) {
    values.push(filters.domain);
    conditions.push(`q.domain = $${values.length}`);
  }

  if (filters.difficulty) {
    values.push(filters.difficulty);
    conditions.push(`q.difficulty = $${values.length}`);
  }

  if (filters.search) {
    values.push(`%${filters.search}%`);
    conditions.push(`q.question_text ILIKE $${values.length}`);
  }

  const sql = `
    SELECT q.question_id, q.question_text, q.domain, q.difficulty, q.question_type, q.created_at, q.interview_id
    FROM questions q
    WHERE ${conditions.join(' AND ')}
    ORDER BY q.created_at DESC
    LIMIT 200
  `;

  const { rows } = await pool.query(sql, values);
  return rows;
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserProfile,
  createInterview,
  getInterviewById,
  updateInterviewScore,
  completeInterview,
  markInterviewReportEmailSent,
  createQuestion,
  listQuestionsByInterview,
  createResponse,
  upsertReport,
  getReportByUserId,
  listInterviewHistory,
  getDashboardOverview,
  getQuestionBank,
};
