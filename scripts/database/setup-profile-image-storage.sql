-- Profile Image Storage Setup Script
-- This script sets up the Supabase storage bucket and RLS policies for profile images
-- Optimized for free tier: max 2 MB uploads, stores only compressed 100 KB versions

-- ============================================================================
-- 1. CREATE STORAGE BUCKET
-- ============================================================================

-- Create profile-images bucket (public for easy access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true, -- Public bucket for profile images
  2097152, -- 2 MB max file size (before compression)
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET 
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

-- ============================================================================
-- 2. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on storage.objects (should already be enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean setup)
DROP POLICY IF EXISTS "Users can upload their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;

-- Policy 1: Users can INSERT (upload) their own profile images
CREATE POLICY "Users can upload their own profile image"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can UPDATE their own profile images
CREATE POLICY "Users can update their own profile image"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can DELETE their own profile images
CREATE POLICY "Users can delete their own profile image"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Anyone can SELECT (view) profile images (public access)
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- ============================================================================
-- 3. UPDATE PROFILES TABLE
-- ============================================================================

-- Add avatar_url column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add profile_picture column if it doesn't exist (keep for backwards compatibility)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Create index for faster avatar lookups
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url 
ON profiles(avatar_url);

-- Create index for profile_picture (backwards compatibility)
CREATE INDEX IF NOT EXISTS idx_profiles_profile_picture 
ON profiles(profile_picture);

-- ============================================================================
-- 4. HELPER FUNCTIONS (Optional but useful)
-- ============================================================================

-- Function to get user's profile image URL
CREATE OR REPLACE FUNCTION get_user_avatar_url(user_id UUID)
RETURNS TEXT AS $$
  SELECT avatar_url FROM profiles WHERE id = user_id;
$$ LANGUAGE SQL STABLE;

-- Function to check storage usage for a user
CREATE OR REPLACE FUNCTION get_user_storage_size(user_id UUID)
RETURNS BIGINT AS $$
  SELECT COALESCE(SUM(
    (metadata->>'size')::bigint
  ), 0)::bigint
  FROM storage.objects
  WHERE bucket_id = 'profile-images'
  AND (storage.foldername(name))[1] = user_id::text;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- 5. GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on storage schema to authenticated users
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO anon;

-- Grant access to buckets table
GRANT SELECT ON storage.buckets TO authenticated;
GRANT SELECT ON storage.buckets TO anon;

-- Grant access to objects table (RLS policies will control actual access)
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;

-- ============================================================================
-- 6. VERIFICATION QUERIES
-- ============================================================================

-- Check if bucket was created successfully
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profile-images') THEN
    RAISE NOTICE '✅ Bucket "profile-images" created successfully';
  ELSE
    RAISE WARNING '❌ Bucket "profile-images" was not created';
  END IF;
END $$;

-- Check if RLS policies were created
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%profile image%';
  
  IF policy_count >= 4 THEN
    RAISE NOTICE '✅ RLS policies created successfully (% policies)', policy_count;
  ELSE
    RAISE WARNING '❌ Expected 4 RLS policies, found %', policy_count;
  END IF;
END $$;

-- Check if profile columns exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'avatar_url'
  ) THEN
    RAISE NOTICE '✅ Column "avatar_url" exists in profiles table';
  ELSE
    RAISE WARNING '❌ Column "avatar_url" does not exist in profiles table';
  END IF;
END $$;

-- ============================================================================
-- 7. STORAGE STATISTICS (Run this to check usage)
-- ============================================================================

-- View to see storage usage by user
CREATE OR REPLACE VIEW profile_image_storage_stats AS
SELECT 
  p.id as user_id,
  p.username,
  p.avatar_url,
  COUNT(o.id) as image_count,
  COALESCE(SUM((o.metadata->>'size')::bigint), 0) as total_bytes,
  ROUND(COALESCE(SUM((o.metadata->>'size')::bigint), 0) / 1024.0, 2) as total_kb
FROM profiles p
LEFT JOIN storage.objects o ON o.bucket_id = 'profile-images' 
  AND (storage.foldername(o.name))[1] = p.id::text
GROUP BY p.id, p.username, p.avatar_url
HAVING COUNT(o.id) > 0
ORDER BY total_bytes DESC;

-- Grant access to the view
GRANT SELECT ON profile_image_storage_stats TO authenticated;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

-- Display summary
SELECT 
  '✅ Profile Image Storage Setup Complete!' as status,
  (SELECT COUNT(*) FROM storage.buckets WHERE id = 'profile-images') as buckets_created,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%profile image%') as policies_created,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'profiles' AND column_name IN ('avatar_url', 'profile_picture')) as columns_added;
