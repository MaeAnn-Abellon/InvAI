-- Migration: Repurpose department column to store level (college|senior_high)
-- and course column to store the actual program / strand-section value.

BEGIN;

-- Normalize existing Senior High values
UPDATE users
SET department = 'senior_high'
WHERE department ILIKE 'Senior High';

-- For rows where department currently holds a college program (and course is NULL),
-- move that value into course and set department to 'college'. We treat any department
-- value not equal to 'senior_high' as a college program for migration purposes.
UPDATE users
SET course = department,
    department = 'college'
WHERE (department IS NOT NULL AND department NOT IN ('senior_high'))
  AND (course IS NULL OR course = '');

-- Add (if desired) a CHECK constraint to enforce allowed level values.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'users_department_level') THEN
    ALTER TABLE users
      ADD CONSTRAINT users_department_level CHECK (department IN ('college','senior_high') OR department IS NULL);
  END IF;
END $$;

COMMIT;

-- NOTE: This migration is idempotent for typical cases but always review before re-running.
