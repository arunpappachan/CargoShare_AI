const { query, isPostgresConnected } = require('../config/postgres');

let memoryDocuments = [];

class DocumentRecord {
  constructor(data) {
    this.docId = data.docId || data.doc_id || `DOC-${Date.now()}`;
    this.bookingId = data.bookingId || data.booking_id || null;
    this.type = data.type || 'Other';
    this.fileName = data.fileName || data.file_name || '';
    this.fileUrl = data.fileUrl || data.file_url || '';
    this.status = data.status || 'Pending Review';
    this.uploadedBy = data.uploadedBy || data.uploaded_by || 'Exporter';
    this.date = data.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    this.createdAt = data.createdAt || data.created_at || new Date();
  }

  async save() {
    if (isPostgresConnected()) {
      const sql = `
        INSERT INTO documents (doc_id, booking_id, type, file_name, file_url, status, uploaded_by, date, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (doc_id) DO UPDATE SET
          booking_id = EXCLUDED.booking_id,
          type = EXCLUDED.type,
          file_name = EXCLUDED.file_name,
          file_url = EXCLUDED.file_url,
          status = EXCLUDED.status,
          uploaded_by = EXCLUDED.uploaded_by,
          date = EXCLUDED.date
        RETURNING *;
      `;
      const res = await query(sql, [
        this.docId,
        this.bookingId,
        this.type,
        this.fileName,
        this.fileUrl,
        this.status,
        this.uploadedBy,
        this.date,
        this.createdAt,
      ]);
      return new DocumentRecord(res.rows[0]);
    }

    const idx = memoryDocuments.findIndex(d => d.docId === this.docId);
    if (idx !== -1) {
      memoryDocuments[idx] = this;
    } else {
      memoryDocuments.push(this);
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

const Document = function(data) {
  return new DocumentRecord(data);
};

Document.find = (filter = {}) => {
  const p = (async () => {
    if (isPostgresConnected()) {
      let sql = 'SELECT * FROM documents WHERE 1=1';
      const params = [];

      if (filter.bookingId) {
        params.push(filter.bookingId);
        sql += ` AND booking_id = $${params.length}`;
      }

      sql += ' ORDER BY created_at DESC';
      const res = await query(sql, params);
      return res.rows.map(r => new DocumentRecord(r));
    }

    let results = [...memoryDocuments];
    if (filter.bookingId) {
      results = results.filter(d => d.bookingId === filter.bookingId);
    }
    return results.map(d => new DocumentRecord(d));
  })();
  return new QueryChain(p);
};

Document.create = async (data) => {
  const doc = new DocumentRecord(data);
  return await doc.save();
};

Document.countDocuments = async () => {
  if (isPostgresConnected()) {
    const res = await query('SELECT COUNT(*) AS count FROM documents');
    return parseInt(res.rows[0].count, 10);
  }
  return memoryDocuments.length;
};

Document.insertMany = async (docsList) => {
  const inserted = [];
  for (const item of docsList) {
    const d = new DocumentRecord(item);
    await d.save();
    inserted.push(d);
  }
  return inserted;
};

module.exports = Document;
