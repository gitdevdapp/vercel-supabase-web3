-- Enhanced Supabase Database Setup Script
-- Fixes PKCE authentication issues by ensuring proper schema
-- Execute this in your Supabase SQL Editor to resolve authentication errors
-- Date: September 26, 2025

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENHANCED PROFILES TABLE
-- ============================================================================

-- Drop existing table if we need to recreate (CAREFUL - this deletes data!)
-- DROP TABLE IF EXISTS profiles CASCADE;

-- Create enhanced profiles table with comprehensive fields
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Core profile fields
  username TEXT UNIQUE,
  email TEXT, -- Populated from auth.users.email
  full_name TEXT,
  
  -- Visual/social fields  
  avatar_url TEXT,
  profile_picture TEXT, -- Alternative/custom profile picture
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

-- ============================================================================
-- DATA VALIDATION & CONSTRAINTS
-- ============================================================================

-- Add helpful constraints for data quality
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS username_length;
ALTER TABLE profiles ADD CONSTRAINT username_length 
  CHECK (username IS NULL OR (length(username) >= 3 AND length(username) <= 30));

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS username_format;
ALTER TABLE profiles ADD CONSTRAINT username_format 
  CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9._-]+$');

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS bio_length;
ALTER TABLE profiles ADD CONSTRAINT bio_length 
  CHECK (bio IS NULL OR length(bio) <= 160);

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS about_me_length;
ALTER TABLE profiles ADD CONSTRAINT about_me_length 
  CHECK (about_me IS NULL OR length(about_me) <= 1000);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_public ON profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active_at);
CREATE INDEX IF NOT EXISTS idx_profiles_created ON profiles(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles" ON profiles 
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- AUTOMATIC PROFILE CREATION
-- ============================================================================

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Enhanced function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    username, 
    email,
    full_name,
    avatar_url,
    about_me,
    bio,
    email_verified,
    onboarding_completed,
    last_active_at
  )
  VALUES (
    new.id,
    -- Smart username generation with conflict handling
    COALESCE(
      new.raw_user_meta_data->>'username',
      new.raw_user_meta_data->>'name', 
      split_part(new.email, '@', 1)
    ),
    -- Email from auth system
    new.email,
    -- Full name from metadata or derived from email
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      initcap(replace(split_part(new.email, '@', 1), '.', ' '))
    ),
    -- Avatar from OAuth providers or default
    COALESCE(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture',
      null
    ),
    -- Default about me message
    'Welcome to my profile! I''m excited to be part of the community.',
    -- Default bio
    'New member exploring the platform',
    -- Email verified status from auth system
    COALESCE(new.email_confirmed_at IS NOT NULL, false),
    -- Not onboarded yet
    false,
    -- Set last active to now
    NOW()
  );
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    -- Handle username conflicts by appending random number
    INSERT INTO public.profiles (
      id, username, email, full_name, avatar_url, about_me, bio, 
      email_verified, onboarding_completed, last_active_at
    )
    VALUES (
      new.id,
      COALESCE(
        new.raw_user_meta_data->>'username',
        split_part(new.email, '@', 1)
      ) || '_' || floor(random() * 10000)::text,
      new.email,
      COALESCE(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        initcap(replace(split_part(new.email, '@', 1), '.', ' '))
      ),
      COALESCE(
        new.raw_user_meta_data->>'avatar_url',
        new.raw_user_meta_data->>'picture'
      ),
      'Welcome to my profile! I''m excited to be part of the community.',
      'New member exploring the platform',
      COALESCE(new.email_confirmed_at IS NOT NULL, false),
      false,
      NOW()
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- UPDATE EXISTING USERS (MIGRATION)
-- ============================================================================

-- Create profiles for existing users who don't have them
INSERT INTO public.profiles (
  id, 
  username, 
  email,
  full_name,
  avatar_url,
  about_me,
  bio,
  email_verified,
  onboarding_completed,
  last_active_at
)
SELECT 
  au.id,
  -- Generate username from email or metadata
  CASE 
    WHEN au.raw_user_meta_data->>'username' IS NOT NULL THEN au.raw_user_meta_data->>'username'
    WHEN au.raw_user_meta_data->>'name' IS NOT NULL THEN au.raw_user_meta_data->>'name'
    ELSE split_part(au.email, '@', 1)
  END || CASE 
    WHEN EXISTS (
      SELECT 1 FROM profiles p2 
      WHERE p2.username = COALESCE(
        au.raw_user_meta_data->>'username',
        au.raw_user_meta_data->>'name', 
        split_part(au.email, '@', 1)
      )
    ) THEN '_' || floor(random() * 10000)::text
    ELSE ''
  END as username,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    initcap(replace(split_part(au.email, '@', 1), '.', ' '))
  ),
  COALESCE(
    au.raw_user_meta_data->>'avatar_url',
    au.raw_user_meta_data->>'picture'
  ),
  'Welcome to my profile! I''m excited to be part of the community.',
  'New member exploring the platform',
  COALESCE(au.email_confirmed_at IS NOT NULL, false),
  false,
  COALESCE(au.last_sign_in_at, au.created_at, NOW())
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to update last_active_at timestamp
CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active_at = NOW();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update timestamps on profile changes
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_active();

-- ============================================================================
-- VERIFICATION & SUMMARY
-- ============================================================================

-- Verify the setup was successful
DO $$
DECLARE
  user_count INTEGER;
  profile_count INTEGER;
  missing_profiles INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM auth.users;
  SELECT COUNT(*) INTO profile_count FROM profiles;
  
  missing_profiles := user_count - profile_count;
  
  RAISE NOTICE '=== DATABASE SETUP COMPLETE ===';
  RAISE NOTICE 'Total users in auth.users: %', user_count;
  RAISE NOTICE 'Total profiles created: %', profile_count;
  RAISE NOTICE 'Missing profiles: %', missing_profiles;
  
  IF missing_profiles = 0 THEN
    RAISE NOTICE '✅ SUCCESS: All users have profiles!';
  ELSE
    RAISE NOTICE '⚠️  WARNING: % users missing profiles', missing_profiles;
  END IF;
  
  RAISE NOTICE '=== FEATURES ENABLED ===';
  RAISE NOTICE '✅ Enhanced profile system with all fields';
  RAISE NOTICE '✅ Automatic profile creation on signup';
  RAISE NOTICE '✅ Row Level Security (RLS) policies';
  RAISE NOTICE '✅ Data validation constraints';
  RAISE NOTICE '✅ Performance indexes';
  RAISE NOTICE '✅ Smart default values';
  RAISE NOTICE '=== READY FOR AUTHENTICATION ===';
END $$;

-- Final verification query
SELECT 
  'Database setup completed successfully!' as status,
  COUNT(*) as total_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM profiles WHERE email_verified = true) as verified_users,
  (SELECT COUNT(*) FROM profiles WHERE onboarding_completed = true) as onboarded_users
FROM auth.users;
