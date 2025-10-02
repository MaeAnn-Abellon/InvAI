-- Add columns to support equipment return workflow
ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS parent_item_id INTEGER REFERENCES inventory_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS claimed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS claim_id INTEGER REFERENCES inventory_claims(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS return_status TEXT; -- null | pending

-- (No backfill necessary; existing in_use rows will not be returnable until updated manually)
