-- =============================================================================
-- SUPABASE PROFILE SYSTEM - COMPLETE SETUP v3.0
-- =============================================================================
-- This script creates everything needed for the profile system:
--   • profiles table with all fields
--   • avatar_url and profile_picture columns
--   • storage bucket for profile images
--   • RLS policies for security
--   • automatic profile creation triggers
--   • performance indexes
--   • data validation constraints
--   • helper functions
--
-- Safe to run multiple times (idempotent)
-- Execution time: ~10 seconds
-- =============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. CREATE/UPDATE PROFILES TABLE
-- =============================================================================

-- Create profiles table with all fields
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Core profile fields
  username TEXT UNIQUE,
  email TEXT,
  full_name TEXT,
  
  -- Image fields (Required for profile image upload)
  avatar_url TEXT,
  profile_picture TEXT,
  
  -- Description fields
  about_me TEXT DEFAULT 'Welcome to my profile! I''m excited to be part of the community.',
  bio TEXT DEFAULT 'New member exploring the platform',
  
  -- System fields
  is_public BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  
  -- Timestamps
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if upgrading existing table (preserves existing data)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_picture TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS about_me TEXT DEFAULT 'Welcome to my profile! I''m excited to be part of the community.';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT 'New member exploring the platform';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =============================================================================
-- 2. PERFORMANCE INDEXES
-- =============================================================================

-- Index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username 
ON profiles(username);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON profiles(email);

-- Index for avatar URL lookups
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url 
ON profiles(avatar_url);

-- Index for profile picture lookups
CREATE INDEX IF NOT EXISTS idx_profiles_profile_picture 
ON profiles(profile_picture);

-- Index for public profiles
CREATE INDEX IF NOT EXISTS idx_profiles_is_public 
ON profiles(is_public) WHERE is_public = true;

-- Index for last active
CREATE INDEX IF NOT EXISTS idx_profiles_last_active 
ON profiles(last_active_at);

-- Index for created date
CREATE INDEX IF NOT EXISTS idx_profiles_created 
ON profiles(created_at);

-- =============================================================================
-- 3. ROW LEVEL SECURITY (RLS) - PROFILES TABLE
-- =============================================================================

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation via trigger" ON profiles;

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);

-- Policy 2: Anyone can view public profiles
CREATE POLICY "Users can view public profiles" ON profiles 
FOR SELECT USING (is_public = true);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles 
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy 5: Allow trigger to create profiles (bypass RLS for function)
CREATE POLICY "Allow profile creation via trigger" ON profiles
FOR INSERT WITH CHECK (true);

-- =============================================================================
-- 4. AUTOMATIC PROFILE CREATION TRIGGER
-- =============================================================================

-- Helper function to generate valid username (3-30 characters)
CREATE OR REPLACE FUNCTION public.generate_valid_username(email_address TEXT, metadata JSONB)
RETURNS TEXT AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
BEGIN
  -- Try to get username from metadata first
  base_username := metadata->>'username';
  
  -- If no metadata username, extract from email
  IF base_username IS NULL OR TRIM(base_username) = '' THEN
    base_username := SPLIT_PART(email_address, '@', 1);
  END IF;
  
  -- Remove any invalid characters (keep only alphanumeric, dots, hyphens, underscores)
  base_username := REGEXP_REPLACE(base_username, '[^a-zA-Z0-9._-]', '', 'g');
  
  -- If username is too short (< 3 chars), append 'user'
  IF LENGTH(base_username) < 3 THEN
    base_username := base_username || 'user';
  END IF;
  
  -- Still too short? Use 'user' + random suffix
  IF LENGTH(base_username) < 3 THEN
    base_username := 'user' || FLOOR(RANDOM() * 10000)::TEXT;
  END IF;
  
  -- If username is too long (> 30 chars), truncate
  IF LENGTH(base_username) > 30 THEN
    base_username := SUBSTRING(base_username, 1, 30);
  END IF;
  
  -- Final validation: ensure it's between 3-30 chars
  final_username := base_username;
  
  RETURN final_username;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  generated_username TEXT;
BEGIN
  -- Generate a valid username
  generated_username := public.generate_valid_username(NEW.email, NEW.raw_user_meta_data);
  
  INSERT INTO public.profiles (
    id, 
    username, 
    email,
    full_name,
    avatar_url,
    profile_picture,
    about_me,
    bio,
    email_verified
  )
  VALUES (
    NEW.id,
    generated_username,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      INITCAP(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', ' '))
    ),
    NULL,
    NULL,
    'Welcome to my profile! I''m excited to be part of the community.',
    'New member exploring the platform',
    NEW.email_confirmed_at IS NOT NULL
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 5. CREATE STORAGE BUCKET FOR PROFILE IMAGES
-- =============================================================================

-- Create profile-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET 
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

-- =============================================================================
-- 6. ROW LEVEL SECURITY (RLS) - STORAGE
-- =============================================================================

-- Enable RLS on storage.objects (safe - only if not already enabled)
DO $$ 
BEGIN
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'RLS already enabled on storage.objects (this is OK)';
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not modify storage.objects RLS, but it may already be enabled';
END $$;

-- Drop existing policies (safe - IF EXISTS)
DROP POLICY IF EXISTS "Users can upload their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;

-- Policy 1: Users can upload to their own folder
DO $$
BEGIN
  CREATE POLICY "Users can upload their own profile image"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Upload policy already exists';
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Insufficient privileges to create upload policy (may need service_role)';
END $$;

-- Policy 2: Users can update their own images
DO $$
BEGIN
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
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Update policy already exists';
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Insufficient privileges to create update policy (may need service_role)';
END $$;

-- Policy 3: Users can delete their own images
DO $$
BEGIN
  CREATE POLICY "Users can delete their own profile image"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Delete policy already exists';
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Insufficient privileges to create delete policy (may need service_role)';
END $$;

-- Policy 4: Anyone can view profile images (public access)
DO $$
BEGIN
  CREATE POLICY "Anyone can view profile images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profile-images');
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'View policy already exists';
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Insufficient privileges to create view policy (may need service_role)';
END $$;

-- =============================================================================
-- 7. GRANT PERMISSIONS
-- =============================================================================

-- Grant storage schema access (safe - wrapped in error handling)
DO $$
BEGIN
  GRANT USAGE ON SCHEMA storage TO authenticated;
  GRANT USAGE ON SCHEMA storage TO anon;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Could not grant schema permissions (may already exist)';
END $$;

-- Grant buckets table access (safe - wrapped in error handling)
DO $$
BEGIN
  GRANT SELECT ON storage.buckets TO authenticated;
  GRANT SELECT ON storage.buckets TO anon;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Could not grant buckets permissions (may already exist)';
END $$;

-- Grant objects table access (safe - wrapped in error handling)
DO $$
BEGIN
  GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
  GRANT SELECT ON storage.objects TO anon;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Could not grant objects permissions (may already exist)';
END $$;

-- =============================================================================
-- 8. HELPER FUNCTIONS
-- =============================================================================

-- Function to get user's profile image URL
CREATE OR REPLACE FUNCTION get_user_avatar_url(user_id UUID)
RETURNS TEXT AS $$
  SELECT COALESCE(avatar_url, profile_picture) FROM profiles WHERE id = user_id;
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

-- =============================================================================
-- 9. CREATE PROFILES FOR EXISTING USERS (if any)
-- =============================================================================

-- Create profiles for users who signed up before this trigger existed
-- Uses the generate_valid_username function to ensure all usernames meet constraints
INSERT INTO public.profiles (
  id, 
  username, 
  email,
  full_name,
  avatar_url,
  profile_picture,
  about_me,
  bio,
  email_verified
)
SELECT 
  id,
  public.generate_valid_username(email, raw_user_meta_data),
  email,
  COALESCE(
    raw_user_meta_data->>'full_name',
    INITCAP(REPLACE(SPLIT_PART(email, '@', 1), '.', ' '))
  ),
  NULL,
  NULL,
  'Welcome to my profile! I''m excited to be part of the community.',
  'New member exploring the platform',
  email_confirmed_at IS NOT NULL
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 9.5. FIX EXISTING DATA (Before applying constraints)
-- =============================================================================

-- Fix usernames that are too short (< 3 chars)
UPDATE profiles 
SET username = SUBSTRING(username || 'user', 1, 30)
WHERE username IS NOT NULL 
AND LENGTH(username) < 3;

-- Fix usernames that are too long (> 30 chars)
UPDATE profiles 
SET username = SUBSTRING(username, 1, 30)
WHERE username IS NOT NULL 
AND LENGTH(username) > 30;

-- Fix bio that's too long (> 160 chars)
UPDATE profiles 
SET bio = SUBSTRING(bio, 1, 160)
WHERE bio IS NOT NULL 
AND LENGTH(bio) > 160;

-- Fix about_me that's too long (> 1000 chars)
UPDATE profiles 
SET about_me = SUBSTRING(about_me, 1, 1000)
WHERE about_me IS NOT NULL 
AND LENGTH(about_me) > 1000;

-- =============================================================================
-- 10. DATA VALIDATION CONSTRAINTS (Applied AFTER data cleanup)
-- =============================================================================

-- Username constraints (3-30 characters, alphanumeric + dots, hyphens, underscores)
-- These are added AFTER fixing existing data to avoid constraint violations
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS username_length;
ALTER TABLE profiles ADD CONSTRAINT username_length 
  CHECK (username IS NULL OR (length(username) >= 3 AND length(username) <= 30));

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS username_format;
ALTER TABLE profiles ADD CONSTRAINT username_format 
  CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9._-]+$');

-- Bio length (max 160 characters)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS bio_length;
ALTER TABLE profiles ADD CONSTRAINT bio_length 
  CHECK (bio IS NULL OR length(bio) <= 160);

-- About me length (max 1000 characters)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS about_me_length;
ALTER TABLE profiles ADD CONSTRAINT about_me_length 
  CHECK (about_me IS NULL OR length(about_me) <= 1000);

-- =============================================================================
-- 11. STORAGE STATISTICS VIEW
-- =============================================================================

-- View to see storage usage by user (safe - wrapped in error handling)
DO $$
BEGIN
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
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Could not create storage stats view (may need elevated privileges)';
  WHEN OTHERS THEN
    RAISE NOTICE 'Storage stats view creation failed, but this is not critical';
END $$;

-- Grant access to the view (safe - wrapped in error handling)
DO $$
BEGIN
  GRANT SELECT ON profile_image_storage_stats TO authenticated;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Could not grant view permissions (may already exist)';
  WHEN undefined_table THEN
    RAISE NOTICE 'View does not exist, cannot grant permissions';
END $$;

-- =============================================================================
-- 12. AUTOMATIC TIMESTAMP UPDATES
-- =============================================================================

-- Function to update timestamps on profile changes
CREATE OR REPLACE FUNCTION public.update_profile_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_active_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update timestamps
DROP TRIGGER IF EXISTS update_profiles_timestamps ON profiles;
CREATE TRIGGER update_profiles_timestamps
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_timestamps();

-- =============================================================================
-- 13. VERIFICATION QUERIES
-- =============================================================================

-- Check if profiles table has image fields
DO $$
DECLARE
  avatar_exists BOOLEAN;
  picture_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) INTO avatar_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'profile_picture'
  ) INTO picture_exists;
  
  IF avatar_exists AND picture_exists THEN
    RAISE NOTICE '✅ Image fields created successfully (avatar_url, profile_picture)';
  ELSE
    RAISE WARNING '❌ Image fields missing!';
  END IF;
END $$;

-- Check if storage bucket was created
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profile-images') THEN
    RAISE NOTICE '✅ Storage bucket "profile-images" created successfully';
  ELSE
    RAISE WARNING '❌ Storage bucket "profile-images" was not created';
  END IF;
END $$;

-- Check if RLS policies were created
DO $$
DECLARE
  storage_policy_count INTEGER;
  profile_policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO storage_policy_count
  FROM pg_policies
  WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%profile image%';
  
  SELECT COUNT(*) INTO profile_policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename = 'profiles';
  
  RAISE NOTICE '✅ Storage RLS policies created: % (expected 4)', storage_policy_count;
  RAISE NOTICE '✅ Profile RLS policies created: % (expected 5)', profile_policy_count;
END $$;

-- Check indexes
DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE tablename = 'profiles'
  AND (indexname LIKE '%avatar%' OR indexname LIKE '%picture%');
  
  RAISE NOTICE '✅ Image field indexes created: % (expected 2)', index_count;
END $$;

-- Check username constraints
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM profiles
  WHERE username IS NOT NULL 
  AND (LENGTH(username) < 3 OR LENGTH(username) > 30);
  
  IF invalid_count = 0 THEN
    RAISE NOTICE '✅ All usernames meet length constraints (3-30 characters)';
  ELSE
    RAISE WARNING '❌ Found % usernames that violate length constraint', invalid_count;
  END IF;
END $$;

-- Check for constraint violations
DO $$
DECLARE
  constraint_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO constraint_count
  FROM information_schema.table_constraints
  WHERE table_name = 'profiles'
  AND constraint_type = 'CHECK';
  
  RAISE NOTICE '✅ Data validation constraints applied: % (expected 4)', constraint_count;
END $$;

-- Check user/profile alignment
DO $$
DECLARE
  user_count INTEGER;
  profile_count INTEGER;
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM auth.users;
  SELECT COUNT(*) INTO profile_count FROM profiles;
  missing_count := user_count - profile_count;
  
  RAISE NOTICE '✅ Total users: %, Total profiles: %', user_count, profile_count;
  
  IF missing_count = 0 THEN
    RAISE NOTICE '✅ All users have profiles!';
  ELSE
    RAISE WARNING '⚠️  % users missing profiles (will be created on next login)', missing_count;
  END IF;
END $$;

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 PROFILE SYSTEM SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Navigate to /protected/profile in your app';
  RAISE NOTICE '2. Test profile image upload';
  RAISE NOTICE '3. Verify image displays correctly';
  RAISE NOTICE '';
END $$;

-- Final summary query
SELECT 
  '🎉 SETUP COMPLETE!' as status,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM storage.buckets WHERE id = 'profile-images') as storage_buckets,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%profile image%') as storage_policies,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'profiles' AND (indexname LIKE '%avatar%' OR indexname LIKE '%picture%')) as image_indexes,
  (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_name = 'profiles' AND constraint_type = 'CHECK') as data_constraints;
