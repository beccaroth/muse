-- Fix: the original policies from 001_initial_schema.sql used `FOR ALL USING (true)`
-- with no TO clause, so they applied to PUBLIC (including the `anon` role that the
-- browser bundle authenticates as before login). 004_enable_rls.sql added
-- authenticated-only policies but never dropped these, and Postgres OR's permissive
-- policies together — so the `USING (true)` grant kept winning and anyone holding the
-- public anon key could read and write every row.
--
-- Drop the permissive policies, then restate the authenticated ones using `TO
-- authenticated` (which restricts by grantee role) instead of the legacy
-- `auth.role()` helper, with an explicit WITH CHECK so INSERT/UPDATE are covered.

DROP POLICY IF EXISTS "Allow all operations on projects" ON projects;
DROP POLICY IF EXISTS "Allow all operations on seeds" ON seeds;
DROP POLICY IF EXISTS "Allow all operations on tasks" ON tasks;

DROP POLICY IF EXISTS "Authenticated access" ON projects;
DROP POLICY IF EXISTS "Authenticated access" ON seeds;
DROP POLICY IF EXISTS "Authenticated access" ON tasks;

CREATE POLICY "Authenticated access" ON projects
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON seeds
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON tasks
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS is already enabled by 001/004; restated here so this migration is
-- self-sufficient if applied to a fresh database.
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
