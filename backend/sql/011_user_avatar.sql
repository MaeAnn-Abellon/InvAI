-- Add avatar_url column to users for profile images
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;