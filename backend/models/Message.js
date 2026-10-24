const { query, isPostgresConnected } = require('../config/postgres');

let memoryMessages = [];

class MessageRecord {
  constructor(data) {
    this.id = data.id || `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    this.bookingId = data.bookingId || data.booking_id || '';
    this.text = data.text || '';
    this.senderName = data.senderName || data.sender_name || 'Anonymous';
    this.role = data.role || 'exporter';
    this.time = data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.createdAt = data.createdAt || data.created_at || new Date();
  }

  async save() {
    if (isPostgresConnected()) {
      const sql = `
        INSERT INTO messages (id, booking_id, text, sender_name, role, time, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          booking_id = EXCLUDED.booking_id,
          text = EXCLUDED.text,
          sender_name = EXCLUDED.sender_name,
          role = EXCLUDED.role,
          time = EXCLUDED.time
        RETURNING *;
      `;
      const res = await query(sql, [
        this.id,
        this.bookingId,
        this.text,
        this.senderName,
        this.role,
        this.time,
        this.createdAt,
      ]);
      return new MessageRecord(res.rows[0]);
    }

    const idx = memoryMessages.findIndex(m => m.id === this.id);
    if (idx !== -1) {
      memoryMessages[idx] = this;
    } else {
      memoryMessages.push(this);
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

const Message = function(data) {
  return new MessageRecord(data);
};

Message.find = (filter = {}) => {
  const p = (async () => {
    if (isPostgresConnected()) {
      let sql = 'SELECT * FROM messages WHERE 1=1';
      const params = [];

      if (filter.bookingId) {
        params.push(filter.bookingId);
        sql += ` AND booking_id = $${params.length}`;
      }

      sql += ' ORDER BY created_at ASC';
      const res = await query(sql, params);
      return res.rows.map(r => new MessageRecord(r));
    }

    let results = [...memoryMessages];
    if (filter.bookingId) {
      results = results.filter(m => m.bookingId === filter.bookingId);
    }
    return results.map(m => new MessageRecord(m));
  })();
  return new QueryChain(p);
};

Message.create = async (data) => {
  const message = new MessageRecord(data);
  return await message.save();
};

Message.countDocuments = async () => {
  if (isPostgresConnected()) {
    const res = await query('SELECT COUNT(*) AS count FROM messages');
    return parseInt(res.rows[0].count, 10);
  }
  return memoryMessages.length;
};

Message.insertMany = async (messagesList) => {
  const inserted = [];
  for (const item of messagesList) {
    const m = new MessageRecord(item);
    await m.save();
    inserted.push(m);
  }
  return inserted;
};

module.exports = Message;
