// Database connection using Vercel Postgres
import { createPool } from '@vercel/postgres';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

export const sql = {
  query: async (text, params = []) => {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }
};

export async function query(text, params = []) {
  return sql.query(text, params);
}