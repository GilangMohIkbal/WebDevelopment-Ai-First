// Connection pool singleton.
// Dibuat sekali, digunakan oleh semua repository method.
// Credentials dibaca dari environment variables (dimuat oleh dotenv di app.js).

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Kembalikan BIGINT sebagai number (bukan BigInt) dan DECIMAL sebagai string
  // agar casting dilakukan secara eksplisit di repository.
  supportBigNumbers: true,
  bigNumberStrings: false,
});

module.exports = pool;
