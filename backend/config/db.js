// MongoDB has been deprecated in favor of PostgreSQL.
// This file redirects to the PostgreSQL configuration.
const { initPostgresTables, pool, query, isPostgresConnected } = require('./postgres');

module.exports = initPostgresTables;
module.exports.pool = pool;
module.exports.query = query;
module.exports.isPostgresConnected = isPostgresConnected;
