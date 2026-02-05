-- Enable Row Level Security on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users only
CREATE POLICY "Authenticated access" ON projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON seeds FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON tasks FOR ALL USING (auth.role() = 'authenticated');
