-- ============================================================
-- ARTOPIA — Storage Bucket Setup
-- Run this file THIRD in the Supabase SQL Editor
-- ============================================================

-- ============================================================
-- Create artwork-images bucket
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'artwork-images',
  'artwork-images',
  TRUE,
  5242880,  -- 5 MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- ============================================================
-- Storage RLS Policies
-- ============================================================

-- Public read access to all artwork images
CREATE POLICY "artwork_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'artwork-images');

-- Authenticated users can upload artwork (to their own folder)
CREATE POLICY "artwork_images_authenticated_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'artwork-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Users can update their own uploaded files
CREATE POLICY "artwork_images_owner_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'artwork-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- Users can delete their own uploaded files; admins can delete any
CREATE POLICY "artwork_images_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'artwork-images'
    AND (
      auth.uid()::TEXT = (storage.foldername(name))[1]
      OR is_admin()
    )
  );

-- Admins can upload to any path (for event banners/thumbnails)
CREATE POLICY "artwork_images_admin_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'artwork-images'
    AND is_admin()
  );
