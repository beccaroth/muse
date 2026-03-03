-- Add status to seeds for archive behavior
ALTER TABLE seeds
  ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'archived'));

-- Ensure existing rows are explicitly marked active
UPDATE seeds
SET status = 'active'
WHERE status IS NULL;

CREATE INDEX idx_seeds_status ON seeds(status);
