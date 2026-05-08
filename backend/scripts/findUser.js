require('dotenv').config({ path: __dirname + '/../.env' });
const { Pool } = require('pg');

const term = process.argv[2] || 'jayanth';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    const { rows } = await pool.query(
      'SELECT user_id, name, email, created_at FROM users WHERE name ILIKE $1 OR email ILIKE $1 ORDER BY created_at DESC LIMIT 10',
      [`%${term}%`],
    );

    if (!rows.length) {
      console.log('No matching users found.');
      return;
    }

    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Lookup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
