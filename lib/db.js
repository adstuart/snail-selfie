// Database connection using Vercel Postgres
import { sql } from '@vercel/postgres';

export { sql };

// Helper function to execute queries safely
export async function query(text, params = []) {
  try {
    const result = await sql.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
