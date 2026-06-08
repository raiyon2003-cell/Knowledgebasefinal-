-- Row Level Security Policies

ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ===================== DIVISIONS =====================

CREATE POLICY "Authenticated users can read active divisions"
  ON divisions FOR SELECT
  TO authenticated
  USING (status = 'active' OR is_admin());

CREATE POLICY "Admins can insert divisions"
  ON divisions FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update divisions"
  ON divisions FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete divisions"
  ON divisions FOR DELETE
  TO authenticated
  USING (is_admin());

-- ===================== DEPARTMENTS =====================

CREATE POLICY "Authenticated users can read active departments"
  ON departments FOR SELECT
  TO authenticated
  USING (status = 'active' OR is_admin());

CREATE POLICY "Admins can insert departments"
  ON departments FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update departments"
  ON departments FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete departments"
  ON departments FOR DELETE
  TO authenticated
  USING (is_admin());

-- ===================== USERS =====================

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR is_admin());

CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can update own profile name"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (is_admin());

-- ===================== DOCUMENT TYPES =====================

CREATE POLICY "Authenticated users can read active document types"
  ON document_types FOR SELECT
  TO authenticated
  USING (status = 'active' OR is_admin());

CREATE POLICY "Admins can manage document types"
  ON document_types FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ===================== PROCESS CATEGORIES =====================

CREATE POLICY "Authenticated users can read active process categories"
  ON process_categories FOR SELECT
  TO authenticated
  USING (status = 'active' OR is_admin());

CREATE POLICY "Admins can manage process categories"
  ON process_categories FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ===================== TAGS =====================

CREATE POLICY "Authenticated users can read tags"
  ON tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can insert tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin()
    OR get_user_role() = 'department_manager'
  );

CREATE POLICY "Admins can update tags"
  ON tags FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete tags"
  ON tags FOR DELETE
  TO authenticated
  USING (is_admin());

-- ===================== DOCUMENTS =====================

CREATE POLICY "Users can read documents in accessible departments"
  ON documents FOR SELECT
  TO authenticated
  USING (
    has_department_access(department_id)
    AND (
      status = 'published'
      OR is_admin()
      OR can_manage_department_documents(department_id)
      OR owner_id = auth.uid()
    )
  );

CREATE POLICY "Authorized users can insert documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (can_manage_department_documents(department_id));

CREATE POLICY "Authorized users can update documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (can_manage_department_documents(department_id))
  WITH CHECK (can_manage_department_documents(department_id));

CREATE POLICY "Admins and managers can delete documents"
  ON documents FOR DELETE
  TO authenticated
  USING (can_manage_department_documents(department_id));

-- ===================== DOCUMENT TAGS =====================

CREATE POLICY "Users can read document tags for accessible documents"
  ON document_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_tags.document_id
        AND has_department_access(d.department_id)
    )
  );

CREATE POLICY "Authorized users can manage document tags"
  ON document_tags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_tags.document_id
        AND can_manage_department_documents(d.department_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_tags.document_id
        AND can_manage_department_documents(d.department_id)
    )
  );

-- ===================== AUDIT LOGS =====================

CREATE POLICY "Admins can read all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (is_admin() OR get_user_role() = 'department_manager');

CREATE POLICY "Authenticated users can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
