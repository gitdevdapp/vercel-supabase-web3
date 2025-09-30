# Profile System Documentation

**Version**: 2.0 | **Status**: ✅ Production Ready | **Setup Time**: 2 minutes

---

## 🚀 Quick Start

### Setup Supabase (Copy & Paste)

1. **Open** [Supabase Dashboard](https://app.supabase.com) → Your Project → SQL Editor
2. **Copy** the entire SQL script from [`SETUP.md`](./SETUP.md)
3. **Paste** into SQL Editor and click **Run**
4. **Verify** success messages (✅ for each component)

### Test Upload

1. Navigate to `/protected/profile`
2. Click "Upload Image"
3. Select `assets/testprofile.png`
4. Verify upload and display ✅

**Done!** Your profile system is ready.

---

## 📚 Documentation

### [SETUP.md](./SETUP.md) - Complete Setup Guide ⭐
**Use this for Supabase setup**
- Full SQL script (copy-paste ready)
- Verification steps
- Expected output
- Troubleshooting

### [PROFILE-SYSTEM-MASTER.md](./PROFILE-SYSTEM-MASTER.md) - Technical Reference
**Use this for deep understanding**
- System architecture
- Implementation details
- Performance metrics
- Testing documentation

---

## ✨ What This System Does

### Profile Image Upload
- **Client-side compression**: 85%+ reduction (600 KB → 85 KB)
- **Auto center-crop**: Non-square images → square
- **Smart cleanup**: Deletes old images automatically
- **Free tier optimized**: 12,000+ users on 1 GB

### Features
- ✅ Drag-and-drop upload (hover on avatar)
- ✅ Real-time compression preview
- ✅ Automatic image optimization
- ✅ Secure storage with RLS policies
- ✅ Complete profile management

---

## 🔧 System Components

### Database
- `profiles` table with image fields
- 5 RLS policies (secure access control)
- Auto-profile creation trigger
- Username validation (3-30 chars)

### Storage
- `profile-images` bucket (public)
- 4 RLS policies (upload/delete/view)
- 2 MB upload limit
- Compressed to ~85 KB WebP

### Client
- `lib/image-optimizer.ts` - Compression engine
- `components/profile-image-uploader.tsx` - Upload UI
- `components/simple-profile-form.tsx` - Profile form

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Compression | 85%+ reduction |
| Target Size | < 100 KB |
| Actual Size | ~85 KB average |
| Processing | 2-3 seconds |
| Format | WebP (512×512px) |
| Free Tier | 12,000+ users |
| Storage/User | 85 KB (1 image) |

---

## 🧪 Testing

- **Test Suite**: `__tests__/profile-image-upload.test.ts`
- **Test Coverage**: 34/34 passing ✅
- **Test Image**: `assets/testprofile.png` (601 KB → 85 KB)

---

## 🔒 Security

- **RLS Policies**: 9 total (5 profiles + 4 storage)
- **User Isolation**: Users can only access their own files
- **Public Read**: Avatar images are publicly accessible
- **Validation**: Client-side + server-side enforcement
- **MIME Types**: PNG, JPEG, GIF, WebP only

---

## 🐛 Common Issues

### "ERROR: constraint 'username_length' violated"
✅ **Fixed in v2.0!** Script now validates usernames before applying constraints.

### "Bucket not found"
Re-run the SQL script and verify bucket creation message.

### "Permission denied" on upload
Check RLS policies exist:
```sql
SELECT policyname FROM pg_policies 
WHERE policyname LIKE '%profile image%';
```

---

## 📁 File Structure

```
docs/profile/
├── README.md                    ← You are here (overview)
├── SETUP.md                     ← Complete SQL setup guide
└── PROFILE-SYSTEM-MASTER.md    ← Technical documentation

components/
├── profile-image-uploader.tsx   ← Upload UI component
└── simple-profile-form.tsx      ← Profile form

lib/
└── image-optimizer.ts           ← Compression engine

__tests__/
└── profile-image-upload.test.ts ← Test suite (34 tests)

assets/
└── testprofile.png              ← Test image
```

---

## 🎯 Production Checklist

Before deploying to production:

- [ ] Run SQL script from `SETUP.md`
- [ ] Verify all ✅ success messages
- [ ] Test profile image upload
- [ ] Verify compression (~85 KB)
- [ ] Check only 1 image per user in storage
- [ ] Confirm image displays correctly
- [ ] Review RLS policies in Supabase dashboard

---

## 🔄 Recent Updates (v2.0)

### Critical Fixes
- ✅ Fixed constraint violation error (username_length)
- ✅ Added username validation function
- ✅ Reordered SQL script execution (constraints after data)
- ✅ Added comprehensive verification queries

### Improvements
- ✅ Condensed documentation into 2 main files
- ✅ Enhanced troubleshooting guide
- ✅ Added production checklist
- ✅ Improved error prevention

---

## 💡 Quick Reference

### Get Started
```bash
# 1. Open SETUP.md
# 2. Copy entire SQL script
# 3. Paste in Supabase SQL Editor
# 4. Run script
# 5. Test upload feature
```

### Monitor Storage
```sql
-- Total storage usage
SELECT * FROM profile_image_storage_stats;

-- Specific user storage
SELECT get_user_storage_size('user-id-here'::UUID);
```

### Update Compression Settings
Edit `lib/image-optimizer.ts`:
```typescript
const CONFIG = {
  TARGET_SIZE: 100 * 1024,  // 100 KB
  INITIAL_QUALITY: 0.85,    // 85% quality
  TARGET_DIMENSIONS: 512,   // 512×512px
};
```

---

## 📞 Support

- **Setup Issues**: Check [`SETUP.md`](./SETUP.md) troubleshooting section
- **Technical Details**: See [`PROFILE-SYSTEM-MASTER.md`](./PROFILE-SYSTEM-MASTER.md)
- **Code Issues**: Review implementation files in `components/` and `lib/`
- **Test Failures**: Run `npm test profile-image-upload.test.ts`

---

## 🚢 Deployment

This system is:
- ✅ **Production Ready**: All tests passing
- ✅ **Scalable**: Optimized for Supabase free tier
- ✅ **Secure**: Complete RLS implementation
- ✅ **Tested**: 34 comprehensive tests
- ✅ **Documented**: Complete setup guide

**Status**: Ready to deploy! 🎉

---

**Documentation Version**: 2.0  
**Last Updated**: September 30, 2025  
**Maintained By**: Development Team
