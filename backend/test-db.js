require('dotenv').config();
const { initPostgresTables, query, isPostgresConnected } = require('./config/postgres');

async function testConnections() {
  console.log('==============================================');
  console.log('   CargoShare AI - PostgreSQL Database Test   ');
  console.log('==============================================\n');

  console.log('Connecting to PostgreSQL and verifying tables...');
  try {
    const pool = await initPostgresTables();

    if (isPostgresConnected()) {
      console.log('✅ PostgreSQL Connected & Tables Initialized Successfully!');
      const tableRes = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      console.log('Tables found:');
      tableRes.rows.forEach(r => console.log(`  - ${r.table_name}`));
    } else {
      console.log('ℹ️  PostgreSQL not connected. Application will use in-memory fallback.');
      console.log('  Tip: Check your PG_USER, PG_PASSWORD, PG_DATABASE in backend/.env');
    }
  } catch (err) {
    console.error('❌ PostgreSQL Error:', err.message);
  } finally {
    process.exit(0);
  }
}

testConnections();
