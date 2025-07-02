import { pool } from './client';

export async function initDatabase() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS permissions (
      id SERIAL PRIMARY KEY,
      api_key TEXT NOT NULL,
      module TEXT NOT NULL,
      action TEXT NOT NULL,
      UNIQUE(api_key, module, action)
    );
  `);
}
