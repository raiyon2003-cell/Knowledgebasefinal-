-- Supabase Storage Setup for Documents Bucket

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800, -- 50MB default, override via dashboard if needed
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS Policies

CREATE POLICY "Authenticated users can read documents they have access to"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.file_url = storage.objects.name
        AND public.has_department_access(d.department_id)
        AND (
          d.status = 'published'
          OR public.is_admin()
          OR public.can_manage_department_documents(d.department_id)
          OR d.owner_id = auth.uid()
        )
    )
  );

CREATE POLICY "Authorized users can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.extension(name) = 'pdf')
  );

CREATE POLICY "Authorized users can update document files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.file_url = storage.objects.name
        AND public.can_manage_department_documents(d.department_id)
    )
  );

CREATE POLICY "Authorized users can delete document files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.documents d
        WHERE d.file_url = storage.objects.name
          AND public.can_manage_department_documents(d.department_id)
      )
    )
  );
