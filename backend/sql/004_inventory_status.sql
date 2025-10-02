-- Adds status column and constraints to inventory_items
BEGIN;
ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS status TEXT;

-- Backfill existing rows with defaults where null
UPDATE inventory_items SET category = COALESCE(NULLIF(TRIM(category),'') ,'supplies') WHERE category IS NULL OR TRIM(category)='';
UPDATE inventory_items SET status = 'in_stock' WHERE status IS NULL AND category = 'supplies';
UPDATE inventory_items SET status = 'in_use'   WHERE status IS NULL AND category = 'equipment';

-- Create a simple CHECK constraint (drop + recreate for idempotency)
ALTER TABLE inventory_items DROP CONSTRAINT IF EXISTS inventory_items_status_chk;
ALTER TABLE inventory_items ADD CONSTRAINT inventory_items_status_chk
  CHECK (
    (category = 'supplies'  AND status IN ('in_stock','out_of_stock')) OR
    (category = 'equipment' AND status IN ('in_use','for_repair','disposed'))
  );
COMMIT;
