-- Add notes field to projects table for rich text content (stored as HTML)
ALTER TABLE projects ADD COLUMN notes TEXT;
