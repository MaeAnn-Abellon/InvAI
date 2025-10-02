import { pool } from '../db.js';
import bcrypt from 'bcrypt';

const FIELDS = `id, full_name AS "fullName", email, username, role,
 department, course, student_id AS "studentId", avatar_url AS "avatarUrl",
 created_at AS "createdAt", updated_at AS "updatedAt"`;

export async function createUser(data) {
  if (typeof data.fullName !== 'string' ||
      typeof data.email !== 'string' ||
      typeof data.username !== 'string' ||
      typeof data.password !== 'string') {
    throw new Error('Invalid field types');
  }

  // New semantics:
  //  - department column now stores level: 'college' | 'senior_high'
  //  - course column stores program (e.g., IT, Education) or strand-section (e.g., STEM-A)
  const levelRaw = (data.level || data.department || 'college').toString().toLowerCase();
  let level = levelRaw === 'senior high' ? 'senior_high' : levelRaw; // normalize
  if (!['college','senior_high'].includes(level)) level = 'college';

  // Preserve original course casing (was previously forced to lowercase)
  const course = data.course ? data.course.toString().trim() : null;

  const hash = await bcrypt.hash(data.password, 10);
  const q = `
    INSERT INTO users (full_name,email,username,password_hash,role,department,course,student_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING ${FIELDS}`;
  const vals = [
    data.fullName.trim(),
    data.email.trim().toLowerCase(),
    data.username.trim().toLowerCase(),
    hash,
    (data.role || 'student').toLowerCase(),
    level,
    course,
    data.studentId || null
  ];
  const { rows } = await pool.query(q, vals);
  return rows[0];
}

export async function findByEmailOrUsername(identifier) {
  const { rows } = await pool.query(
    `SELECT *, password_hash FROM users WHERE email=$1 OR username=$1 LIMIT 1`,
    [identifier]
  );
  return rows[0];
}

export async function verifyUser(identifier, password) {
  const row = await findByEmailOrUsername(identifier);
  if (!row) return null;
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return null;
  return sanitize(row);
}

export async function getUser(id) {
  const { rows } = await pool.query(`SELECT ${FIELDS} FROM users WHERE id=$1`, [id]);
  return rows[0];
}

export async function getAllUsers() {
  const { rows } = await pool.query(`SELECT ${FIELDS} FROM users ORDER BY id ASC`);
  return rows;
}

export async function updateUser(id, data) {
  const map = {
    fullName: 'full_name',
    department: 'department',
    course: 'course',
    role: 'role',
    studentId: 'student_id',
    email: 'email',
    username: 'username',
    avatarUrl: 'avatar_url'
  };
  const sets = [];
  const values = [];
  let i = 1;
  for (const k of Object.keys(map)) {
    if (data[k] !== undefined) {
      if (k === 'department') {
        // normalize level same way as createUser
        let levelRaw = (data[k]||'').toString().toLowerCase();
        if (levelRaw === 'senior high') levelRaw = 'senior_high';
        if (!['college','senior_high'].includes(levelRaw)) levelRaw = 'college';
        sets.push(`${map[k]}=$${i++}`);
        values.push(levelRaw);
      } else if (k === 'role') {
        sets.push(`${map[k]}=$${i++}`);
        values.push((data[k]||'').toString().toLowerCase());
      } else if (k === 'email') {
        sets.push(`${map[k]}=$${i++}`);
        values.push((data[k]||'').toString().trim().toLowerCase());
      } else if (k === 'username') {
        sets.push(`${map[k]}=$${i++}`);
        values.push((data[k]||'').toString().trim().toLowerCase());
      } else {
        // course & fullName & studentId keep provided casing/value
        sets.push(`${map[k]}=$${i++}`);
        values.push(data[k]);
      }
    }
  }
  if (data.password) {
    sets.push(`password_hash=$${i++}`);
    values.push(await bcrypt.hash(data.password, 10));
  }
  if (!sets.length) return getUser(id);
  values.push(id);
  const q = `UPDATE users SET ${sets.join(', ')} WHERE id=$${i} RETURNING ${FIELDS}`;
  const { rows } = await pool.query(q, values);
  return rows[0];
}

export async function deleteUser(id) {
  await pool.query('DELETE FROM users WHERE id=$1', [id]);
  return { success: true };
}

function sanitize(r) {
  if (!r) return null;
  const {
    password_hash,
    full_name,
    student_id,
    ...rest
  } = r;
  return { ...rest, fullName: full_name, studentId: student_id };
}