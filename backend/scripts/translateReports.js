require('dotenv').config({ path: __dirname + '/../.env' });
const { Pool } = require('pg');
const { generateWithOllama } = require('../src/config/ollama');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const model = process.env.OLLAMA_FEEDBACK_MODEL || 'gemma2:2b';

async function translateText(text) {
  if (!text || text.trim().length === 0) return text;
  try {
    const prompt = `Translate the following text to English. Return only the translated text without any extra commentary:\n\n${text}`;
    const res = await generateWithOllama({ model, prompt, system: 'You are a concise translator. Respond in English only.' });
    return (res || text).trim();
  } catch (err) {
    console.error('Translation failed:', err.message);
    return text;
  }
}

async function main() {
  try {
    const reportsRes = await pool.query('SELECT report_id, user_id, strengths, weaknesses, suggestions FROM reports');
    if (reportsRes.rows.length === 0) {
      console.log('No reports to translate.');
      return;
    }

    for (const r of reportsRes.rows) {
      console.log('Processing report', r.report_id);
      const strengthsEn = await translateText(r.strengths);
      const weaknessesEn = await translateText(r.weaknesses);
      const suggestionsEn = await translateText(r.suggestions);

      await pool.query(
        'UPDATE reports SET strengths = $1, weaknesses = $2, suggestions = $3, updated_at = NOW() WHERE report_id = $4',
        [strengthsEn, weaknessesEn, suggestionsEn, r.report_id],
      );

      console.log('Updated report', r.report_id);
    }

    console.log('All reports processed.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
