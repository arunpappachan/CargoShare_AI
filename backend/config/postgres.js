const { Pool, Client } = require('pg');

let isConnected = false;

const getPoolConfig = (overrideDb = null) => {
  if (process.env.DATABASE_URL) {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
    };
  }

  return {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT, 10) || 5432,
    database: overrideDb || process.env.PG_DATABASE || 'cargoshare',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
    connectionTimeoutMillis: 5000,
  };
};

let pool = new Pool(getPoolConfig());

const ensureDatabaseExists = async () => {
  // Only attempt if not using a cloud connection string
  if (process.env.DATABASE_URL) return;

  const targetDb = process.env.PG_DATABASE || 'cargoshare';
  const defaultClient = new Client(getPoolConfig('postgres'));

  try {
    await defaultClient.connect();
    const checkRes = await defaultClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDb]
    );

    if (checkRes.rowCount === 0) {
      console.log(`[PostgreSQL] Database "${targetDb}" does not exist. Creating...`);
      await defaultClient.query(`CREATE DATABASE "${targetDb}"`);
      console.log(`[PostgreSQL] Database "${targetDb}" created successfully.`);
    }
  } catch (err) {
    // If we cannot connect to 'postgres' (e.g. wrong password), log warning and proceed
    console.warn(`[PostgreSQL] Check/create database notice: ${err.message}`);
  } finally {
    try {
      await defaultClient.end();
    } catch (_) {}
  }
};

const initPostgresTables = async () => {
  try {
    await ensureDatabaseExists();

    // Re-create pool if target database was just created
    pool = new Pool(getPoolConfig());

    const client = await pool.connect();
    console.log(`[PostgreSQL] Connected successfully to database: ${process.env.PG_DATABASE || 'cargoshare'}`);
    isConnected = true;

    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'exporter',
        company_name VARCHAR(255) DEFAULT '',
        phone VARCHAR(50) DEFAULT '',
        region VARCHAR(100) DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS spaces (
        id VARCHAR(50) PRIMARY KEY,
        vessel VARCHAR(255) NOT NULL,
        carrier VARCHAR(255) NOT NULL DEFAULT 'Oceanic Freight Ltd.',
        origin VARCHAR(100) NOT NULL,
        dest VARCHAR(100) NOT NULL,
        date VARCHAR(50) NOT NULL,
        capacity NUMERIC NOT NULL,
        available NUMERIC NOT NULL,
        price NUMERIC NOT NULL,
        status VARCHAR(50) DEFAULT 'Available',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(50) PRIMARY KEY,
        space_id VARCHAR(50),
        route VARCHAR(255) NOT NULL,
        carrier VARCHAR(255) DEFAULT 'AI Assigned Carrier',
        exporter_name VARCHAR(255) DEFAULT 'Global Exports SME',
        cbm NUMERIC NOT NULL,
        commodity VARCHAR(255) DEFAULT 'General Cargo',
        weight NUMERIC,
        special_req TEXT DEFAULT 'None',
        status VARCHAR(50) DEFAULT 'Pending Confirmation',
        payment_status VARCHAR(50) DEFAULT 'Advance Paid (25%)',
        payment_method VARCHAR(100) DEFAULT 'UPI Advance (25%)',
        amount_paid NUMERIC DEFAULT 0,
        advance_amount NUMERIC DEFAULT 0,
        balance_amount NUMERIC DEFAULT 0,
        total_amount NUMERIC DEFAULT 0,
        transaction_id VARCHAR(100),
        document_name VARCHAR(255) DEFAULT 'Commercial_Invoice.pdf',
        documents JSONB DEFAULT '[]'::jsonb,
        date VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS documents (
        doc_id VARCHAR(50) PRIMARY KEY,
        booking_id VARCHAR(50),
        type VARCHAR(100) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_url TEXT,
        status VARCHAR(50) DEFAULT 'Pending Review',
        uploaded_by VARCHAR(100) DEFAULT 'Exporter',
        date VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(100) PRIMARY KEY,
        booking_id VARCHAR(50) NOT NULL,
        text TEXT NOT NULL,
        sender_name VARCHAR(100) DEFAULT 'Anonymous',
        role VARCHAR(50) NOT NULL,
        time VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payment_transactions (
        id VARCHAR(100) PRIMARY KEY,
        booking_id VARCHAR(50) NOT NULL,
        razorpay_order_id VARCHAR(100),
        razorpay_payment_id VARCHAR(100) NOT NULL,
        razorpay_signature VARCHAR(255),
        amount NUMERIC NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        milestone VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'captured',
        payment_method VARCHAR(100) DEFAULT 'Razorpay Standard Checkout',
        receipt_number VARCHAR(100),
        carrier_notified BOOLEAN DEFAULT true,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    client.release();
    console.log('[PostgreSQL] Database tables verified / created successfully.');
    return pool;
  } catch (error) {
    console.error(`[PostgreSQL] Connection Warning: ${error.message}`);
    console.log(`[PostgreSQL] Note: Running in fallback mode if PostgreSQL instance is not reachable.`);
    isConnected = false;
    return null;
  }
};

const query = async (text, params) => {
  return pool.query(text, params);
};

const isPostgresConnected = () => isConnected;

module.exports = {
  pool,
  query,
  initPostgresTables,
  isPostgresConnected,
};
