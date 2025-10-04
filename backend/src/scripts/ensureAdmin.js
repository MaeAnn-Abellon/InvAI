import { pool } from '../db.js';
import bcrypt from 'bcrypt';

async function ensureAdmin() {
  const username = 'admin';
  const email = 'admin@example.com';
  const password = 'admin123';
  const fullName = 'System Administrator';
  try {
    const { rows } = await pool.query('SELECT id FROM users WHERE username=$1 OR email=$2 LIMIT 1', [username, email]);
    if (rows.length) {
      console.log('[ensureAdmin] Admin already exists (id=' + rows[0].id + ')');
      process.exit(0);
    }
    const hash = await bcrypt.hash(password, 10);
    const insert = `INSERT INTO users (full_name,email,username,password_hash,role,department,course,student_id)
                    VALUES ($1,$2,$3,$4,'admin',NULL,NULL,NULL) RETURNING id`;
    const { rows: ins } = await pool.query(insert, [fullName, email, username, hash]);
    console.log('[ensureAdmin] Admin created with id=' + ins[0].id + '\nCredentials -> username: admin  password: admin123');
    process.exit(0);
  } catch (e) {
    console.error('[ensureAdmin] Error:', e.message);
    process.exit(1);
  }
}

ensureAdmin();