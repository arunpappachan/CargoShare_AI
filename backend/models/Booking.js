const { query, isPostgresConnected } = require('../config/postgres');

let memoryBookings = [];

class BookingRecord {
  constructor(data) {
    this.id = data.id || `CS-${Date.now().toString().slice(-4)}`;
    this._id = this.id;
    this.spaceId = data.spaceId || data.space_id || null;
    this.route = data.route || '';
    this.carrier = data.carrier || 'AI Assigned Carrier';
    this.exporterName = data.exporterName || data.exporter_name || 'Global Exports SME';
    this.cbm = Number(data.cbm || 0);
    this.commodity = data.commodity || 'General Cargo';
    this.weight = data.weight ? Number(data.weight) : null;
    this.specialReq = data.specialReq || data.special_req || 'None';
    this.status = data.status || 'Pending Confirmation';
    this.paymentStatus = data.paymentStatus || data.payment_status || 'Advance Paid (25%)';
    this.paymentMethod = data.paymentMethod || data.payment_method || 'UPI Advance (25%)';
    this.amountPaid = Number(data.amountPaid !== undefined ? data.amountPaid : (data.amount_paid || 0));
    this.advanceAmount = Number(data.advanceAmount !== undefined ? data.advanceAmount : (data.advance_amount || 0));
    this.balanceAmount = Number(data.balanceAmount !== undefined ? data.balanceAmount : (data.balance_amount || 0));
    this.totalAmount = Number(data.totalAmount !== undefined ? data.totalAmount : (data.total_amount || 0));
    this.transactionId = data.transactionId || data.transaction_id || null;
    this.documentName = data.documentName || data.document_name || 'Commercial_Invoice.pdf';
    this.documents = Array.isArray(data.documents) ? data.documents : (typeof data.documents === 'string' ? JSON.parse(data.documents || '[]') : ['Commercial_Invoice.pdf', 'Packing_List.pdf', 'Shipping_Bill_EDI.pdf']);
    this.date = data.date || new Date().toISOString().split('T')[0];
    this.createdAt = data.createdAt || data.created_at || new Date();
  }

  async save() {
    if (isPostgresConnected()) {
      const sql = `
        INSERT INTO bookings (
          id, space_id, route, carrier, exporter_name, cbm, commodity, weight,
          special_req, status, payment_status, payment_method, amount_paid,
          advance_amount, balance_amount, total_amount, transaction_id,
          document_name, documents, date, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
        )
        ON CONFLICT (id) DO UPDATE SET
          space_id = EXCLUDED.space_id,
          route = EXCLUDED.route,
          carrier = EXCLUDED.carrier,
          exporter_name = EXCLUDED.exporter_name,
          cbm = EXCLUDED.cbm,
          commodity = EXCLUDED.commodity,
          weight = EXCLUDED.weight,
          special_req = EXCLUDED.special_req,
          status = EXCLUDED.status,
          payment_status = EXCLUDED.payment_status,
          payment_method = EXCLUDED.payment_method,
          amount_paid = EXCLUDED.amount_paid,
          advance_amount = EXCLUDED.advance_amount,
          balance_amount = EXCLUDED.balance_amount,
          total_amount = EXCLUDED.total_amount,
          transaction_id = EXCLUDED.transaction_id,
          document_name = EXCLUDED.document_name,
          documents = EXCLUDED.documents,
          date = EXCLUDED.date
        RETURNING *;
      `;
      const res = await query(sql, [
        this.id,
        this.spaceId,
        this.route,
        this.carrier,
        this.exporterName,
        this.cbm,
        this.commodity,
        this.weight,
        this.specialReq,
        this.status,
        this.paymentStatus,
        this.paymentMethod,
        this.amountPaid,
        this.advanceAmount,
        this.balanceAmount,
        this.totalAmount,
        this.transactionId,
        this.documentName,
        JSON.stringify(this.documents),
        this.date,
        this.createdAt,
      ]);
      return new BookingRecord(res.rows[0]);
    }

    const idx = memoryBookings.findIndex(b => b.id === this.id);
    if (idx !== -1) {
      memoryBookings[idx] = this;
    } else {
      memoryBookings.push(this);
    }
    return this;
  }
}

class QueryChain {
  constructor(promise) {
    this.promise = promise;
  }

  sort(sortFields) {
    return new QueryChain(this.promise);
  }

  then(resolve, reject) {
    return this.promise.then(resolve, reject);
  }

  catch(reject) {
    return this.promise.catch(reject);
  }
}

const Booking = function(data) {
  return new BookingRecord(data);
};

Booking.find = (filter = {}) => {
  const p = (async () => {
    if (isPostgresConnected()) {
      let sql = 'SELECT * FROM bookings WHERE 1=1';
      const params = [];
      if (filter.id) {
        params.push(filter.id);
        sql += ` AND id = $${params.length}`;
      }
      sql += ' ORDER BY created_at DESC';
      const res = await query(sql, params);
      return res.rows.map(r => new BookingRecord(r));
    }
    return memoryBookings.map(b => new BookingRecord(b));
  })();
  return new QueryChain(p);
};

Booking.create = async (data) => {
  const booking = new BookingRecord(data);
  return await booking.save();
};

Booking.findOneAndUpdate = async (filter = {}, update = {}, options = {}) => {
  if (!filter.id) return null;

  if (isPostgresConnected()) {
    const existingRes = await query('SELECT * FROM bookings WHERE id = $1 LIMIT 1', [filter.id]);
    if (existingRes.rows.length === 0) return null;

    const current = new BookingRecord(existingRes.rows[0]);
    Object.assign(current, update);
    return await current.save();
  }

  const idx = memoryBookings.findIndex(b => b.id === filter.id);
  if (idx === -1) return null;
  Object.assign(memoryBookings[idx], update);
  return new BookingRecord(memoryBookings[idx]);
};

Booking.countDocuments = async () => {
  if (isPostgresConnected()) {
    const res = await query('SELECT COUNT(*) AS count FROM bookings');
    return parseInt(res.rows[0].count, 10);
  }
  return memoryBookings.length;
};

Booking.insertMany = async (bookingsList) => {
  const inserted = [];
  for (const item of bookingsList) {
    const b = new BookingRecord(item);
    await b.save();
    inserted.push(b);
  }
  return inserted;
};

module.exports = Booking;
