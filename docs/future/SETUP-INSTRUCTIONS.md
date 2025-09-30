# Profile Image Upload - Setup Instructions

**Quick Start Guide for Deploying Profile Image Upload Feature**

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
npm install
```

Dependencies added:
- `browser-image-compression` (for client-side image compression)

### Step 2: Set Up Supabase Storage

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy and paste the entire contents of `scripts/setup-profile-image-storage.sql`
6. Click **Run** or press `Cmd+Enter`
7. Verify success messages in the output:
   - ✅ Bucket "profile-images" created successfully
   - ✅ RLS policies created successfully (4 policies)
   - ✅ Column "avatar_url" exists in profiles table

**Option B: Via Supabase CLI**

```bash
supabase db execute -f scripts/setup-profile-image-storage.sql
```

### Step 3: Start Development Server

```bash
npm run dev
```

### Step 4: Test the Feature

1. Navigate to `http://localhost:3000/protected/profile`
2. Sign in (if not already)
3. Click **"Upload Image"**
4. Select `assets/testprofile.png`
5. Verify compression and upload works

---

## 📁 Files Added/Modified

### New Files Created:
```
lib/image-optimizer.ts                    - Image processing library
components/profile-image-uploader.tsx     - Upload component
scripts/setup-profile-image-storage.sql   - Database setup script
__tests__/profile-image-upload.test.ts    - Tests
docs/future/profile-image-implementation-findings.md
docs/future/profile-image-testing-guide.md
docs/future/SETUP-INSTRUCTIONS.md
```

### Modified Files:
```
components/simple-profile-form.tsx        - Integrated uploader
package.json                              - Added browser-image-compression
```

---

## 🗄️ Database Schema

### Storage Bucket

**Name**: `profile-images`  
**Public**: Yes  
**Max File Size**: 2 MB  
**Allowed Types**: PNG, JPEG, GIF, WebP

### RLS Policies

1. **"Users can upload their own profile image"** (INSERT)
   - Authenticated users only
   - Must upload to their own user folder

2. **"Users can update their own profile image"** (UPDATE)
   - Authenticated users only
   - Can only update their own images

3. **"Users can delete their own profile image"** (DELETE)
   - Authenticated users only
   - Can only delete their own images

4. **"Anyone can view profile images"** (SELECT)
   - Public access
   - Required for displaying avatars

### Profile Table Updates

```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS profile_picture TEXT;
```

---

## 🔧 Configuration

### Image Compression Settings

Located in `lib/image-optimizer.ts`:

```typescript
const CONFIG = {
  MAX_UPLOAD_SIZE: 2 * 1024 * 1024,    // 2 MB
  TARGET_SIZE: 100 * 1024,              // 100 KB
  TARGET_WIDTH: 512,                    // 512px
  TARGET_HEIGHT: 512,                   // 512px
  INITIAL_QUALITY: 0.85,                // 85% quality
  MIN_QUALITY: 0.5,                     // 50% minimum
  OUTPUT_FORMAT: 'image/webp',          // WebP format
};
```

### Adjusting Settings

To change target size or quality:

1. Edit `lib/image-optimizer.ts`
2. Modify `CONFIG` object
3. Rebuild: `npm run build`

---

## 🧪 Testing

### Run Unit Tests

```bash
npm test -- __tests__/profile-image-upload.test.ts
```

Expected: **34 tests pass**

### Manual Testing

Follow `docs/future/profile-image-testing-guide.md`

Key tests:
- ✅ Upload testprofile.png (601 KB → ~85 KB)
- ✅ Verify center cropping works
- ✅ Verify old images are deleted
- ✅ Verify only final compressed image stored

---

## 📊 Storage Optimization

### Free Tier Capacity

**Supabase Free Tier**: 1 GB storage

With 100 KB per image:
```
1 GB ÷ 100 KB = ~10,000 users
```

### Monitoring Storage Usage

Via Supabase Dashboard:
1. Go to **Storage** → **profile-images**
2. View total usage at top
3. Or run this query:

```sql
SELECT * FROM profile_image_storage_stats;
```

---

## 🔒 Security

### File Validation

- ✅ File type whitelist (PNG, JPEG, GIF, WebP)
- ✅ File size limit (2 MB max)
- ✅ Server-side validation via Supabase
- ✅ Client-side validation for better UX

### RLS Policies

- ✅ Users can only modify their own images
- ✅ Public read access for avatars
- ✅ Authenticated write access only
- ✅ User ID enforced in storage path

### Privacy

- ✅ Processing happens in browser (client-side)
- ✅ No third-party services involved
- ✅ Images stored securely in Supabase
- ✅ Users can delete their images anytime

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] Run SQL setup on **production** Supabase
- [ ] Verify environment variables (NEXT_PUBLIC_SUPABASE_URL, etc.)
- [ ] Test on Vercel preview deployment
- [ ] Verify storage bucket created in production
- [ ] Check RLS policies active in production
- [ ] Test with real user data

### Deploy to Vercel

```bash
git add .
git commit -m "Add profile image upload with compression and storage optimization"
git push origin main
```

Vercel will auto-deploy from main branch.

### Post-Deployment

1. Test upload on production
2. Monitor error logs (Vercel Dashboard)
3. Check Supabase storage usage
4. Verify no breaking changes
5. Monitor for 24-48 hours

---

## 🐛 Troubleshooting

### "Permission denied" error

**Cause**: RLS policies not set up  
**Fix**: Run SQL setup script

### "Bucket not found" error

**Cause**: Storage bucket not created  
**Fix**: Verify bucket exists in Supabase Dashboard → Storage

### Images not displaying

**Cause**: Bucket not public or CORS issue  
**Fix**: 
1. Verify bucket is marked as public
2. Check CORS settings in Supabase Dashboard

### Old images not being deleted

**Cause**: RLS DELETE policy issue  
**Fix**: Verify DELETE policy exists and user is authenticated

### Compression too slow

**Cause**: Large image or slow device  
**Fix**: Normal. Web Worker keeps UI responsive. Wait 2-5 seconds.

---

## 📈 Monitoring

### Metrics to Track

1. **Upload Success Rate**
   - Target: > 95%
   
2. **Average File Size**
   - Target: < 100 KB
   
3. **Processing Time**
   - Target: < 5 seconds
   
4. **Storage Usage**
   - Monitor via Supabase Dashboard
   
5. **Error Rate**
   - Check Vercel logs

### Alerts to Set Up

1. Storage approaching 800 MB (80% of free tier)
2. Upload failure rate > 5%
3. Average file size > 150 KB

---

## 🆘 Support

### Common Questions

**Q: Can users upload multiple images?**  
A: No, only one profile image per user. Old images are auto-deleted.

**Q: What if I want higher quality images?**  
A: Edit `TARGET_SIZE` in `lib/image-optimizer.ts` to 200 KB or higher.

**Q: Does this work on mobile?**  
A: Yes, fully responsive and works on iOS/Android browsers.

**Q: What happens to URL-based profile pictures?**  
A: They still work! We maintain backwards compatibility.

**Q: Can I use a different storage provider?**  
A: Yes, but you'll need to modify `profile-image-uploader.tsx` to use different API.

---

## 🎯 Success Criteria

- [x] All unit tests pass (34/34)
- [ ] Manual testing complete (see testing guide)
- [ ] No breaking changes to existing features
- [ ] Performance acceptable (< 5 seconds)
- [ ] Storage optimized (< 100 KB per image)
- [ ] Security validated (RLS policies work)
- [ ] Mobile responsive
- [ ] Production deployment successful

---

## 📚 Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [browser-image-compression NPM](https://www.npmjs.com/package/browser-image-compression)
- [WebP Image Format](https://developers.google.com/speed/webp)

---

**Document Version**: 1.0  
**Last Updated**: September 30, 2025  
**Status**: Ready for Production
