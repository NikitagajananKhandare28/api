const { Pool } = require('pg');

// DATABASE_URL is provided by the hosting platform (Render/Railway) in production.
// Falls back to a local connection string for local development.
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/taskapi_test';

const pool = new Pool({
  connectionString,
  // Render/Railway hosted Postgres require SSL; local dev does not.
  ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
});

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      completed BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `);
}

module.exports = { pool, initSchema };
