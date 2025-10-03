import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

// Database configuration with fallback options
const dbConfig = process.env.DATABASE_URL ? 
  { connectionString: process.env.DATABASE_URL } : 
  {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'invai_db',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
  };

export const pool = new Pool(dbConfig);

export async function testDB() {
  await pool.query('SELECT 1');
  console.log('DB connected');
}