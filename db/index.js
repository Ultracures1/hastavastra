// Database adapter: uses MySQL when DB_HOST/DB_NAME are configured (production,
// e.g. Hostinger), otherwise falls back to a local SQLite file via node:sqlite
// so the app runs with zero setup in development.
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const useMysql = !!(process.env.DB_HOST && process.env.DB_NAME);

let query; // (sql, params) => rows
let run; // (sql, params) => { insertId, affectedRows }

if (useMysql) {
  const mysql = require("mysql2/promise");
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
  });

  query = async (sql, params = []) => {
    const [rows] = await pool.query(sql, params);
    return rows;
  };
  run = async (sql, params = []) => {
    const [result] = await pool.query(sql, params);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
  };
} else {
  let DatabaseSync;
  try {
    ({ DatabaseSync } = require("node:sqlite"));
  } catch {
    console.error(
      "The SQLite development fallback requires Node.js 22.5 or newer.\n" +
        "Either upgrade Node, or configure MySQL by setting DB_HOST, DB_NAME, " +
        "DB_USER and DB_PASSWORD in .env (see .env.example)."
    );
    process.exit(1);
  }
  const dataDir = path.join(__dirname, "..", "data");
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, "store.sqlite"));
  db.exec("PRAGMA journal_mode = WAL");

  // node:sqlite rejects booleans/undefined as bind values
  const norm = (params) =>
    params.map((p) =>
      p === true ? 1 : p === false ? 0 : p === undefined ? null : p
    );

  query = async (sql, params = []) => db.prepare(sql).all(...norm(params));
  run = async (sql, params = []) => {
    const r = db.prepare(sql).run(...norm(params));
    return { insertId: Number(r.lastInsertRowid), affectedRows: Number(r.changes) };
  };
}

async function upsertSetting(key, value) {
  const json = JSON.stringify(value);
  if (useMysql) {
    await run(
      "INSERT INTO settings (skey, svalue) VALUES (?, ?) ON DUPLICATE KEY UPDATE svalue = VALUES(svalue)",
      [key, json]
    );
  } else {
    await run(
      "INSERT INTO settings (skey, svalue) VALUES (?, ?) ON CONFLICT(skey) DO UPDATE SET svalue = excluded.svalue",
      [key, json]
    );
  }
}

module.exports = {
  dialect: useMysql ? "mysql" : "sqlite",
  query,
  run,
  upsertSetting,
};
