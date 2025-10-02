-- 007_inventory_claims.sql
-- Table to track user claims (request to use/consume an inventory item)
-- status: pending | approved | rejected
-- For supplies: quantity field represents units requested (default 1)
-- For equipment: quantity should always be 1 and item status will switch to 'in_use' when approved.

CREATE TABLE IF NOT EXISTS inventory_claims (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  requested_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  decided_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_inventory_claims_item ON inventory_claims(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_claims_requested_by ON inventory_claims(requested_by);
CREATE INDEX IF NOT EXISTS idx_inventory_claims_status ON inventory_claims(status);
