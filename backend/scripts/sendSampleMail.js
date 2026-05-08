require('dotenv').config({ path: __dirname + '/../.env' });
const { Pool } = require('pg');
const { sendMail } = require('../src/utils/email');

const term = process.argv[2] || 'jayanth';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    const { rows } = await pool.query(
      'SELECT user_id, name, email FROM users WHERE name ILIKE $1 OR email ILIKE $1 ORDER BY created_at DESC LIMIT 1',
      [`%${term}%`],
    );

    if (!rows.length) {
      console.log('No matching user found.');
      process.exitCode = 1;
      return;
    }

    const user = rows[0];
    const message = `Hello ${user.name},\n\nThis is a sample email from AI Interview Bot. Your email configuration is working correctly.\n\nRegards,\nAI Interview Bot`;

    const info = await sendMail({
      to: user.email,
      subject: 'AI Interview Bot - Sample Email',
      text: message,
      html: `<p>Hello ${user.name},</p><p>This is a sample email from AI Interview Bot. Your email configuration is working correctly.</p><p>Regards,<br/>AI Interview Bot</p>`,
    });

    console.log(JSON.stringify({
      user: { user_id: user.user_id, name: user.name, email: user.email },
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
