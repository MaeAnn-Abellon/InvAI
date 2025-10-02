-- Requests & Voting feature tables
CREATE TABLE IF NOT EXISTS item_requests (
  id SERIAL PRIMARY KEY,
  requested_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'supplies',
  quantity INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  department TEXT, -- copied from requesting user for manager matching
  course TEXT,
  approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  decided_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_item_requests_status ON item_requests(status);
CREATE INDEX IF NOT EXISTS idx_item_requests_dept_course ON item_requests(department,course);

CREATE TABLE IF NOT EXISTS item_request_votes (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES item_requests(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(request_id, user_id)
);

-- Simple trigger to update updated_at
CREATE OR REPLACE FUNCTION trg_item_requests_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS item_requests_updated ON item_requests;
CREATE TRIGGER item_requests_updated BEFORE UPDATE ON item_requests
FOR EACH ROW EXECUTE FUNCTION trg_item_requests_updated();