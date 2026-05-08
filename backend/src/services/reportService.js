const { pool } = require('../config/db');
const { generateWithOllama } = require('../config/ollama');
const { upsertReport } = require('./dataService');

const feedbackModel = process.env.OLLAMA_FEEDBACK_MODEL || 'gemma2:2b';

async function translateToEnglish(text) {
  if (!text || !text.trim()) {
    return text || '';
  }

  const prompt = `Translate the following text to English. Return only the translated text.\n\n${text}`;
  const response = await generateWithOllama({
    model: feedbackModel,
    prompt,
    system: 'You are a translator. Respond in English only.',
  });

  return (response || text).trim();
}

async function regenerateReports({ userId = null, enforceEnglish = true } = {}) {
  const sql = `
    SELECT DISTINCT ON (i.user_id)
      i.user_id,
      r.strengths,
      r.weaknesses,
      r.suggestions,
      r.created_at
    FROM interviews i
    INNER JOIN questions q ON q.interview_id = i.interview_id
    INNER JOIN responses r ON r.question_id = q.question_id
    WHERE ($1::uuid IS NULL OR i.user_id = $1)
    ORDER BY i.user_id, r.created_at DESC
  `;

  const { rows } = await pool.query(sql, [userId]);

  let updated = 0;
  for (const row of rows) {
    const strengths = enforceEnglish ? await translateToEnglish(row.strengths) : row.strengths;
    const weaknesses = enforceEnglish ? await translateToEnglish(row.weaknesses) : row.weaknesses;
    const suggestions = enforceEnglish ? await translateToEnglish(row.suggestions) : row.suggestions;

    await upsertReport({
      userId: row.user_id,
      strengths,
      weaknesses,
      suggestions,
    });

    updated += 1;
  }

  return {
    scanned: rows.length,
    updated,
    userId,
    enforceEnglish,
  };
}

module.exports = {
  regenerateReports,
};
