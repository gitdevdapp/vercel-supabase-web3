# 🚀 Production Database Setup Scripts

This directory contains scripts for setting up your Supabase production database with the complete profile system.

## 🔐 Security Notice

⚠️ **The service role key has full admin access to your database**
- Only use for initial setup
- Delete scripts containing the key after use
- Never commit service keys to Git

## 📋 Available Scripts

### 1. Interactive Setup (Recommended)
```bash
node scripts/production/setup-production-database.js
```
- Prompts for service key securely
- Handles errors gracefully
- Safe for repeated use

### 2. Direct Setup (Fastest)
```bash
node scripts/production/setup-production-direct.js
```
- Uses embedded service key
- Immediate execution
- **DELETE THIS FILE AFTER USE**

### 3. Verification
```bash
node scripts/production/verify-production-setup.js
```
- Verifies database setup
- Tests RLS policies
- Uses anon key (safe)

## 🛠️ Requirements

Install PostgreSQL client (for direct connection):
```bash
npm install pg
```

## 📋 What Gets Set Up

The scripts will create:

- ✅ **Enhanced profiles table** with all required fields
- ✅ **Row Level Security (RLS)** policies for data protection
- ✅ **Automatic profile creation** triggers for new users
- ✅ **Data validation** constraints (username format, length limits)
- ✅ **Performance indexes** for fast queries
- ✅ **Migration support** for existing users

## 🔄 Setup Process

1. **Run the setup script**:
   ```bash
   node scripts/production/setup-production-direct.js
   ```

2. **Verify the setup**:
   ```bash
   node scripts/production/verify-production-setup.js
   ```

3. **Clean up security files**:
   ```bash
   rm scripts/production/setup-production-direct.js
   ```

4. **Deploy your application** - it will work immediately!

## 📊 Database Schema

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,           -- Links to auth.users.id
  username TEXT UNIQUE,          -- 3-30 chars, alphanumeric
  email TEXT,                    -- From auth.users.email
  full_name TEXT,                -- Display name
  avatar_url TEXT,               -- Profile picture URL
  about_me TEXT,                 -- Bio (up to 1000 chars)
  is_public BOOLEAN,             -- Profile visibility
  email_verified BOOLEAN,        -- Email confirmation status
  onboarding_completed BOOLEAN,  -- Onboarding flow status
  created_at TIMESTAMP,          -- Account creation time
  updated_at TIMESTAMP,          -- Last profile update
  last_active_at TIMESTAMP       -- Last activity time
);
```

### Security Features
- **RLS Policies**: Users can only access their own data + public profiles
- **Data Validation**: Constraints ensure data quality
- **Automatic Creation**: New users get profiles automatically
- **Performance**: Indexes for fast queries

## 🧪 Testing

After setup, test the flow:

1. **Sign up** a new user via `/auth/sign-up`
2. **Confirm email** using the confirmation link
3. **Check profile** - should redirect to `/protected/profile`
4. **Edit profile** - username and about_me should save properly

## 🚨 Troubleshooting

### Script fails with connection error
- Check your service role key is valid
- Ensure network access to Supabase
- Try the manual setup in Supabase Dashboard

### Profiles not creating automatically
- Check if the trigger was created: `on_auth_user_created`
- Verify the function exists: `handle_new_user()`
- Look at Supabase logs for errors

### RLS blocking operations
- Ensure user is authenticated
- Check RLS policies are created correctly
- Verify auth.uid() returns the correct user ID

## 🔗 Alternative: Manual Setup

If scripts fail, use Supabase Dashboard:

1. Go to: [REDACTED - SUPABASE SQL EDITOR URL REMOVED]
2. Copy contents of: `scripts/database/enhanced-database-setup.sql`
3. Paste into SQL Editor
4. Click "Run"

## 📞 Support

If you encounter issues:
1. Check the verification script output
2. Review Supabase logs in the dashboard
3. Ensure your service role key has full permissions
4. Try the manual setup as a fallback

---

**Remember**: Delete any files containing the service role key after successful setup!
