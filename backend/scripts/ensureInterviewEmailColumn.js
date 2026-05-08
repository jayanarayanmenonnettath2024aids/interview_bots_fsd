require('dotenv').config({ path: __dirname + '/../.env' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    await pool.query('ALTER TABLE interviews ADD COLUMN IF NOT EXISTS report_email_sent_at TIMESTAMPTZ');
    console.log('Interview email column is ready.');
  } catch (error) {
    console.error('Failed to ensure column:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
