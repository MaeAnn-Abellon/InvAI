-- Add 'available' as a valid equipment status
BEGIN;
ALTER TABLE inventory_items DROP CONSTRAINT IF EXISTS inventory_items_status_chk;
ALTER TABLE inventory_items ADD CONSTRAINT inventory_items_status_chk
  CHECK (
    (category = 'supplies'  AND status IN ('in_stock','out_of_stock')) OR
    (category = 'equipment' AND status IN ('available','in_use','for_repair','disposed'))
  );

-- Backfill any equipment rows that might have NULL status (set to available)
UPDATE inventory_items SET status='available' WHERE category='equipment' AND (status IS NULL OR status NOT IN ('available','in_use','for_repair','disposed'));
COMMIT;
