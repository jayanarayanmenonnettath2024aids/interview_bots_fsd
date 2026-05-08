require('dotenv').config();

const { app } = require('./app');
const { pool } = require('./config/db');

const port = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await pool.query('SELECT NOW()');
    app.listen(port, () => {
      console.log(`AI Interview Bot backend running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

bootstrap();
