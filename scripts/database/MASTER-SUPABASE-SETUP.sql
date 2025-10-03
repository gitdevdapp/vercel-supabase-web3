-- ============================================================================
-- MASTER SUPABASE DATABASE SETUP - COMPLETE SYSTEM
-- ============================================================================
-- Version: 1.0
-- Last Updated: October 3, 2025
-- Status: Production Ready
--
-- This script sets up EVERYTHING needed for a fresh Supabase instance:
-- 1. User profiles with automatic creation
-- 2. Profile image storage with RLS
-- 3. CDP wallet system (user_wallets + wallet_transactions)
-- 4. All RLS policies, triggers, functions, and indexes
--
-- EXECUTION INSTRUCTIONS:
-- 1. Open Supabase Dashboard > SQL Editor
-- 2. Click "+ New query" (NOT saved snippets)
-- 3. Copy this ENTIRE file (Cmd/Ctrl+A, Cmd/Ctrl+C)
-- 4. Paste into the NEW query editor
-- 5. Click "Run" or press Cmd/Ctrl+Enter
-- 6. Verify success with the verification query at the bottom
--
-- SAFE TO RUN MULTIPLE TIMES: Fully idempotent
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SECTION 1: PROFILES TABLE
-- ============================================================================
-- Purpose: Core user profile data with automatic creation on signup
-- Source: Canonical deployment guide (docs/deployment/README.md)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Core profile fields
  username TEXT UNIQUE,
  email TEXT,
  full_name TEXT,
  
  -- Visual/social fields  
  avatar_url TEXT,
  profile_picture TEXT,
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
-- PROFILES: DATA VALIDATION CONSTRAINTS
-- ============================================================================

-- Username constraints (allows dots for email-derived usernames)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'username_length'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT username_length 
      CHECK (username IS NULL OR (length(username) >= 2 AND length(username) <= 50));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'username_format'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT username_format 
      CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9._-]+$');
  END IF;
END $$;

-- Bio and description length limits
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'bio_length'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT bio_length 
      CHECK (bio IS NULL OR length(bio) <= 300);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'about_me_length'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT about_me_length 
      CHECK (about_me IS NULL OR length(about_me) <= 2000);
  END IF;
END $$;

-- Full name reasonable length
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'full_name_length'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT full_name_length 
      CHECK (full_name IS NULL OR length(full_name) <= 100);
  END IF;
END $$;

-- Basic email format validation
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'email_format'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT email_format 
      CHECK (email IS NULL OR email ~ '^[^@]+@[^@]+\.[^@]+$');
  END IF;
END $$;

-- ============================================================================
-- PROFILES: PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_public ON profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active_at);
CREATE INDEX IF NOT EXISTS idx_profiles_created ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON profiles(avatar_url);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_picture ON profiles(profile_picture);

-- ============================================================================
-- PROFILES: ROW LEVEL SECURITY (RLS)
-- ============================================================================

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
-- PROFILES: AUTOMATIC PROFILE CREATION FUNCTION
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  attempt_count INTEGER := 0;
  max_attempts INTEGER := 100;
BEGIN
  -- Generate base username from multiple sources
  base_username := COALESCE(
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'preferred_username',
    split_part(new.email, '@', 1),
    'user'
  );

  -- Clean and validate base username
  base_username := lower(trim(base_username));
  base_username := regexp_replace(base_username, '[^a-z0-9._-]', '_', 'g');
  base_username := regexp_replace(base_username, '[._-]{2,}', '_', 'g');
  base_username := trim(base_username, '._-');
  
  -- Ensure minimum length
  IF length(base_username) < 3 THEN
    base_username := base_username || '_' || floor(random() * 1000)::text;
  END IF;
  
  -- Ensure maximum length
  IF length(base_username) > 30 THEN
    base_username := left(base_username, 27) || '_' || floor(random() * 100)::text;
  END IF;
  
  -- Find unique username
  final_username := base_username;
  
  WHILE attempt_count < max_attempts LOOP
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE username = final_username) THEN
      EXIT;
    END IF;
    
    attempt_count := attempt_count + 1;
    final_username := base_username || '_' || floor(random() * 10000)::text;
  END LOOP;
  
  -- If couldn't find unique username, use UUID suffix
  IF attempt_count >= max_attempts THEN
    final_username := left(base_username, 20) || '_' || replace(gen_random_uuid()::text, '-', '');
    final_username := left(final_username, 30);
  END IF;

  -- Insert profile with bulletproof data
  INSERT INTO public.profiles (
    id, username, email, full_name, avatar_url, about_me, bio,
    email_verified, onboarding_completed, last_active_at
  )
  VALUES (
    new.id,
    final_username,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      initcap(replace(split_part(new.email, '@', 1), '.', ' ')),
      'User ' || right(new.id::text, 8)
    ),
    COALESCE(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture',
      new.raw_user_meta_data->>'image_url'
    ),
    'Welcome to my profile! I''m excited to be part of the community.',
    'New member exploring the platform',
    COALESCE(new.email_confirmed_at IS NOT NULL, false),
    false,
    NOW()
  );
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Create minimal profile to prevent signup failure
    INSERT INTO public.profiles (
      id, username, email, full_name, about_me, bio, 
      email_verified, onboarding_completed, last_active_at
    )
    VALUES (
      new.id,
      'user_' || right(replace(new.id::text, '-', ''), 12),
      new.email,
      'User ' || right(new.id::text, 8),
      'Welcome to my profile! I''m excited to be part of the community.',
      'New member exploring the platform',
      false,
      false,
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- PROFILES: MIGRATION FOR EXISTING USERS
-- ============================================================================

INSERT INTO public.profiles (
  id, username, email, full_name, avatar_url, about_me, bio,
  email_verified, onboarding_completed, last_active_at
)
SELECT 
  au.id,
  CASE 
    WHEN au.raw_user_meta_data->>'username' IS NOT NULL THEN 
      regexp_replace(lower(au.raw_user_meta_data->>'username'), '[^a-z0-9._-]', '_', 'g')
    WHEN au.raw_user_meta_data->>'name' IS NOT NULL THEN 
      regexp_replace(lower(au.raw_user_meta_data->>'name'), '[^a-z0-9._-]', '_', 'g')
    ELSE regexp_replace(lower(split_part(au.email, '@', 1)), '[^a-z0-9._-]', '_', 'g')
  END || CASE 
    WHEN EXISTS (
      SELECT 1 FROM profiles p2 
      WHERE p2.username = COALESCE(
        regexp_replace(lower(au.raw_user_meta_data->>'username'), '[^a-z0-9._-]', '_', 'g'),
        regexp_replace(lower(au.raw_user_meta_data->>'name'), '[^a-z0-9._-]', '_', 'g'),
        regexp_replace(lower(split_part(au.email, '@', 1)), '[^a-z0-9._-]', '_', 'g')
      )
    ) THEN '_' || floor(random() * 100000)::text
    ELSE ''
  END,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    initcap(replace(split_part(au.email, '@', 1), '.', ' ')),
    'User ' || right(au.id::text, 8)
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
-- SECTION 2: PROFILE IMAGE STORAGE
-- ============================================================================
-- Purpose: Storage bucket and RLS policies for profile images
-- Features: 2MB max upload, public access for viewing
-- ============================================================================

-- Create profile-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  2097152, -- 2 MB max file size
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET 
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;

-- Storage Policy 1: Users can upload their own profile images
CREATE POLICY "Users can upload their own profile image"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage Policy 2: Users can update their own profile images
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

-- Storage Policy 3: Users can delete their own profile images
CREATE POLICY "Users can delete their own profile image"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage Policy 4: Anyone can view profile images
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- Grant storage permissions
GRANT USAGE ON SCHEMA storage TO authenticated, anon;
GRANT SELECT ON storage.buckets TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;

-- ============================================================================
-- SECTION 3: CDP WALLET SYSTEM
-- ============================================================================
-- Purpose: Supabase-controlled wallet management with CDP blockchain execution
-- Architecture: Supabase is single source of truth, CDP executes operations
-- ============================================================================

-- ============================================================================
-- TABLE: user_wallets
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_address TEXT NOT NULL,
  wallet_name TEXT NOT NULL DEFAULT 'My Wallet',
  network TEXT NOT NULL DEFAULT 'base-sepolia',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Wallet foreign key constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_wallets_user_id_fkey' 
    AND table_name = 'user_wallets'
  ) THEN
    ALTER TABLE public.user_wallets 
    ADD CONSTRAINT user_wallets_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Wallet unique address constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_wallets_wallet_address_key' 
    AND table_name = 'user_wallets'
  ) THEN
    ALTER TABLE public.user_wallets 
    ADD CONSTRAINT user_wallets_wallet_address_key 
    UNIQUE (wallet_address);
  END IF;
END $$;

-- Wallet address format validation
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'valid_ethereum_address'
  ) THEN
    ALTER TABLE public.user_wallets 
    ADD CONSTRAINT valid_ethereum_address 
    CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$');
  END IF;
END $$;

-- Wallet network validation
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'valid_network'
  ) THEN
    ALTER TABLE public.user_wallets 
    ADD CONSTRAINT valid_network 
    CHECK (network IN ('base-sepolia', 'base', 'ethereum-sepolia'));
  END IF;
END $$;

-- Wallet performance indexes
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON public.user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_address ON public.user_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_wallets_active ON public.user_wallets(is_active) WHERE is_active = true;

-- ============================================================================
-- TABLE: wallet_transactions
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_id UUID NOT NULL,
  operation_type TEXT NOT NULL,
  token_type TEXT NOT NULL,
  amount DECIMAL(20, 8),
  from_address TEXT,
  to_address TEXT,
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Transaction foreign key constraints
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'wallet_transactions_user_id_fkey' 
    AND table_name = 'wallet_transactions'
  ) THEN
    ALTER TABLE public.wallet_transactions 
    ADD CONSTRAINT wallet_transactions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'wallet_transactions_wallet_id_fkey' 
    AND table_name = 'wallet_transactions'
  ) THEN
    ALTER TABLE public.wallet_transactions 
    ADD CONSTRAINT wallet_transactions_wallet_id_fkey 
    FOREIGN KEY (wallet_id) REFERENCES public.user_wallets(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Transaction validation constraints
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'valid_operation'
  ) THEN
    ALTER TABLE public.wallet_transactions 
    ADD CONSTRAINT valid_operation 
    CHECK (operation_type IN ('create', 'fund', 'send', 'receive'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'valid_token'
  ) THEN
    ALTER TABLE public.wallet_transactions 
    ADD CONSTRAINT valid_token 
    CHECK (token_type IN ('eth', 'usdc'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'valid_status'
  ) THEN
    ALTER TABLE public.wallet_transactions 
    ADD CONSTRAINT valid_status 
    CHECK (status IN ('pending', 'success', 'failed'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'valid_tx_hash'
  ) THEN
    ALTER TABLE public.wallet_transactions 
    ADD CONSTRAINT valid_tx_hash 
    CHECK (tx_hash IS NULL OR tx_hash ~ '^0x[a-fA-F0-9]{64}$');
  END IF;
END $$;

-- Transaction performance indexes
CREATE INDEX IF NOT EXISTS idx_wallet_tx_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet_id ON public.wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_status ON public.wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_created ON public.wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_hash ON public.wallet_transactions(tx_hash) WHERE tx_hash IS NOT NULL;

-- ============================================================================
-- WALLET: ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing wallet policies
DROP POLICY IF EXISTS "Users can view own wallets" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can insert own wallets" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can update own wallets" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can delete own wallets" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.wallet_transactions;

-- Create wallet RLS policies
CREATE POLICY "Users can view own wallets"
  ON public.user_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallets"
  ON public.user_wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallets"
  ON public.user_wallets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wallets"
  ON public.user_wallets FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions"
  ON public.wallet_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.wallet_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- WALLET: HELPER FUNCTIONS
-- ============================================================================

-- Function: Get user's active wallet
CREATE OR REPLACE FUNCTION public.get_user_wallet(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  wallet_address TEXT,
  wallet_name TEXT,
  network TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uw.id,
    uw.wallet_address,
    uw.wallet_name,
    uw.network,
    uw.is_active,
    uw.created_at
  FROM public.user_wallets uw
  WHERE uw.user_id = p_user_id
    AND uw.is_active = true
  ORDER BY uw.created_at DESC
  LIMIT 1;
END;
$$;

-- Function: Get wallet transaction history
CREATE OR REPLACE FUNCTION public.get_wallet_transactions(
  p_wallet_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  operation_type TEXT,
  token_type TEXT,
  amount DECIMAL,
  from_address TEXT,
  to_address TEXT,
  tx_hash TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wt.id,
    wt.operation_type,
    wt.token_type,
    wt.amount,
    wt.from_address,
    wt.to_address,
    wt.tx_hash,
    wt.status,
    wt.created_at
  FROM public.wallet_transactions wt
  WHERE wt.wallet_id = p_wallet_id
  ORDER BY wt.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Function: Log wallet operation
CREATE OR REPLACE FUNCTION public.log_wallet_operation(
  p_user_id UUID,
  p_wallet_id UUID,
  p_operation_type TEXT,
  p_token_type TEXT,
  p_amount DECIMAL DEFAULT NULL,
  p_from_address TEXT DEFAULT NULL,
  p_to_address TEXT DEFAULT NULL,
  p_tx_hash TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'pending',
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction_id UUID;
BEGIN
  INSERT INTO public.wallet_transactions (
    user_id,
    wallet_id,
    operation_type,
    token_type,
    amount,
    from_address,
    to_address,
    tx_hash,
    status,
    error_message
  ) VALUES (
    p_user_id,
    p_wallet_id,
    p_operation_type,
    p_token_type,
    p_amount,
    p_from_address,
    p_to_address,
    p_tx_hash,
    p_status,
    p_error_message
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$;

-- ============================================================================
-- WALLET: AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_wallet_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_user_wallets_timestamp ON public.user_wallets;
CREATE TRIGGER update_user_wallets_timestamp
  BEFORE UPDATE ON public.user_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_wallet_timestamp();

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Expected Results:
-- - profiles_table: 1 (profiles table exists)
-- - profiles_rls_policies: 4 (view own, view public, update own, insert own)
-- - storage_bucket: 1 (profile-images bucket)
-- - storage_rls_policies: 4 (upload, update, delete, view)
-- - wallet_tables: 2 (user_wallets, wallet_transactions)
-- - wallet_rls_policies: 6 (3 for user_wallets, 2 for wallet_transactions)
-- - wallet_functions: 4 (get_user_wallet, get_wallet_transactions, log_wallet_operation, update_wallet_timestamp)
-- ============================================================================

SELECT 
  '🚀 MASTER DATABASE SETUP COMPLETED SUCCESSFULLY!' as status,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'profiles') as profiles_table,
  (SELECT COUNT(*) FROM pg_policies 
   WHERE schemaname = 'public' 
   AND tablename = 'profiles') as profiles_rls_policies,
  (SELECT COUNT(*) FROM storage.buckets 
   WHERE id = 'profile-images') as storage_bucket,
  (SELECT COUNT(*) FROM pg_policies 
   WHERE schemaname = 'storage' 
   AND tablename = 'objects' 
   AND policyname LIKE '%profile image%') as storage_rls_policies,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('user_wallets', 'wallet_transactions')) as wallet_tables,
  (SELECT COUNT(*) FROM pg_policies 
   WHERE schemaname = 'public' 
   AND tablename IN ('user_wallets', 'wallet_transactions')) as wallet_rls_policies,
  (SELECT COUNT(*) FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name IN ('get_user_wallet', 'get_wallet_transactions', 'log_wallet_operation', 'update_wallet_timestamp')) as wallet_functions,
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM profiles WHERE email_verified = true) as verified_users,
  (SELECT COUNT(*) FROM user_wallets) as total_wallets,
  (SELECT COUNT(*) FROM wallet_transactions) as total_transactions;

-- ============================================================================
-- END OF MASTER SETUP SCRIPT
-- ============================================================================
-- 
-- What was created:
-- ✅ Profiles table with automatic creation on signup
-- ✅ Profile image storage bucket with RLS policies
-- ✅ CDP wallet tables (user_wallets + wallet_transactions)
-- ✅ Complete RLS policies for all tables (14 total)
-- ✅ Automatic triggers and timestamp updates
-- ✅ Helper functions for wallet operations
-- ✅ All necessary indexes and constraints
-- ✅ Migration support for existing users
--
-- Next Steps:
-- 1. Configure authentication settings in Supabase dashboard
-- 2. Set up email templates for confirmations
-- 3. Add environment variables to Vercel
-- 4. Test complete user flow (signup → profile → wallet)
-- 5. Monitor using the verification query above
--
-- Documentation:
-- - Deployment Guide: docs/deployment/README.md
-- - Wallet System: docs/wallet/SUPABASE-FIRST-ARCHITECTURE.md
-- - Quick Start: docs/wallet/QUICK-START.md
-- 
-- ============================================================================

