# ⚠️ IMPORTANT: Use Updated Setup Script

## The setup script has been moved and improved!

### ❌ OLD (Partial - Don't Use)
`/scripts/database/setup-profile-image-storage.sql` - **DEPRECATED**
- Only handles storage bucket
- Missing profile table setup
- Missing constraint validation
- **DO NOT USE THIS FILE**

### ✅ NEW (Complete - Use This)
`/docs/profile/README.md` - **RECOMMENDED**
- Complete setup in single copy-paste
- Handles all profile fields
- Validates constraints before applying
- Prevents all known errors
- Production ready
- **USE THIS FILE**

---

## Quick Start

1. Open `/docs/profile/README.md`
2. Copy the **entire SQL script** (starts around line 42)
3. Paste into Supabase SQL Editor
4. Run it
5. Done! ✅

---

## What's Included in the New Script

The comprehensive script in `README.md` includes:

1. ✅ Profiles table creation/update
2. ✅ Image fields (avatar_url, profile_picture)
3. ✅ **Username validation function** (prevents errors)
4. ✅ Data constraints (applied in correct order)
5. ✅ Performance indexes
6. ✅ RLS policies (profiles + storage)
7. ✅ Trigger for auto-profile creation
8. ✅ Storage bucket setup
9. ✅ Storage RLS policies
10. ✅ Helper functions
11. ✅ Existing user backfill
12. ✅ Comprehensive verification queries

---

## Why the Change?

### Problem with Old Script
- Caused constraint violation errors
- `ERROR: 23514: check constraint "username_length" is violated`
- Only partial setup (missing many components)

### Solution in New Script
- ✅ All constraints validated before application
- ✅ Username generation ensures 3-30 character requirement
- ✅ Complete end-to-end setup
- ✅ Zero errors on copy-paste

---

## Reference

- **Primary Setup**: `/docs/profile/README.md`
- **Fix Summary**: `/docs/profile/CONSTRAINT-ERROR-FIX.md`
- **System Master**: `/docs/profile/PROFILE-SYSTEM-MASTER.md`

---

**Last Updated**: September 30, 2025  
**Status**: Use README.md for all profile setup ✅
