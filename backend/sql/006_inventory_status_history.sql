-- Status history table for inventory items
BEGIN;
CREATE TABLE IF NOT EXISTS inventory_item_status_history (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_inventory_item_status_history_item_id ON inventory_item_status_history(item_id);
COMMIT;
