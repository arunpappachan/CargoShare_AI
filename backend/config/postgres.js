const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT, 10) || 5432,
  database: process.env.PG_DATABASE || 'cargoshare',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  connectionTimeoutMillis: 5000,
});

const connectPostgres = async () => {
  try {
    const client = await pool.connect();
    console.log(`[PostgreSQL] Connected successfully to database: ${process.env.PG_DATABASE || 'cargoshare'}`);
    client.release();
    return pool;
  } catch (error) {
    console.error(`[PostgreSQL] Connection Warning: ${error.message}`);
    return null;
  }
};

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  connectPostgres
};
