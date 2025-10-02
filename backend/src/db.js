import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function testDB() {
  await pool.query('SELECT 1');
  console.log('DB connected');
}