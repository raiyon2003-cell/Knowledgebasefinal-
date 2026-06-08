-- Performance indexes for common query patterns

CREATE INDEX IF NOT EXISTS idx_documents_status_updated_at
  ON documents(status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_dept_status_updated
  ON documents(department_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by
  ON documents(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created
  ON audit_logs(action, created_at DESC);
