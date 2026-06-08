-- SegWitz Knowledge Base - Initial Schema
-- Run this migration in Supabase SQL Editor or via Supabase CLI

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enums
CREATE TYPE user_role AS ENUM (
  'admin',
  'department_manager',
  'team_member',
  'view_only'
);

CREATE TYPE entity_status AS ENUM ('active', 'inactive');

CREATE TYPE document_status AS ENUM ('draft', 'published', 'archived');

CREATE TYPE audit_action AS ENUM (
  'upload',
  'edit',
  'delete',
  'publish',
  'archive',
  'file_replacement'
);

-- Divisions
CREATE TABLE divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  status entity_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Departments
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  manager_id UUID,
  status entity_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (division_id, name)
);

-- Users (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'team_member',
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  status entity_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE departments
  ADD CONSTRAINT departments_manager_id_fkey
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

-- Document Types
CREATE TABLE document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  status entity_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Process Categories
CREATE TABLE process_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  status entity_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tags
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE RESTRICT,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  document_type_id UUID NOT NULL REFERENCES document_types(id) ON DELETE RESTRICT,
  process_category_id UUID NOT NULL REFERENCES process_categories(id) ON DELETE RESTRICT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  version TEXT NOT NULL DEFAULT '1.0',
  status document_status NOT NULL DEFAULT 'draft',
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

-- Document Tags (junction)
CREATE TABLE document_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE (document_id, tag_id)
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for search and filtering
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department_id ON users(department_id);
CREATE INDEX idx_users_status ON users(status);

CREATE INDEX idx_departments_division_id ON departments(division_id);
CREATE INDEX idx_departments_manager_id ON departments(manager_id);
CREATE INDEX idx_departments_status ON departments(status);

CREATE INDEX idx_divisions_status ON divisions(status);
CREATE INDEX idx_divisions_name ON divisions(name);

CREATE INDEX idx_document_types_status ON document_types(status);
CREATE INDEX idx_process_categories_status ON process_categories(status);

CREATE INDEX idx_tags_name ON tags(name);

CREATE INDEX idx_documents_title ON documents USING gin (title gin_trgm_ops);
CREATE INDEX idx_documents_summary ON documents USING gin (summary gin_trgm_ops);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_division_id ON documents(division_id);
CREATE INDEX idx_documents_department_id ON documents(department_id);
CREATE INDEX idx_documents_document_type_id ON documents(document_type_id);
CREATE INDEX idx_documents_process_category_id ON documents(process_category_id);
CREATE INDEX idx_documents_owner_id ON documents(owner_id);
CREATE INDEX idx_documents_updated_at ON documents(updated_at DESC);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

CREATE INDEX idx_document_tags_document_id ON document_tags(document_id);
CREATE INDEX idx_document_tags_tag_id ON document_tags(tag_id);

CREATE INDEX idx_audit_logs_document_id ON audit_logs(document_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_divisions_updated_at
  BEFORE UPDATE ON divisions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_types_updated_at
  BEFORE UPDATE ON document_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_categories_updated_at
  BEFORE UPDATE ON process_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profile on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'team_member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Helper: check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Helper: check department access for managers
CREATE OR REPLACE FUNCTION has_department_access(dept_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.status = 'active'
      AND (
        u.role = 'admin'
        OR (u.role = 'department_manager' AND u.department_id = dept_id)
        OR u.role IN ('team_member', 'view_only')
      )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Helper: can manage documents in department
CREATE OR REPLACE FUNCTION can_manage_department_documents(dept_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.status = 'active'
      AND (
        u.role = 'admin'
        OR (u.role = 'department_manager' AND u.department_id = dept_id)
      )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;
