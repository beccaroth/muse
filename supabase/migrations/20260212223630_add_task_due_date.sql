-- Backfill of a migration that was applied directly to the hosted database and never
-- committed, leaving supabase/migrations/ out of sync with production. Recorded remotely
-- as version 20260212223630; the filename matches so `supabase db push` treats it as
-- already applied rather than re-running it.
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE;
