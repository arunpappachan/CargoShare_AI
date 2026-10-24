const { query, isPostgresConnected } = require('../config/postgres');

// In-memory fallback users store
let memoryUsers = [];

class UserRecord {
  constructor(data) {
    this.id = data.id || data._id || `USR-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    this._id = this.id;
    this.name = data.name || '';
    this.email = (data.email || '').toLowerCase().trim();
    this.password = data.password || '';
    this.role = data.role || 'exporter';
    this.companyName = data.companyName || data.company_name || '';
    this.phone = data.phone || '';
    this.region = data.region || '';
    this.createdAt = data.createdAt || data.created_at || new Date();
    this.updatedAt = data.updatedAt || data.updated_at || new Date();
  }

  async save() {
    this.updatedAt = new Date();
    if (isPostgresConnected()) {
      const sql = `
        INSERT INTO users (id, name, email, password, role, company_name, phone, region, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          password = EXCLUDED.password,
          role = EXCLUDED.role,
          company_name = EXCLUDED.company_name,
          phone = EXCLUDED.phone,
          region = EXCLUDED.region,
          updated_at = EXCLUDED.updated_at
        RETURNING *;
      `;
      const res = await query(sql, [
        this.id,
        this.name,
        this.email,
        this.password,
        this.role,
        this.companyName,
        this.phone,
        this.region,
        this.createdAt,
        this.updatedAt,
      ]);
      return new UserRecord(res.rows[0]);
    }

    const idx = memoryUsers.findIndex(u => u.id === this.id);
    if (idx !== -1) {
      memoryUsers[idx] = this;
    } else {
      memoryUsers.push(this);
    }
    return this;
  }
}

class QueryChain {
  constructor(promise) {
    this.promise = promise;
  }

  select(fields) {
    const nextPromise = this.promise.then(result => {
      if (!result) return result;
      const removePassword = fields.includes('-password');
      if (Array.isArray(result)) {
        return result.map(u => {
          const clone = { ...u };
          if (removePassword) delete clone.password;
          return clone;
        });
      }
      const clone = { ...result };
      if (removePassword) delete clone.password;
      return clone;
    });
    return new QueryChain(nextPromise);
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

const User = function(data) {
  return new UserRecord(data);
};

User.findOne = async (filter = {}) => {
  if (filter.email) {
    const email = filter.email.toLowerCase().trim();
    if (isPostgresConnected()) {
      const res = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [email]);
      if (res.rows.length === 0) return null;
      return new UserRecord(res.rows[0]);
    }
    const found = memoryUsers.find(u => u.email.toLowerCase() === email);
    return found ? new UserRecord(found) : null;
  }

  if (filter.id || filter._id) {
    return User.findById(filter.id || filter._id);
  }

  return null;
};

User.findById = (id) => {
  const p = (async () => {
    if (isPostgresConnected()) {
      const res = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
      if (res.rows.length === 0) return null;
      return new UserRecord(res.rows[0]);
    }
    const found = memoryUsers.find(u => u.id === id);
    return found ? new UserRecord(found) : null;
  })();
  return new QueryChain(p);
};

User.create = async (data) => {
  const user = new UserRecord(data);
  return await user.save();
};

User.find = (filter = {}) => {
  const p = (async () => {
    if (isPostgresConnected()) {
      let sql = 'SELECT * FROM users WHERE 1=1';
      const params = [];

      if (filter.role) {
        params.push(filter.role);
        sql += ` AND role = $${params.length}`;
      }

      sql += ' ORDER BY created_at DESC';
      const res = await query(sql, params);
      return res.rows.map(r => new UserRecord(r));
    }

    let results = [...memoryUsers];
    if (filter.role) results = results.filter(u => u.role === filter.role);
    return results.map(r => new UserRecord(r));
  })();
  return new QueryChain(p);
};

User.countDocuments = async () => {
  if (isPostgresConnected()) {
    const res = await query('SELECT COUNT(*) AS count FROM users');
    return parseInt(res.rows[0].count, 10);
  }
  return memoryUsers.length;
};

User.insertMany = async (usersList) => {
  const inserted = [];
  for (const item of usersList) {
    const u = new UserRecord(item);
    await u.save();
    inserted.push(u);
  }
  return inserted;
};

User.deleteOne = async (filter = {}) => {
  if (filter.email) {
    const email = filter.email.toLowerCase().trim();
    if (isPostgresConnected()) {
      await query('DELETE FROM users WHERE LOWER(email) = LOWER($1)', [email]);
      return { deletedCount: 1 };
    }
    const idx = memoryUsers.findIndex(u => u.email.toLowerCase() === email);
    if (idx !== -1) memoryUsers.splice(idx, 1);
    return { deletedCount: 1 };
  }
  return { deletedCount: 0 };
};

module.exports = User;
