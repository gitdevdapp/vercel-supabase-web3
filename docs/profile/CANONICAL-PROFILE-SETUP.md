# Canonical Profile System Setup Guide

**Version**: 1.0  
**Last Updated**: October 6, 2025  
**Status**: ✅ Production Ready - Non-Conflicting with Redesign Plan

---

## Executive Summary

This document is the **single source of truth** for setting up the profile system backend in Supabase. It consolidates information from multiple documentation files into one canonical guide.

### What This Covers
- ✅ Supabase database setup (profiles table, columns, constraints)
- ✅ Storage bucket configuration (profile-images)
- ✅ RLS policies for security
- ✅ Image upload functionality
- ✅ Auto-profile creation triggers

### What This Does NOT Cover
- ❌ Frontend UI/UX redesign (see: `PROFILE-PAGE-REDESIGN-PLAN.md`)
- ❌ Component implementation details
- ❌ Layout changes or styling

**These are separate concerns and do not conflict.**

---

## Quick Start (2 Minutes)

### Prerequisites
- Supabase project created
- Access to Supabase SQL Editor
- Node.js project with Supabase client configured

### Setup Steps

#### Step 1: Run SQL Setup Script
1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**
4. Copy contents of `SETUP-SCRIPT.sql` (or from `SETUP.md`)
5. Paste into SQL Editor
6. Click **Run** (Cmd/Ctrl + Enter)
7. Wait 5-10 seconds for execution

#### Step 2: Verify Success
Look for these messages in the output:
```
✅ Image fields created successfully (avatar_url, profile_picture)
✅ Storage bucket "profile-images" created successfully
✅ Storage RLS policies created: 4 (expected 4)
✅ Profile RLS policies created: 5 (expected 5)
✅ Image field indexes created: 2 (expected 2)
✅ All usernames meet length constraints (3-30 characters)
✅ Data validation constraints applied: 4 (expected 4)

========================================
🎉 PROFILE SYSTEM SETUP COMPLETE!
========================================
```

#### Step 3: Test in Application
1. Navigate to `/protected/profile` in your app
2. Click "Upload Image"
3. Select test image (`assets/testprofile.png`)
4. Verify:
   - Image compresses (should show stats like "601 KB → 85 KB")
   - Upload succeeds
   - Image displays on profile page
   - Check Supabase Storage: only 1 file per user folder

---

## What Gets Created

### Database Schema

#### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,                              -- References auth.users(id)
  
  -- Core profile fields
  username TEXT UNIQUE,                             -- 3-30 chars, alphanumeric
  email TEXT,                                       -- User email
  full_name TEXT,                                   -- Display name
  
  -- Image fields (for profile image upload)
  avatar_url TEXT,                                  -- Primary profile image URL
  profile_picture TEXT,                             -- Alternative image URL
  
  -- Description fields
  about_me TEXT,                                    -- Bio (max 1000 chars)
  bio TEXT,                                         -- Short bio (max 160 chars)
  
  -- System fields
  is_public BOOLEAN DEFAULT false,                 -- Public profile visibility
  email_verified BOOLEAN DEFAULT false,            -- Email verification status
  onboarding_completed BOOLEAN DEFAULT false,      -- Onboarding flow status
  
  -- Timestamps
  updated_at TIMESTAMP WITH TIME ZONE,             -- Last update time
  created_at TIMESTAMP WITH TIME ZONE,             -- Creation time
  last_active_at TIMESTAMP WITH TIME ZONE          -- Last activity time
);
```

#### Indexes (7 total)
- `idx_profiles_username` - Fast username lookups
- `idx_profiles_email` - Fast email lookups
- `idx_profiles_avatar_url` - Fast image URL lookups
- `idx_profiles_profile_picture` - Fast picture lookups
- `idx_profiles_is_public` - Filter public profiles
- `idx_profiles_last_active` - Sort by activity
- `idx_profiles_created` - Sort by creation date

#### Constraints (4 total)
- `username_length` - Username 3-30 characters
- `username_format` - Alphanumeric + dots, hyphens, underscores
- `bio_length` - Bio max 160 characters
- `about_me_length` - About me max 1000 characters

### Storage Configuration

#### Bucket: profile-images
```json
{
  "id": "profile-images",
  "name": "profile-images",
  "public": true,
  "file_size_limit": 2097152,  // 2 MB
  "allowed_mime_types": [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp"
  ]
}
```

#### Storage Structure
```
profile-images/
  └─ {user-id}/
      └─ avatar-{timestamp}.webp
```

### Security (RLS Policies)

#### Profile Table Policies (5 total)
1. **Users can view own profile** - Users see their own data
2. **Users can view public profiles** - Anyone can see public profiles
3. **Users can update own profile** - Users can edit their own data
4. **Users can insert own profile** - Users can create their profile
5. **Allow profile creation via trigger** - System can create profiles automatically

#### Storage Policies (4 total)
1. **Users can upload their own profile image** - Upload to own folder only
2. **Users can update their own profile image** - Update own images only
3. **Users can delete their own profile image** - Delete own images only
4. **Anyone can view profile images** - Public read access for avatars

### Automation

#### Triggers (2 total)
1. **on_auth_user_created** - Auto-create profile when user signs up
2. **update_profiles_timestamps** - Auto-update timestamps on profile changes

#### Functions (3 total)
1. **generate_valid_username()** - Create valid username from email
2. **handle_new_user()** - Profile creation logic
3. **update_profile_timestamps()** - Timestamp update logic

#### Helper Functions (2 total)
1. **get_user_avatar_url(user_id)** - Get user's image URL
2. **get_user_storage_size(user_id)** - Check storage usage per user

#### View (1 total)
- **profile_image_storage_stats** - Monitor storage usage by user

---

## Image Upload System

### Client-Side Processing

#### Compression Pipeline
```
Input Image (max 2 MB)
    ↓
Validate file type & size
    ↓
Load image dimensions
    ↓
Center crop to square (if needed)
    ↓
Compress to WebP format
    ↓
Progressive quality reduction
    ↓
Output: ~85 KB, 512×512px
```

#### Configuration
```typescript
{
  MAX_UPLOAD_SIZE: 2 MB,
  TARGET_SIZE: 100 KB,
  TARGET_DIMENSIONS: "512×512px",
  INITIAL_QUALITY: 0.85,
  OUTPUT_FORMAT: "WebP",
  ALLOWED_TYPES: ["PNG", "JPEG", "GIF", "WebP"]
}
```

### Storage Optimization

#### Free Tier Capacity
- **Supabase free tier**: 1 GB storage
- **Average image size**: 85 KB (after compression)
- **Images per user**: 1 (old images auto-deleted)
- **Capacity**: 12,000+ users ✅

#### Cost at Scale
**At 10,000 users**:
- Storage: 850 MB
- Cost: $0/month (within free tier) ✅

**At 50,000 users**:
- Storage: 4.25 GB
- Cost: ~$4/month ✅

### Implementation Files

#### Backend (Supabase)
- `docs/profile/SETUP-SCRIPT.sql` - Complete SQL setup (700+ lines)

#### Frontend (Client)
- `lib/image-optimizer.ts` - Image compression engine (377 lines)
- `components/profile-image-uploader.tsx` - Upload UI component (304 lines)
- `components/simple-profile-form.tsx` - Profile form integration

#### Testing
- `__tests__/profile-image-upload.test.ts` - 34 passing tests
- `assets/testprofile.png` - Test image (601 KB → 85 KB)

---

## Troubleshooting

### Common Issues

#### "Bucket not found: profile-images"
**Cause**: SQL script not run or failed to create bucket  
**Solution**: Re-run `SETUP-SCRIPT.sql` in Supabase SQL Editor

#### "Permission denied" on upload
**Cause**: RLS policies not created correctly  
**Solution**: 
```sql
-- Verify policies exist
SELECT policyname FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%profile image%';
-- Should return 4 policies
```

#### "Column 'avatar_url' does not exist"
**Cause**: Database columns not created  
**Solution**: Re-run setup script (it's idempotent and safe)

#### Upload succeeds but old images not deleted
**Cause**: DELETE RLS policy issue  
**Solution**: Check policy exists and user has permission

#### Image quality is poor
**Cause**: Target size too aggressive  
**Solution**: Adjust `TARGET_SIZE` in `lib/image-optimizer.ts`:
```typescript
const CONFIG = {
  TARGET_SIZE: 150 * 1024, // Increase to 150 KB
  INITIAL_QUALITY: 0.90,    // Higher initial quality
};
```

### Verification Queries

#### Check profiles table structure
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

#### Check storage bucket exists
```sql
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'profile-images';
```

#### Check RLS policies
```sql
-- Profile policies
SELECT policyname FROM pg_policies 
WHERE tablename = 'profiles';

-- Storage policies
SELECT policyname FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%profile%';
```

#### Check storage usage
```sql
-- Total storage
SELECT 
  COUNT(*) as total_images,
  SUM((metadata->>'size')::bigint) as total_bytes,
  ROUND(SUM((metadata->>'size')::bigint) / 1024.0 / 1024.0, 2) as total_mb
FROM storage.objects
WHERE bucket_id = 'profile-images';

-- Per user (using helper function)
SELECT get_user_storage_size('{your-user-id}'::UUID);
```

---

## Relationship to Frontend Redesign

### Clear Separation of Concerns

This setup guide covers **backend infrastructure** only:
- Database tables and columns
- Storage buckets and policies
- RLS security rules
- Server-side functions and triggers

The `PROFILE-PAGE-REDESIGN-PLAN.md` covers **frontend UI/UX** only:
- Component layout and organization
- Desktop two-column vs mobile stacked layout
- Accordion sections for collapsible content
- Visual design and spacing

### No Conflicts

**Backend setup (this document)**:
- Runs once in Supabase SQL Editor
- Creates database infrastructure
- Configures security policies
- No changes to React components

**Frontend redesign (separate document)**:
- Modifies React component files
- Changes layout and styling
- Improves user experience
- No changes to database or API

**These work together but are completely independent:**
- Frontend redesign uses the backend infrastructure created here
- Backend setup doesn't care how the frontend displays data
- Both can be implemented separately or together
- No coordination needed between the two

---

## Production Checklist

Before deploying to production:

### Backend Setup
- [ ] SQL script executed successfully in Supabase
- [ ] All verification messages show ✅
- [ ] No ❌ or ⚠️ warnings in output
- [ ] Storage bucket visible in Supabase dashboard
- [ ] RLS policies listed in Authentication → Policies

### Testing
- [ ] Profile image upload tested
- [ ] Image compresses to ~85 KB
- [ ] Only 1 image per user in storage
- [ ] Image displays on profile page
- [ ] Old images deleted on new upload
- [ ] Non-square images center-cropped correctly

### Monitoring
- [ ] Storage usage query works
- [ ] Helper functions accessible
- [ ] Triggers fire on user creation
- [ ] Timestamps update automatically

### Documentation
- [ ] Team knows where setup script is located
- [ ] Troubleshooting guide accessible
- [ ] Environment variables documented
- [ ] Rollback plan documented

---

## Monitoring & Maintenance

### Regular Checks

#### Storage Usage
```sql
-- Check approaching free tier limit (1 GB)
SELECT 
  ROUND(SUM((metadata->>'size')::bigint) / 1024.0 / 1024.0, 2) as total_mb,
  CASE 
    WHEN SUM((metadata->>'size')::bigint) > 800000000 THEN '⚠️ Approaching limit'
    ELSE '✅ Within limits'
  END as status
FROM storage.objects
WHERE bucket_id = 'profile-images';
```

#### Average File Size
```sql
-- Should be ~85 KB average
SELECT 
  ROUND(AVG((metadata->>'size')::bigint) / 1024.0, 2) as avg_kb
FROM storage.objects
WHERE bucket_id = 'profile-images';
```

#### Users Without Profiles
```sql
-- Should always be 0
SELECT 
  COUNT(*) as missing_profiles
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;
```

#### Old Images Not Deleted
```sql
-- Each user should have exactly 1 image
SELECT 
  p.username,
  COUNT(o.id) as image_count
FROM profiles p
LEFT JOIN storage.objects o ON o.bucket_id = 'profile-images' 
  AND (storage.foldername(o.name))[1] = p.id::text
GROUP BY p.id, p.username
HAVING COUNT(o.id) > 1;
```

---

## Reference Documentation

### Full Documentation Set

1. **This Document** - Canonical setup guide (you are here)
2. **SETUP.md** - Detailed setup with troubleshooting
3. **SETUP-SCRIPT.sql** - Pure SQL file for copy-paste
4. **PROFILE-SYSTEM-MASTER.md** - Complete technical reference
5. **PROFILE-PAGE-REDESIGN-PLAN.md** - Frontend UI/UX redesign (separate)
6. **README.md** - Quick overview and navigation
7. **CHANGELOG.md** - Version history and changes
8. **SETUP-SUCCESS.md** - Why v4.0 works (technical deep dive)
9. **MASTER-SQL-SCRIPT-README.md** - Quick reference for SQL scripts
10. **SUPABASE-BACKEND-SUMMARY.md** - Documentation suite summary

### When to Use Which Document

- **Need to set up Supabase?** → Use this document or `SETUP.md`
- **Have setup issues?** → Check `SETUP.md` troubleshooting section
- **Want to understand why?** → Read `SETUP-SUCCESS.md`
- **Planning frontend changes?** → See `PROFILE-PAGE-REDESIGN-PLAN.md`
- **Need technical details?** → Reference `PROFILE-SYSTEM-MASTER.md`
- **Want overview?** → Start with `README.md`

---

## Summary

This canonical guide consolidates all profile system setup information into one authoritative document. It covers:

✅ **Complete backend setup** - Database, storage, security  
✅ **Step-by-step instructions** - 2-minute quick start  
✅ **All components documented** - Tables, policies, functions  
✅ **Troubleshooting guide** - Common issues and solutions  
✅ **Production checklist** - Deployment verification  
✅ **Monitoring queries** - Ongoing maintenance  
✅ **Clear separation** - Backend vs frontend concerns

**Status**: Production ready, tested, and verified ✅  
**Conflicts**: None - backend and frontend are independent ✅  
**Next Steps**: Run `SETUP-SCRIPT.sql` in Supabase SQL Editor ✅

---

**Document Version**: 1.0  
**Created**: October 6, 2025  
**Status**: Canonical - Single Source of Truth  
**Compatibility**: Works with all frontend implementations

