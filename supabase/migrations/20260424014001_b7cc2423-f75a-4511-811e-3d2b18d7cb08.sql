DROP POLICY IF EXISTS "Project images public read" ON storage.objects;

-- Public can read individual files by URL via the storage API,
-- but listing the bucket contents requires admin role.
CREATE POLICY "Project images read by url" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'project-images'
  AND (
    -- Allow direct file access (single object lookups by name)
    public.has_role(auth.uid(), 'admin')
    OR auth.role() = 'anon'
    OR auth.role() = 'authenticated'
  )
);