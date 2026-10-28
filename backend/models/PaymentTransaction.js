const { query, isPostgresConnected } = require('../config/postgres');

let memoryTransactions = [];

class PaymentTransactionRecord {
  constructor(data) {
    this.id = data.id || `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    this.bookingId = data.bookingId || data.booking_id;
    this.razorpayOrderId = data.razorpayOrderId || data.razorpay_order_id || null;
    this.razorpayPaymentId = data.razorpayPaymentId || data.razorpay_payment_id;
    this.razorpaySignature = data.razorpaySignature || data.razorpay_signature || null;
    this.amount = Number(data.amount || 0);
    this.currency = data.currency || 'INR';
    this.milestone = data.milestone || 'advance_25'; // 'advance_25' | 'remaining_75' | 'full'
    this.status = data.status || 'captured';
    this.paymentMethod = data.paymentMethod || data.payment_method || 'Razorpay Standard Checkout';
    this.receiptNumber = data.receiptNumber || data.receipt_number || `RCPT-${this.bookingId}-${Date.now().toString().slice(-4)}`;
    this.carrierNotified = data.carrierNotified !== undefined ? Boolean(data.carrierNotified) : (data.carrier_notified !== undefined ? Boolean(data.carrier_notified) : true);
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt || data.created_at || new Date();
  }

  async save() {
    if (isPostgresConnected()) {
      try {
        const sql = `
          INSERT INTO payment_transactions (
            id, booking_id, razorpay_order_id, razorpay_payment_id, razorpay_signature,
            amount, currency, milestone, status, payment_method, receipt_number,
            carrier_notified, metadata, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status,
            carrier_notified = EXCLUDED.carrier_notified,
            metadata = EXCLUDED.metadata
          RETURNING *;
        `;
        const res = await query(sql, [
          this.id,
          this.bookingId,
          this.razorpayOrderId,
          this.razorpayPaymentId,
          this.razorpaySignature,
          this.amount,
          this.currency,
          this.milestone,
          this.status,
          this.paymentMethod,
          this.receiptNumber,
          this.carrierNotified,
          JSON.stringify(this.metadata),
          this.createdAt
        ]);
        return new PaymentTransactionRecord(res.rows[0]);
      } catch (err) {
        console.warn('[PostgreSQL] PaymentTransaction save fallback to memory:', err.message);
      }
    }

    const idx = memoryTransactions.findIndex(t => t.id === this.id);
    if (idx !== -1) {
      memoryTransactions[idx] = this;
    } else {
      memoryTransactions.push(this);
    }
    return this;
  }
}

const PaymentTransaction = function(data) {
  return new PaymentTransactionRecord(data);
};

PaymentTransaction.create = async (data) => {
  const txn = new PaymentTransactionRecord(data);
  return await txn.save();
};

PaymentTransaction.findByBookingId = async (bookingId) => {
  if (isPostgresConnected()) {
    try {
      const sql = 'SELECT * FROM payment_transactions WHERE booking_id = $1 ORDER BY created_at DESC';
      const res = await query(sql, [bookingId]);
      return res.rows.map(r => new PaymentTransactionRecord(r));
    } catch (err) {
      console.warn('[PostgreSQL] findByBookingId fallback to memory:', err.message);
    }
  }
  return memoryTransactions
    .filter(t => t.bookingId === bookingId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(t => new PaymentTransactionRecord(t));
};

PaymentTransaction.findAll = async () => {
  if (isPostgresConnected()) {
    try {
      const sql = 'SELECT * FROM payment_transactions ORDER BY created_at DESC';
      const res = await query(sql);
      return res.rows.map(r => new PaymentTransactionRecord(r));
    } catch (err) {
      console.warn('[PostgreSQL] findAll transactions fallback to memory:', err.message);
    }
  }
  return memoryTransactions.map(t => new PaymentTransactionRecord(t));
};

module.exports = PaymentTransaction;
