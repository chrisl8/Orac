// Persistent user data in SQLite database.
// If the database doesn't exist, it will be created.
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import { dirname } from "path";

// https://stackoverflow.com/a/64383997/4982408
// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);

const dbName = `${__dirname}/database.sqlite`;
const db = new sqlite3.Database(dbName, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the database.");
});

// eslint-disable-next-line func-names
db.query = function (sql, params) {
  const that = this;
  return new Promise((resolve, reject) => {
    that.all(sql, params, (error, rows) => {
      if (error) reject(error);
      else resolve({ rows });
    });
  });
};

// Database Initialization
// Creating the PersistentData table if it does not exist.
try {
  const sqlCreatePersistentDataTable = `CREATE TABLE IF NOT EXISTS PersistentData (
      key TEXT PRIMARY KEY,
      value TEXT,
      timestamp INTEGER
    );`;
  await db.query(sqlCreatePersistentDataTable, []);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

async function set(key, value = null) {
  const timestamp = new Date().getTime();
  const sqlInsert =
    "INSERT OR REPLACE INTO PersistentData (key, value, timestamp) VALUES ($1, $2, $3);";
  await db.query(sqlInsert, [key, value, timestamp]);
}

async function get(key) {
  const response = {
    key,
    value: null,
    timestamp: 0,
  };
  const sql = "SELECT value, timestamp FROM PersistentData WHERE key = ?";
  const result = await db.query(sql, [key]);
  if (result && result.hasOwnProperty("rows") && result.rows.length === 1) {
    response.value = result.rows[0].value;
    if (result.rows[0].timestamp) {
      response.timestamp = result.rows[0].timestamp;
    }
  }
  return response;
}

async function del(key) {
  const sql = "DELETE FROM PersistentData WHERE key = ?";
  await db.query(sql, [key]);
}

export default { set, get, del };
