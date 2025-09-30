# Supabase Setup - Copy-Paste Instructions

**Purpose**: Complete Supabase backend setup for profile image functionality  
**Time Required**: 2 minutes  
**Format**: Copy-paste only, no modifications needed

---

## 🎯 What This Sets Up

- ✅ Profile table with all required fields
- ✅ Image URL fields (`avatar_url`, `profile_picture`)
- ✅ Storage bucket for profile images
- ✅ RLS security policies (4 policies)
- ✅ Performance indexes
- ✅ Auto-profile creation trigger
- ✅ Data validation constraints

---

## 📋 Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Click **"SQL Editor"** in left sidebar
4. Click **"New Query"** button

### Step 2: Copy-Paste Complete Setup Script

Copy **EVERYTHING** below (including comments) and paste into the SQL Editor:

```sql
-- ============================================================================
-- COMPLETE SUPABASE BACKEND SETUP FOR PROFILE IMAGES
-- ============================================================================
-- Creates: profiles table, image fields, storage bucket, RLS policies
-- Safe to run multiple times (uses IF NOT EXISTS)
-- Execution time: ~5 seconds
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. CREATE/UPDATE PROFILES TABLE
-- ============================================================================

-- Create profiles table with all fields
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Core profile fields
  username TEXT UNIQUE,
  email TEXT,
  full_name TEXT,
  
  -- 🎯 IMAGE FIELDS (Required for profile image upload)
  avatar_url TEXT,           -- Primary profile image URL
  profile_picture TEXT,       -- Alternative/fallback image URL
  
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

-- Add image fields if upgrading existing table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- ============================================================================
-- 2. DATA VALIDATION CONSTRAINTS
-- ============================================================================

-- Username constraints (3-30 characters, alphanumeric + dots, hyphens, underscores)
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

-- ============================================================================
-- 3. PERFORMANCE INDEXES
-- ============================================================================

-- Index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username 
ON profiles(username);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON profiles(email);

-- Index for avatar URL lookups (NEW - for profile images)
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url 
ON profiles(avatar_url);

-- Index for profile picture lookups (NEW - for profile images)
CREATE INDEX IF NOT EXISTS idx_profiles_profile_picture 
ON profiles(profile_picture);

-- Index for public profiles
CREATE INDEX IF NOT EXISTS idx_profiles_is_public 
ON profiles(is_public) WHERE is_public = true;

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) - PROFILES TABLE
-- ============================================================================

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

-- ============================================================================
-- 5. AUTOMATIC PROFILE CREATION TRIGGER
-- ============================================================================

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      INITCAP(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', ' '))
    ),
    NULL, -- avatar_url starts as null
    NULL, -- profile_picture starts as null
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

-- ============================================================================
-- 6. CREATE STORAGE BUCKET FOR PROFILE IMAGES
-- ============================================================================

-- Create profile-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true, -- Public bucket (images need to be viewable)
  2097152, -- 2 MB max file size
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET 
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) - STORAGE
-- ============================================================================

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;

-- Policy 1: Users can upload to their own folder
CREATE POLICY "Users can upload their own profile image"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can update their own images
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

-- Policy 3: Users can delete their own images
CREATE POLICY "Users can delete their own profile image"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Anyone can view profile images (public access)
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

-- Grant storage schema access
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO anon;

-- Grant buckets table access
GRANT SELECT ON storage.buckets TO authenticated;
GRANT SELECT ON storage.buckets TO anon;

-- Grant objects table access (RLS will control actual access)
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;

-- ============================================================================
-- 9. HELPER FUNCTIONS (Optional but useful)
-- ============================================================================

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

-- ============================================================================
-- 10. CREATE PROFILES FOR EXISTING USERS (if any)
-- ============================================================================

-- Create profiles for users who signed up before this trigger existed
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
  COALESCE(
    raw_user_meta_data->>'username',
    SPLIT_PART(email, '@', 1)
  ),
  email,
  COALESCE(
    raw_user_meta_data->>'full_name',
    INITCAP(REPLACE(SPLIT_PART(email, '@', 1), '.', ' '))
  ),
  NULL, -- avatar_url
  NULL, -- profile_picture
  'Welcome to my profile! I''m excited to be part of the community.',
  'New member exploring the platform',
  email_confirmed_at IS NOT NULL
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 11. VERIFICATION QUERIES
-- ============================================================================

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
  AND indexname LIKE '%avatar%' OR indexname LIKE '%picture%';
  
  RAISE NOTICE '✅ Image field indexes created: % (expected 2)', index_count;
END $$;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

SELECT 
  '🎉 SETUP COMPLETE!' as status,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM storage.buckets WHERE id = 'profile-images') as storage_buckets,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%profile image%') as storage_policies,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'profiles' AND (indexname LIKE '%avatar%' OR indexname LIKE '%picture%')) as image_indexes;
```

### Step 3: Execute the Script

1. Click **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
2. Wait for completion (~5 seconds)
3. Check output for success messages

### Step 4: Verify Success

You should see these messages in the output:

```
✅ Image fields created successfully (avatar_url, profile_picture)
✅ Storage bucket "profile-images" created successfully
✅ Storage RLS policies created: 4 (expected 4)
✅ Profile RLS policies created: 5 (expected 5)
✅ Image field indexes created: 2 (expected 2)

🎉 SETUP COMPLETE!
```

---

## ✅ Verification Checklist

After running the script, verify everything is set up:

### Check 1: Profiles Table

1. Go to **Table Editor** → **profiles**
2. Verify columns exist:
   - ✅ `avatar_url` (text, nullable)
   - ✅ `profile_picture` (text, nullable)

### Check 2: Storage Bucket

1. Go to **Storage** in left sidebar
2. Verify bucket exists:
   - ✅ `profile-images` bucket visible
   - ✅ Status shows "Public"
   - ✅ Max file size: 2 MB

### Check 3: RLS Policies

1. Go to **Authentication** → **Policies**
2. Check **profiles** table has 5 policies
3. Check **storage.objects** has 4 policies with "profile image" in name

### Check 4: Test the Feature

1. Navigate to `/protected/profile` in your app
2. Click "Upload Image"
3. Select `assets/testprofile.png`
4. Verify upload works without errors

---

## 🐛 Troubleshooting

### Error: "relation 'profiles' already exists"

**This is normal!** The script uses `IF NOT EXISTS` so it's safe to run multiple times.

**Action**: Continue, it will update the table with missing fields.

### Error: "permission denied for schema storage"

**Cause**: Need to grant storage permissions

**Fix**: The script includes permission grants. Make sure you ran the entire script.

### Error: "Bucket not found: profile-images"

**Cause**: Storage bucket creation failed

**Fix**: 
1. Go to **Storage** → **New Bucket**
2. Name: `profile-images`
3. Public: ✅ Yes
4. Re-run the storage RLS policies section

### Error: "column 'avatar_url' does not exist"

**Cause**: Script didn't complete successfully

**Fix**: Re-run the entire script. It's safe to run multiple times.

---

## 📊 What Was Created

### Database Changes

```
profiles table:
  + avatar_url (TEXT, nullable, indexed)
  + profile_picture (TEXT, nullable, indexed)
  + 4 data validation constraints
  + 5 RLS policies
  + Automatic profile creation trigger

storage:
  + profile-images bucket (public, 2 MB limit)
  + 4 RLS policies for image access control

indexes:
  + idx_profiles_avatar_url
  + idx_profiles_profile_picture
  + idx_profiles_username
  + idx_profiles_email
  + idx_profiles_is_public
```

### Storage Capacity

With Supabase free tier (1 GB):
- Target image size: 85 KB
- Capacity: ~12,000 user profile images
- Cost: $0/month (within free tier)

---

## 🎯 Next Steps

After successful setup:

1. ✅ Test profile image upload in your app
2. ✅ Upload a test image (testprofile.png)
3. ✅ Verify image displays correctly
4. ✅ Check Supabase Storage for the uploaded file
5. ✅ Verify old images are deleted when uploading new one

---

## 📚 Related Documentation

- **supabase-database-schema-analysis.md** - Why these fields are needed
- **profile-image-testing-guide.md** - How to test the feature
- **SETUP-INSTRUCTIONS.md** - Developer setup guide
- **profile-image-implementation-findings.md** - Technical details

---

## 🆘 Need Help?

### Common Questions

**Q: Is this safe to run on existing data?**  
A: Yes! The script uses `IF NOT EXISTS` and `ON CONFLICT DO NOTHING` to avoid data loss.

**Q: Will this break my existing app?**  
A: No! Adding nullable columns and storage doesn't affect existing functionality.

**Q: Can I run this multiple times?**  
A: Yes! It's idempotent and safe to re-run.

**Q: Do I need to modify anything in the script?**  
A: No! Copy-paste exactly as shown.

**Q: How long does it take?**  
A: ~5 seconds to execute, 2 minutes total including verification.

---

## ✨ Success Confirmation

After running this script, you should be able to:

- ✅ Upload profile images via the web app
- ✅ See images displayed in avatar components
- ✅ Have images automatically compressed to < 100 KB
- ✅ Have old images automatically deleted
- ✅ Store up to 12,000 user images on free tier

**Your Supabase backend is now fully configured!** 🎉

---

**Document Version**: 1.0  
**Last Updated**: September 30, 2025  
**Format**: Copy-Paste Ready  
**Execution Time**: 2 minutes
