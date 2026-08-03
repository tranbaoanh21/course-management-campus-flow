const mysql = require('mysql2/promise');
const { getEnvironment } = require('./environment');

const { database } = getEnvironment();

const pool = mysql.createPool({
  host: database.host,
  port: database.port,
  user: database.user,
  password: database.password,
  database: database.name,
  ssl: database.ssl
    ? {
        rejectUnauthorized: database.sslRejectUnauthorized,
      }
    : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  enableKeepAlive: true,
  dateStrings: true,
});

async function testDatabaseConnection() {
  const connection = await pool.getConnection();

  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  testDatabaseConnection,
};
