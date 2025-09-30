# Supabase User Interactions - Complete Backend Requirements

**Purpose**: Document every user interaction and its Supabase backend requirements  
**Date**: September 30, 2025  
**Status**: Comprehensive Reference Guide

---

## 📖 Overview

This document maps **every user interaction** in the application to the **exact Supabase backend requirements** needed to make it work.

### How to Use This Guide

1. Find the user action you want to enable
2. Check what backend setup is required
3. Verify the setup is complete in your Supabase project
4. Test the interaction

---

## 🔐 Authentication Interactions

### 1. Sign Up (Email/Password)

**User Action**: User fills out sign-up form and clicks "Sign Up"

**Frontend**: `/app/auth/sign-up/page.tsx`

**Backend Requirements**:
```sql
-- ✅ Handled by Supabase Auth (automatic)
-- No custom setup required

-- Optional: Email templates customization
-- Go to: Authentication → Email Templates
```

**Database Side Effects**:
- Creates user in `auth.users` table
- Triggers `handle_new_user()` function
- Creates profile in `public.profiles` table

**Testing**: Sign up with email → should receive confirmation email

---

### 2. Email Confirmation

**User Action**: User clicks link in confirmation email

**Frontend**: `/app/auth/confirm/route.ts`

**Backend Requirements**:
```sql
-- ✅ Handled by Supabase Auth (automatic)
-- Confirmation token validated automatically

-- Required: Email confirmation enabled
-- Go to: Authentication → Providers → Email
-- Enable: "Confirm email"
```

**Database Side Effects**:
- Updates `auth.users.email_confirmed_at`
- Updates `profiles.email_verified = true`

**Testing**: Click confirmation link → should redirect to login

---

### 3. Login (Email/Password)

**User Action**: User enters credentials and clicks "Log In"

**Frontend**: `/app/auth/login/page.tsx`

**Backend Requirements**:
```sql
-- ✅ Handled by Supabase Auth (automatic)
-- No custom setup required

-- Required: Email provider enabled
-- Go to: Authentication → Providers → Email
-- Enable: "Email" provider
```

**Database Side Effects**:
- Updates `auth.users.last_sign_in_at`
- Creates session token
- Updates `profiles.last_active_at`

**Testing**: Login with valid credentials → should redirect to /protected

---

### 4. Logout

**User Action**: User clicks "Log Out" button

**Frontend**: `components/logout-button.tsx`

**Backend Requirements**:
```sql
-- ✅ Handled by Supabase Auth (automatic)
-- No custom setup required
```

**Database Side Effects**:
- Invalidates session token
- Clears user session

**Testing**: Click logout → should redirect to homepage

---

### 5. Password Reset Request

**User Action**: User enters email on forgot password page

**Frontend**: `/app/auth/forgot-password/page.tsx`

**Backend Requirements**:
```sql
-- ✅ Handled by Supabase Auth (automatic)

-- Optional: Customize reset email template
-- Go to: Authentication → Email Templates
-- Edit: "Reset Password" template
```

**Database Side Effects**:
- Creates password reset token
- Sends reset email

**Testing**: Enter email → should receive reset email

---

### 6. Password Reset Completion

**User Action**: User clicks reset link and enters new password

**Frontend**: `/app/auth/update-password/page.tsx`

**Backend Requirements**:
```sql
-- ✅ Handled by Supabase Auth (automatic)

-- Required: Password reset enabled
-- Go to: Authentication → Providers → Email
-- Enable: "Reset password"
```

**Database Side Effects**:
- Updates password hash in `auth.users`
- Invalidates reset token

**Testing**: Complete reset flow → should be able to login with new password

---

## 👤 Profile Interactions

### 7. View Profile Page

**User Action**: User navigates to `/protected/profile`

**Frontend**: `/app/protected/profile/page.tsx`

**Backend Requirements**:
```sql
-- Required: profiles table with all fields
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  username TEXT,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  profile_picture TEXT,
  about_me TEXT,
  bio TEXT,
  is_public BOOLEAN,
  -- ... other fields
);

-- Required: RLS policies for SELECT
CREATE POLICY "Users can view own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);
```

**Database Queries**:
```sql
SELECT * FROM profiles WHERE id = {user-id};
```

**Testing**: Navigate to /protected/profile → should see profile data

---

### 8. Edit "About Me" Text

**User Action**: User edits about me field and clicks "Save"

**Frontend**: `components/simple-profile-form.tsx`

**Backend Requirements**:
```sql
-- Required: about_me column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS about_me TEXT;

-- Required: Length constraint
ALTER TABLE profiles ADD CONSTRAINT about_me_length 
  CHECK (about_me IS NULL OR length(about_me) <= 1000);

-- Required: RLS policy for UPDATE
CREATE POLICY "Users can update own profile" ON profiles 
FOR UPDATE USING (auth.uid() = id);
```

**Database Queries**:
```sql
UPDATE profiles 
SET about_me = {text}, updated_at = NOW()
WHERE id = {user-id};
```

**Testing**: Edit about me → save → refresh → should persist

---

### 9. Edit Profile Picture URL

**User Action**: User enters image URL and saves

**Frontend**: `components/simple-profile-form.tsx`

**Backend Requirements**:
```sql
-- Required: profile_picture column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Required: avatar_url column (synced with profile_picture)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Required: UPDATE policy (same as above)
```

**Database Queries**:
```sql
UPDATE profiles 
SET profile_picture = {url}, 
    avatar_url = {url},
    updated_at = NOW()
WHERE id = {user-id};
```

**Testing**: Enter URL → save → image should display

---

### 10. Upload Profile Image

**User Action**: User clicks "Upload Image", selects file, uploads

**Frontend**: `components/profile-image-uploader.tsx`

**Backend Requirements**:
```sql
-- 1. Required: Image URL columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- 2. Required: Storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('profile-images', 'profile-images', true, 2097152);

-- 3. Required: Storage RLS policies (4 policies)
-- INSERT policy
CREATE POLICY "Users can upload their own profile image"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE policy  
CREATE POLICY "Users can update their own profile image"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE policy
CREATE POLICY "Users can delete their own profile image"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- SELECT policy (public access)
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'profile-images');

-- 4. Required: Profile UPDATE policy (for avatar_url)
CREATE POLICY "Users can update own profile" ON profiles 
FOR UPDATE USING (auth.uid() = id);

-- 5. Required: Storage permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT ON storage.buckets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;
```

**Database Queries**:
```sql
-- List old images
SELECT * FROM storage.objects 
WHERE bucket_id = 'profile-images' 
AND path LIKE '{user-id}/%';

-- Delete old images
DELETE FROM storage.objects 
WHERE bucket_id = 'profile-images' 
AND path IN (...);

-- Insert new image
INSERT INTO storage.objects (bucket_id, name, ...)
VALUES ('profile-images', '{user-id}/avatar-{timestamp}.webp', ...);

-- Update profile
UPDATE profiles 
SET avatar_url = {storage-url}, 
    profile_picture = {storage-url}
WHERE id = {user-id};
```

**Testing**: Upload testprofile.png → should compress and display

---

### 11. View Profile Avatar

**User Action**: Avatar displays on profile page and nav

**Frontend**: `components/ui/avatar.tsx`

**Backend Requirements**:
```sql
-- Required: avatar_url or profile_picture column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Required: SELECT policy
CREATE POLICY "Users can view own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);

-- For public profiles:
CREATE POLICY "Users can view public profiles" ON profiles 
FOR SELECT USING (is_public = true);
```

**Database Queries**:
```sql
SELECT avatar_url, profile_picture, username, email 
FROM profiles 
WHERE id = {user-id};
```

**Testing**: Avatar should show image or initials

---

## 💾 Data Persistence Interactions

### 12. Auto-Create Profile on Signup

**User Action**: User completes signup

**Frontend**: Automatic (triggered by auth)

**Backend Requirements**:
```sql
-- Required: Trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, ...)
  VALUES (NEW.id, ..., NEW.email, ...);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Required: Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Required: Bypass RLS for function
CREATE POLICY "Allow profile creation via trigger" ON profiles
FOR INSERT WITH CHECK (true);
```

**Database Side Effects**:
- Automatically creates profile row when user signs up
- Populates default values

**Testing**: Sign up new user → profile should exist immediately

---

### 13. Update Last Active Timestamp

**User Action**: User interacts with the app

**Frontend**: Various pages

**Backend Requirements**:
```sql
-- Required: last_active_at column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE;

-- Required: UPDATE policy
CREATE POLICY "Users can update own profile" ON profiles 
FOR UPDATE USING (auth.uid() = id);
```

**Database Queries**:
```sql
UPDATE profiles 
SET last_active_at = NOW() 
WHERE id = {user-id};
```

**Testing**: Login → check last_active_at updated

---

## 🔒 Security Interactions

### 14. Enforce User-Specific Data Access

**User Action**: User tries to access their own data vs others' data

**Frontend**: All protected pages

**Backend Requirements**:
```sql
-- Required: RLS enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Required: Policies that check auth.uid()
CREATE POLICY "Users can view own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
FOR UPDATE USING (auth.uid() = id);

-- For public data:
CREATE POLICY "Users can view public profiles" ON profiles 
FOR SELECT USING (is_public = true);
```

**Testing**: 
- ✅ User can read/update their own profile
- ❌ User cannot read/update other users' profiles (unless public)

---

### 15. Prevent Unauthorized File Access

**User Action**: User tries to upload/delete files in storage

**Frontend**: Profile image uploader

**Backend Requirements**:
```sql
-- Required: RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Required: Path-based policies
CREATE POLICY "Users can upload their own profile image"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Testing**:
- ✅ User can upload to their folder (`{user-id}/`)
- ❌ User cannot upload to other users' folders

---

## 📊 Performance Interactions

### 16. Fast Username Lookup

**User Action**: System looks up user by username

**Frontend**: Future features (user search, mentions, etc.)

**Backend Requirements**:
```sql
-- Required: Index on username
CREATE INDEX idx_profiles_username ON profiles(username);

-- Required: Username uniqueness constraint
ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
```

**Database Queries**:
```sql
SELECT * FROM profiles WHERE username = {username};
-- Uses index for fast lookup
```

**Testing**: Query should be fast even with many users

---

### 17. Fast Image URL Lookup

**User Action**: System loads avatar images

**Frontend**: Avatar component on any page

**Backend Requirements**:
```sql
-- Required: Index on avatar_url
CREATE INDEX idx_profiles_avatar_url ON profiles(avatar_url);

-- Required: Index on profile_picture
CREATE INDEX idx_profiles_profile_picture ON profiles(profile_picture);
```

**Database Queries**:
```sql
SELECT avatar_url FROM profiles WHERE id = {user-id};
-- Uses index for fast lookup
```

**Testing**: Avatar should load quickly

---

## 🔄 Data Validation Interactions

### 18. Validate Username Format

**User Action**: User enters username

**Frontend**: Profile form validation

**Backend Requirements**:
```sql
-- Required: Length constraint
ALTER TABLE profiles ADD CONSTRAINT username_length 
  CHECK (username IS NULL OR (length(username) >= 3 AND length(username) <= 30));

-- Required: Format constraint
ALTER TABLE profiles ADD CONSTRAINT username_format 
  CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9._-]+$');
```

**Testing**:
- ✅ "john_doe" → accepted
- ❌ "ab" → rejected (too short)
- ❌ "user@name" → rejected (invalid char)

---

### 19. Validate Bio Length

**User Action**: User enters bio text

**Frontend**: Profile form validation

**Backend Requirements**:
```sql
-- Required: Length constraint
ALTER TABLE profiles ADD CONSTRAINT bio_length 
  CHECK (bio IS NULL OR length(bio) <= 160);
```

**Testing**:
- ✅ 160 characters → accepted
- ❌ 161 characters → rejected

---

### 20. Validate About Me Length

**User Action**: User enters about me text

**Frontend**: Profile form validation

**Backend Requirements**:
```sql
-- Required: Length constraint
ALTER TABLE profiles ADD CONSTRAINT about_me_length 
  CHECK (about_me IS NULL OR length(about_me) <= 1000);
```

**Testing**:
- ✅ 1000 characters → accepted
- ❌ 1001 characters → rejected

---

## 📈 Monitoring Interactions

### 21. Track User Count

**User Action**: Admin checks user metrics

**Frontend**: Future admin dashboard

**Backend Requirements**:
```sql
-- Query available automatically
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM auth.users;
```

**Testing**: Should return accurate count

---

### 22. Track Storage Usage

**User Action**: Admin checks storage metrics

**Frontend**: Future admin dashboard

**Backend Requirements**:
```sql
-- Helper function (from setup script)
CREATE FUNCTION get_user_storage_size(user_id UUID)
RETURNS BIGINT AS $$
  SELECT COALESCE(SUM((metadata->>'size')::bigint), 0)
  FROM storage.objects
  WHERE bucket_id = 'profile-images'
  AND (storage.foldername(name))[1] = user_id::text;
$$ LANGUAGE SQL;

-- Query total storage
SELECT SUM((metadata->>'size')::bigint) 
FROM storage.objects 
WHERE bucket_id = 'profile-images';
```

**Testing**: Should return storage usage in bytes

---

## 🎯 Complete Backend Requirements Summary

### Essential Database Tables

1. **auth.users** (managed by Supabase)
   - Email/password authentication
   - Session management
   - Email confirmation

2. **public.profiles** (managed by you)
   - User profile data
   - Avatar URLs
   - Preferences
   - Custom fields

3. **storage.objects** (managed by Supabase)
   - Profile images
   - File metadata

4. **storage.buckets** (managed by Supabase)
   - Bucket configuration
   - Access policies

### Essential Columns in `profiles`

```sql
CREATE TABLE profiles (
  -- Identity (required)
  id UUID PRIMARY KEY,
  
  -- Profile data (optional)
  username TEXT UNIQUE,
  email TEXT,
  full_name TEXT,
  
  -- Images (required for image upload feature)
  avatar_url TEXT,           -- ⚠️ Required
  profile_picture TEXT,       -- ⚠️ Required
  
  -- Content (optional)
  about_me TEXT,
  bio TEXT,
  
  -- System (optional)
  is_public BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  
  -- Timestamps (recommended)
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  last_active_at TIMESTAMP WITH TIME ZONE
);
```

### Essential Indexes

```sql
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_avatar_url ON profiles(avatar_url);        -- For image feature
CREATE INDEX idx_profiles_profile_picture ON profiles(profile_picture); -- For image feature
```

### Essential RLS Policies

**On `profiles` table (5 policies)**:
1. Users can view own profile
2. Users can view public profiles
3. Users can update own profile
4. Users can insert own profile
5. Allow trigger to create profiles

**On `storage.objects` table (4 policies)**:
1. Users can upload to own folder
2. Users can update own images
3. Users can delete own images
4. Anyone can view images (public access)

### Essential Storage

**Bucket**: `profile-images`
- Public: Yes
- Max size: 2 MB
- Allowed types: PNG, JPEG, GIF, WebP

### Essential Functions

1. `handle_new_user()` - Auto-create profiles
2. `get_user_avatar_url()` - Get user's image
3. `get_user_storage_size()` - Track storage usage

### Essential Triggers

1. `on_auth_user_created` - Trigger profile creation

---

## ✅ Quick Setup Checklist

To enable all user interactions, ensure:

- [ ] Profiles table created with all columns
- [ ] Image columns (`avatar_url`, `profile_picture`) exist
- [ ] All indexes created
- [ ] RLS enabled on profiles table
- [ ] 5 RLS policies on profiles table
- [ ] Storage bucket `profile-images` created
- [ ] RLS enabled on storage.objects
- [ ] 4 RLS policies on storage.objects
- [ ] Auto-profile-creation trigger active
- [ ] Storage permissions granted
- [ ] Data validation constraints added

**Use**: Copy-paste script from `SUPABASE-SETUP-COPY-PASTE.md`

---

## 🎯 Testing All Interactions

After setup, test each interaction:

1. ✅ Sign up new user → profile auto-created
2. ✅ Confirm email → email_verified updated
3. ✅ Login → session created
4. ✅ View profile → data displays
5. ✅ Edit about me → saves successfully
6. ✅ Enter image URL → displays correctly
7. ✅ Upload image → compresses and stores
8. ✅ View avatar → displays on all pages
9. ✅ Upload new image → old deleted
10. ✅ Logout → session cleared

---

**Document Version**: 1.0  
**Last Updated**: September 30, 2025  
**Completeness**: All User Interactions Documented
