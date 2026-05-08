require('dotenv').config({ path: __dirname + '/../.env' });
const { regenerateReports } = require('../src/services/reportService');

async function main() {
  const args = process.argv.slice(2);
  const userArg = args.find((arg) => arg.startsWith('--userId='));
  const userId = userArg ? userArg.split('=')[1] : null;
  const enforceEnglish = !args.includes('--no-english');

  try {
    const result = await regenerateReports({ userId, enforceEnglish });
    console.log('Report regeneration completed.');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Regeneration failed:', error.message);
    process.exitCode = 1;
  }
}

main();
