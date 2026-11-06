-- Museboard schema for Neon.
--
-- Consolidates supabase/migrations/001-005, 20260212223630 and 20260303185439 into one
-- file. The Supabase-only migrations are not carried over:
--   * 004_enable_rls / 20260812174330_fix_permissive_rls_policies used Supabase's
--     auth.role(); access control is restated below for Neon's Data API roles.
--   * 20260812180858_create_notes_images_bucket created a Supabase Storage bucket; image
--     uploads were removed from the app in the move to Neon.
--
-- Prerequisite: Neon Auth and the Data API must be enabled on the branch first. Enabling
-- the Data API creates the `authenticated` and `anonymous` roles and the auth.user_id()
-- function referenced below.

CREATE TYPE project_status AS ENUM ('Not started', 'On hold', 'In progress', 'Done');
CREATE TYPE project_priority AS ENUM ('Now', 'Next', 'Someday');

-- project_types is TEXT[] so custom types can be added without a migration.
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name TEXT NOT NULL,
    status project_status NOT NULL DEFAULT 'Not started',
    priority project_priority NOT NULL DEFAULT 'Someday',
    project_types TEXT[] DEFAULT '{}',
    description TEXT,
    start_date DATE,
    end_date DATE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    icon TEXT,
    notes TEXT -- rich text, stored as HTML
);

-- Seeds: inbox for ideas. project_type is TEXT so custom types can be added.
CREATE TABLE seeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    project_type TEXT,
    date_added DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    icon TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived'))
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date DATE
);

CREATE INDEX idx_projects_priority ON projects(priority);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_seeds_date ON seeds(date_added);
CREATE INDEX idx_seeds_status ON seeds(status);
CREATE INDEX idx_tasks_project ON tasks(project_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seeds_updated_at
    BEFORE UPDATE ON seeds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Access control.
--
-- The Data API runs each request as `authenticated` (valid Neon Auth JWT) or `anonymous`
-- (no JWT). The GRANT lets a role touch the table at all; the policy decides which rows.
--
-- Single-user app: rows are restricted to the owner's Neon Auth user ID rather than to
-- any signed-in user. Email sign-up is disabled, but Neon Auth also enables shared Google
-- sign-in by default, which can create new users — so "any authenticated user" would not
-- mean "the owner". auth.user_id() is the JWT `sub` claim, set by the Data API.
--
-- To change the owner, update the ID in all three policies.
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON projects, seeds, tasks FROM anonymous;
GRANT SELECT, INSERT, UPDATE, DELETE ON projects, seeds, tasks TO authenticated;

CREATE POLICY "Owner access" ON projects FOR ALL TO authenticated
    USING (auth.user_id() = '2b2a627e-2161-4cd6-aea4-2476358b573f')
    WITH CHECK (auth.user_id() = '2b2a627e-2161-4cd6-aea4-2476358b573f');
CREATE POLICY "Owner access" ON seeds FOR ALL TO authenticated
    USING (auth.user_id() = '2b2a627e-2161-4cd6-aea4-2476358b573f')
    WITH CHECK (auth.user_id() = '2b2a627e-2161-4cd6-aea4-2476358b573f');
CREATE POLICY "Owner access" ON tasks FOR ALL TO authenticated
    USING (auth.user_id() = '2b2a627e-2161-4cd6-aea4-2476358b573f')
    WITH CHECK (auth.user_id() = '2b2a627e-2161-4cd6-aea4-2476358b573f');
