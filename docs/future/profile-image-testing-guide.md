# Profile Image Upload - Testing Guide

**Created**: September 30, 2025  
**Purpose**: Manual testing checklist for profile image upload feature

---

## Pre-Testing Setup

### 1. Database Setup

Run the SQL script to create the storage bucket and RLS policies:

```bash
# Option A: Via Supabase Dashboard
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of scripts/setup-profile-image-storage.sql
3. Execute the script
4. Verify success messages in output

# Option B: Via CLI (if you have Supabase CLI)
supabase db execute -f scripts/setup-profile-image-storage.sql
```

### 2. Verify Database Setup

Check that the following were created:
- ✅ Storage bucket: `profile-images`
- ✅ RLS policies: 4 policies created
- ✅ Profile columns: `avatar_url`, `profile_picture`
- ✅ Indexes: `idx_profiles_avatar_url`, `idx_profiles_profile_picture`

### 3. Start Development Server

```bash
npm run dev
```

Server should start on `http://localhost:3000`

---

## Manual Testing Checklist

### Test 1: Basic Upload Flow

1. ✅ Navigate to `/protected/profile`
2. ✅ Sign in if not already authenticated
3. ✅ Look for "Upload Image" button
4. ✅ Click "Upload Image"
5. ✅ Profile image uploader should appear
6. ✅ Click camera icon or "Upload Photo" button
7. ✅ Select `assets/testprofile.png` from file picker
8. ✅ Wait for processing (should show "Processing..." overlay)
9. ✅ Verify compression info appears:
   - Original size: ~600 KB
   - Compressed size: ~85 KB
   - Compression ratio: ~85%
   - Dimensions: 512×512px
10. ✅ Wait for upload to complete
11. ✅ Success message should appear
12. ✅ Page should refresh automatically

### Test 2: Image Display

1. ✅ After refresh, profile image should display
2. ✅ Image should be square (not stretched)
3. ✅ Image should be center-cropped from original
4. ✅ Image quality should be good (not pixelated)
5. ✅ Avatar component should show image instead of initials

### Test 3: Supabase Storage Verification

1. ✅ Go to Supabase Dashboard → Storage → profile-images
2. ✅ Navigate to your user folder (UUID)
3. ✅ Verify exactly ONE image file exists
4. ✅ File name format: `avatar-{timestamp}.webp`
5. ✅ File size should be < 100 KB (ideally ~85 KB)
6. ✅ Click file to preview - should be square 512×512px
7. ✅ Verify center portion of original image is preserved

### Test 4: Database Verification

1. ✅ Go to Supabase Dashboard → Table Editor → profiles
2. ✅ Find your user profile
3. ✅ Verify `avatar_url` field is populated
4. ✅ URL should point to Supabase storage
5. ✅ `profile_picture` field should match `avatar_url`
6. ✅ `updated_at` should be recent

### Test 5: Storage Cleanup (Important!)

1. ✅ Upload a second image (any image file)
2. ✅ Wait for processing and upload
3. ✅ Go to Supabase Storage → profile-images → your folder
4. ✅ **Verify only 1 image exists** (old one should be deleted)
5. ✅ New image should have newer timestamp
6. ✅ This confirms cleanup is working correctly

### Test 6: Non-Square Image Cropping

Test images to try:
- ✅ Portrait (testprofile.png - 416×626) - ALREADY TESTED
- ✅ Landscape (find a wide image)
- ✅ Square (find a 1:1 image)

For each:
1. Upload image
2. Verify final result is 512×512 square
3. Verify center portion is preserved (not stretched)

### Test 7: Large File Rejection

1. ✅ Try to upload a file > 2 MB
2. ✅ Should see error: "Image must be less than 2 MB"
3. ✅ Upload should not proceed

### Test 8: Invalid File Type Rejection

1. ✅ Try to upload a PDF or SVG
2. ✅ Should see error about invalid file type
3. ✅ Upload should not proceed

### Test 9: URL Fallback (Backwards Compatibility)

1. ✅ Click "Edit Profile"
2. ✅ Enter a URL in the "Profile Picture URL" field
3. ✅ Save changes
4. ✅ URL-based image should still work
5. ✅ This confirms we didn't break existing functionality

### Test 10: Mobile Responsiveness

1. ✅ Open DevTools → Toggle device toolbar
2. ✅ Test on iPhone SE (small screen)
3. ✅ Test on iPad (tablet)
4. ✅ Upload should work on all screen sizes
5. ✅ UI should remain usable

### Test 11: Error Recovery

1. ✅ Start upload, then close browser tab mid-upload
2. ✅ Reopen page
3. ✅ Try uploading again
4. ✅ Should work normally (no orphaned data)

### Test 12: Performance

1. ✅ Upload testprofile.png (601 KB)
2. ✅ Time the complete process
3. ✅ Should complete in < 5 seconds total
4. ✅ UI should remain responsive during processing

---

## Expected Results Summary

### Compression Results (testprofile.png)
- **Original**: 601 KB, 416×626px, PNG
- **Final**: ~85 KB, 512×512px, WebP
- **Compression Ratio**: ~85.9%
- **Processing Time**: 2-3 seconds

### Storage Efficiency
- **1 GB free tier** = ~12,000 users (at 85 KB per image)
- **Target**: < 100 KB per image ✅
- **Cleanup**: Only 1 image per user ✅

### RLS Security
- ✅ Users can only upload to their own folder
- ✅ Users can only delete their own images
- ✅ Anyone can view profile images (public bucket)
- ✅ Only authenticated users can upload

---

## Troubleshooting

### Issue: Upload button doesn't appear
**Fix**: Verify you're logged in and on the profile page

### Issue: "Permission denied" error
**Fix**: Run the SQL setup script to create RLS policies

### Issue: Image doesn't display after upload
**Fix**: 
1. Check browser console for errors
2. Verify Supabase storage bucket is public
3. Check network tab for failed requests

### Issue: Old images not being deleted
**Fix**: 
1. Check RLS policies allow DELETE
2. Verify user authentication
3. Check browser console for errors

### Issue: Compression taking too long
**Fix**: 
1. Ensure browser supports Web Workers
2. Try smaller image
3. Check CPU usage (should not block UI)

### Issue: Image quality is poor
**Fix**: This is expected behavior to meet < 100 KB target. If quality is unacceptable, we can adjust target size.

---

## Success Criteria

- [x] All 34 unit tests pass
- [ ] Image uploads successfully
- [ ] Compression achieves < 100 KB
- [ ] Non-square images are center-cropped
- [ ] Old images are deleted (only 1 per user)
- [ ] Image displays correctly after upload
- [ ] RLS policies work correctly
- [ ] No breaking changes to existing functionality
- [ ] Mobile responsive
- [ ] Performance is acceptable (< 5 seconds)

---

## Next Steps After Testing

1. ✅ Complete all manual tests above
2. ✅ Document any issues found
3. ✅ Fix any bugs
4. ✅ Re-test
5. ✅ Update this checklist
6. ✅ Commit to main branch
7. ✅ Deploy to production (Vercel)
8. ✅ Monitor for errors in production
9. ✅ Gather user feedback

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Run SQL setup script on production Supabase
- [ ] Verify environment variables are set
- [ ] Test on production preview deployment
- [ ] Verify Supabase storage bucket exists in production
- [ ] Check RLS policies are active in production
- [ ] Test with production data
- [ ] Monitor error logs for first 24 hours
- [ ] Have rollback plan ready (if needed)

---

**Document Version**: 1.0  
**Last Updated**: September 30, 2025  
**Status**: Ready for Testing
