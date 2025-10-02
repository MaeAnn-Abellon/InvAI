CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student','teacher','staff','manager','admin')),
  department TEXT,            -- e.g. College, SHS, IT, etc.
  course TEXT,                -- BSIT, BSHM, BEED, BSED, BSENTREP, BPED
  student_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION trg_users_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated ON users;
CREATE TRIGGER users_updated BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION trg_users_updated();