-- Add in_use_quantity to track partial usage of multi-unit equipment items
ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS in_use_quantity INTEGER NOT NULL DEFAULT 0;

-- Optional: backfill logic could go here if needed (none required; defaults to 0)
