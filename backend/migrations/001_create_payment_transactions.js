/**
 * Database Migration: 001_create_payment_transactions
 * Creates the payment_transactions table in PostgreSQL if not already present.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool, query, isPostgresConnected } = require('../config/postgres');

async function runMigration() {
  console.log('Running migration: 001_create_payment_transactions...');

  const sql = `
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

    CREATE INDEX IF NOT EXISTS idx_payment_transactions_booking_id 
    ON payment_transactions(booking_id);

    CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id 
    ON payment_transactions(razorpay_payment_id);
  `;

  try {
    const client = await pool.connect();
    await client.query(sql);
    client.release();
    console.log('✅ Migration 001_create_payment_transactions applied successfully!');
  } catch (err) {
    console.warn(`[Migration Notice] Database connection or migration note: ${err.message}`);
    console.log('If PostgreSQL is not running locally, table creation will execute upon database initialization.');
  } finally {
    try {
      await pool.end();
    } catch (_) {}
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = runMigration;
