const { query, isPostgresConnected } = require('../config/postgres');

let memorySpaces = [];

class SpaceRecord {
  constructor(data) {
    this.id = data.id || `SP-${Date.now()}`;
    this._id = this.id;
    this.vessel = data.vessel || '';
    this.carrier = data.carrier || 'Oceanic Freight Ltd.';
    this.origin = data.origin || '';
    this.dest = data.dest || '';
    this.date = data.date || '';
    this.capacity = Number(data.capacity || 0);
    this.available = Number(data.available !== undefined ? data.available : data.capacity);
    this.price = Number(data.price || 0);
    this.status = data.status || 'Available';
    this.createdAt = data.createdAt || data.created_at || new Date();
  }

  async save() {
    if (isPostgresConnected()) {
      const sql = `
        INSERT INTO spaces (id, vessel, carrier, origin, dest, date, capacity, available, price, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
          vessel = EXCLUDED.vessel,
          carrier = EXCLUDED.carrier,
          origin = EXCLUDED.origin,
          dest = EXCLUDED.dest,
          date = EXCLUDED.date,
          capacity = EXCLUDED.capacity,
          available = EXCLUDED.available,
          price = EXCLUDED.price,
          status = EXCLUDED.status
        RETURNING *;
      `;
      const res = await query(sql, [
        this.id,
        this.vessel,
        this.carrier,
        this.origin,
        this.dest,
        this.date,
        this.capacity,
        this.available,
        this.price,
        this.status,
        this.createdAt,
      ]);
      return new SpaceRecord(res.rows[0]);
    }

    const idx = memorySpaces.findIndex(s => s.id === this.id);
    if (idx !== -1) {
      memorySpaces[idx] = this;
    } else {
      memorySpaces.push(this);
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

const Space = function(data) {
  return new SpaceRecord(data);
};

Space.find = (filter = {}) => {
  const p = (async () => {
    if (isPostgresConnected()) {
      let sql = 'SELECT * FROM spaces WHERE 1=1';
      const params = [];

      if (filter.origin) {
        params.push(`%${filter.origin.source || filter.origin}%`);
        sql += ` AND origin ILIKE $${params.length}`;
      }
      if (filter.dest) {
        params.push(`%${filter.dest.source || filter.dest}%`);
        sql += ` AND dest ILIKE $${params.length}`;
      }
      if (filter.date) {
        params.push(filter.date);
        sql += ` AND date = $${params.length}`;
      }

      sql += ' ORDER BY created_at DESC';
      const res = await query(sql, params);
      return res.rows.map(r => new SpaceRecord(r));
    }

    let results = [...memorySpaces];
    if (filter.origin) {
      const o = (filter.origin.source || filter.origin).toLowerCase();
      results = results.filter(s => s.origin.toLowerCase().includes(o));
    }
    if (filter.dest) {
      const d = (filter.dest.source || filter.dest).toLowerCase();
      results = results.filter(s => s.dest.toLowerCase().includes(d));
    }
    if (filter.date) {
      results = results.filter(s => s.date === filter.date);
    }
    return results.map(r => new SpaceRecord(r));
  })();
  return new QueryChain(p);
};

Space.findOne = async (filter = {}) => {
  if (filter.id) {
    if (isPostgresConnected()) {
      const res = await query('SELECT * FROM spaces WHERE id = $1 LIMIT 1', [filter.id]);
      if (res.rows.length === 0) return null;
      return new SpaceRecord(res.rows[0]);
    }
    const found = memorySpaces.find(s => s.id === filter.id);
    return found ? new SpaceRecord(found) : null;
  }
  return null;
};

Space.create = async (data) => {
  const space = new SpaceRecord(data);
  return await space.save();
};

Space.countDocuments = async () => {
  if (isPostgresConnected()) {
    const res = await query('SELECT COUNT(*) AS count FROM spaces');
    return parseInt(res.rows[0].count, 10);
  }
  return memorySpaces.length;
};

Space.insertMany = async (spacesList) => {
  const inserted = [];
  for (const item of spacesList) {
    const s = new SpaceRecord(item);
    await s.save();
    inserted.push(s);
  }
  return inserted;
};

module.exports = Space;
