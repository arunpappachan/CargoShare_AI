require('dotenv').config();
const mongoose = require('mongoose');
const { Pool } = require('pg');

async function testConnections() {
  console.log('==============================================');
  console.log('   CargoShare AI - Database Connection Test   ');
  console.log('==============================================\n');

  // 1. Test MongoDB
  console.log('[1/2] Testing MongoDB Connection...');
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/cargoshare';
  console.log(`Connecting to: ${mongoURI}`);
  try {
    const conn = await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
    console.log(' MongoDB Connected Successfully!');
    console.log(`  - Host: ${conn.connection.host}`);
    console.log(`  - Port: ${conn.connection.port}`);
    console.log(`  - Database: ${conn.connection.name}`);
    await mongoose.disconnect();
  } catch (err) {
    console.error(' MongoDB Connection Failed:', err.message);
    console.log('  Tip: Check your MONGO_URI in backend/.env or ensure your local MongoDB service / Atlas cluster is reachable.');
  }

  console.log('\n----------------------------------------------\n');

  // 2. Test PostgreSQL (Optional)
  console.log('[2/2] Testing PostgreSQL Connection...');
  const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT, 10) || 5432,
    database: process.env.PG_DATABASE || 'cargoshare',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
    connectionTimeoutMillis: 5000,
  });

  try {
    const client = await pool.connect();
    console.log(' PostgreSQL Connected Successfully!');
    console.log(`  - Host: ${process.env.PG_HOST || 'localhost'}`);
    console.log(`  - Port: ${process.env.PG_PORT || 5432}`);
    console.log(`  - Database: ${process.env.PG_DATABASE || 'cargoshare'}`);
    client.release();
    await pool.end();
  } catch (err) {
    console.log('ℹ️  PostgreSQL not connected (Optional):', err.message);
    console.log('  Note: CargoShare AI uses MongoDB as the primary store for spaces and bookings. Postgres is optional.');
  }

  console.log('\n==============================================');
  console.log('            Test Run Complete                 ');
  console.log('==============================================');
}

testConnections();
