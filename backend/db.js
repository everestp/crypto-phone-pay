const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(":memory:", (err) => {
  if (err) console.error("Database error:", err);
  console.log("Connected to SQLite database");
});

// Initialize database
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      phone_number TEXT PRIMARY KEY,
      wallet_address TEXT,
      encrypted_private_key TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_phone TEXT,
      recipient_phone TEXT,
      amount TEXT,
      tx_hash TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;