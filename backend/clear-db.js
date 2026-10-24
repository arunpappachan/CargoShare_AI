require('dotenv').config();
const { query, initPostgresTables, isPostgresConnected } = require('./config/postgres');

async function clearDB() {
  try {
    await initPostgresTables();
    if (!isPostgresConnected()) {
      console.log('PostgreSQL not connected.');
      return;
    }

    await query('TRUNCATE TABLE messages, documents, bookings, spaces, users CASCADE');
    console.log('Cleared all PostgreSQL tables (messages, documents, bookings, spaces, users).');
  } catch (err) {
    console.error('Error clearing database:', err.message);
  } finally {
    process.exit(0);
  }
}

clearDB();
