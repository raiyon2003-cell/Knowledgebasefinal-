-- Optional seed data for SegWitz Knowledge Base
-- Run after migrations and creating your first admin user via Supabase Auth

-- Example divisions
INSERT INTO divisions (name, description, status) VALUES
  ('Operations', 'Core business operations and delivery', 'active'),
  ('Technology', 'Engineering, IT, and product development', 'active'),
  ('Corporate', 'HR, Finance, Legal, and Administration', 'active')
ON CONFLICT (name) DO NOTHING;

-- Example departments (requires divisions above)
INSERT INTO departments (division_id, name, status)
SELECT d.id, dept.name, 'active'
FROM divisions d
JOIN (VALUES
  ('Operations', 'General Operations'),
  ('Operations', 'Client Delivery'),
  ('Technology', 'Engineering'),
  ('Technology', 'IT Support'),
  ('Corporate', 'Human Resources'),
  ('Corporate', 'Finance')
) AS dept(division_name, name) ON d.name = dept.division_name
ON CONFLICT (division_id, name) DO NOTHING;

-- Example document types
INSERT INTO document_types (name, description, status) VALUES
  ('SOP', 'Standard Operating Procedure', 'active'),
  ('Policy', 'Company policy document', 'active'),
  ('Guideline', 'Best practice guideline', 'active'),
  ('Manual', 'Reference manual or handbook', 'active')
ON CONFLICT (name) DO NOTHING;

-- Example process categories
INSERT INTO process_categories (name, description, status) VALUES
  ('Onboarding', 'Employee and client onboarding processes', 'active'),
  ('Quality Assurance', 'QA and compliance processes', 'active'),
  ('Security', 'Information security procedures', 'active'),
  ('Project Management', 'Project delivery workflows', 'active')
ON CONFLICT (name) DO NOTHING;

-- Example tags
INSERT INTO tags (name) VALUES
  ('confidential'),
  ('mandatory'),
  ('review-required'),
  ('client-facing'),
  ('internal-only')
ON CONFLICT (name) DO NOTHING;

-- To promote a user to admin after signup, run:
-- UPDATE users SET role = 'admin' WHERE email = 'admin@segwitz.com';
