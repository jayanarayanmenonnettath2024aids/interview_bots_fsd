require('dotenv').config({ path: __dirname + '/../.env' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    const res = await pool.query("SELECT report_id, user_id, strengths, weaknesses, suggestions, updated_at FROM reports ORDER BY updated_at DESC LIMIT 10;");
    if (res.rows.length === 0) {
      console.log('No reports found.');
      return;
    }

    res.rows.forEach((r) => {
      console.log('---');
      console.log('report_id:', r.report_id);
      console.log('user_id:', r.user_id);
      console.log('updated_at:', r.updated_at);
      console.log('strengths:', r.strengths);
      console.log('weaknesses:', r.weaknesses);
      console.log('suggestions:', r.suggestions);
    });
  } catch (err) {
    console.error('Query failed:', err.message);
  } finally {
    await pool.end();
  }
}

main();
