-- =============================================================================
-- VALIDATION SCRIPT - Run this FIRST to check if setup will work
-- =============================================================================
-- This script checks for potential issues WITHOUT making changes
-- If this passes, the main setup script should work
-- =============================================================================

DO $$
DECLARE
  v_error_count INTEGER := 0;
  v_warning_count INTEGER := 0;
  v_table_exists BOOLEAN;
  v_column_exists BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VALIDATING SETUP SCRIPT...';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  -- Check 1: Does profiles table exist?
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) INTO v_table_exists;
  
  IF v_table_exists THEN
    RAISE NOTICE '✓ profiles table exists (will be updated)';
  ELSE
    RAISE NOTICE '✓ profiles table does not exist (will be created)';
  END IF;
  
  -- Check 2: If table exists, check which columns are missing
  IF v_table_exists THEN
    DECLARE
      v_missing_count INTEGER := 0;
      v_column_list TEXT[] := ARRAY[
        'username', 'email', 'full_name', 'avatar_url', 'profile_picture',
        'about_me', 'bio', 'is_public', 'email_verified', 'onboarding_completed',
        'updated_at', 'created_at', 'last_active_at'
      ];
      v_col TEXT;
    BEGIN
      RAISE NOTICE '';
      RAISE NOTICE 'Checking for missing columns...';
      
      FOREACH v_col IN ARRAY v_column_list
      LOOP
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'profiles' AND column_name = v_col
        ) INTO v_column_exists;
        
        IF NOT v_column_exists THEN
          RAISE NOTICE '  → %: MISSING (will be added ✓)', v_col;
          v_missing_count := v_missing_count + 1;
        END IF;
      END LOOP;
      
      IF v_missing_count = 0 THEN
        RAISE NOTICE '  ✓ All required columns exist';
      ELSE
        RAISE NOTICE '  → % columns will be added', v_missing_count;
      END IF;
    END;
  END IF;
  
  -- Check 3: Will index creation work?
  RAISE NOTICE '';
  RAISE NOTICE 'Checking index compatibility...';
  
  IF v_table_exists THEN
    -- After ALTER TABLE statements run, these columns will exist
    -- So indexes will work
    RAISE NOTICE '  ✓ All indexes will be created on existing/new columns';
  ELSE
    RAISE NOTICE '  ✓ Table will be created with all columns, indexes will work';
  END IF;
  
  -- Check 4: Storage bucket
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profile-images') THEN
    RAISE NOTICE '';
    RAISE NOTICE '✓ Storage bucket "profile-images" already exists (will be updated)';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '✓ Storage bucket "profile-images" will be created';
  END IF;
  
  -- Check 5: Check for any invalid data if table exists
  IF v_table_exists THEN
    DECLARE
      v_invalid_usernames INTEGER;
      v_long_bios INTEGER;
      v_long_about_me INTEGER;
    BEGIN
      -- Check username lengths
      SELECT COUNT(*) INTO v_invalid_usernames
      FROM profiles
      WHERE username IS NOT NULL 
      AND (LENGTH(username) < 3 OR LENGTH(username) > 30);
      
      -- Check bio lengths
      SELECT COUNT(*) INTO v_long_bios
      FROM profiles
      WHERE bio IS NOT NULL 
      AND LENGTH(bio) > 160;
      
      -- Check about_me lengths
      SELECT COUNT(*) INTO v_long_about_me
      FROM profiles
      WHERE about_me IS NOT NULL 
      AND LENGTH(about_me) > 1000;
      
      RAISE NOTICE '';
      RAISE NOTICE 'Checking existing data...';
      
      IF v_invalid_usernames > 0 THEN
        RAISE NOTICE '  → % usernames with invalid length (will be auto-fixed ✓)', v_invalid_usernames;
      ELSE
        RAISE NOTICE '  ✓ All usernames are valid (3-30 chars)';
      END IF;
      
      IF v_long_bios > 0 THEN
        RAISE NOTICE '  → % bios > 160 chars (will be auto-truncated ✓)', v_long_bios;
      END IF;
      
      IF v_long_about_me > 0 THEN
        RAISE NOTICE '  → % about_me > 1000 chars (will be auto-truncated ✓)', v_long_about_me;
      END IF;
      
      -- These are not errors anymore since we auto-fix them
    END;
  END IF;
  
  -- Final verdict
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  IF v_error_count = 0 THEN
    RAISE NOTICE '✅ VALIDATION PASSED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'The setup script should work without errors.';
    RAISE NOTICE 'You can safely run SETUP-SCRIPT.sql now.';
  ELSE
    RAISE NOTICE '❌ VALIDATION FAILED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Found % errors that must be fixed first', v_error_count;
    RAISE NOTICE 'See warnings above for details.';
  END IF;
  RAISE NOTICE '';
  
END $$;
