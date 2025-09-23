# 🚀 CANONICAL SUPABASE + VERCEL SETUP GUIDE

## 📋 OVERVIEW
This guide provides the **exact, sequential steps** to properly configure your production Supabase + Next.js + Vercel setup with the canonical database ID `[REDACTED-PROJECT-ID]`.

**⚠️ CRITICAL**: Only use these exact credentials:
- **URL**: `https://[REDACTED-PROJECT-ID].supabase.co`
- **Project ID**: `[REDACTED-PROJECT-ID]`
- **Anon Key**: `[GET FROM SUPABASE DASHBOARD]`

---

## 🎯 QUICK START (USER ACTION REQUIRED)

### Step 1: Environment Configuration
**YOU MUST DO THIS** - Get your credentials from the Supabase dashboard.

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/[REDACTED-PROJECT-ID]/settings/api
2. **Copy the Anon Key** (under "Project API keys")
3. **Copy the Service Role Key** (under "Project API keys") 
4. **Create `.env.local`** in your project root:

```bash
# Canonical MJR Supabase Project: [REDACTED-PROJECT-ID]
NEXT_PUBLIC_SUPABASE_URL=https://[REDACTED-PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
```

---

## 🔄 SEQUENTIAL CONFIGURATION STEPS

### PHASE 1: SUPABASE AUTH SETUP (USER REQUIRED)

#### 1.1 Configure Authentication Redirect URLs
**YOU MUST DO THIS** - Go to: https://supabase.com/dashboard/project/[REDACTED-PROJECT-ID]/auth/settings

**Add these redirect URLs** (replace `devdapp.com` with your actual domain):

```
# Production URLs
https://devdapp.com/auth/callback
https://devdapp.com/auth/confirm
https://devdapp.com/auth/update-password
https://devdapp.com/protected/profile
https://devdapp.com/

# Development URLs
http://localhost:3000/auth/callback
http://localhost:3000/auth/confirm
http://localhost:3000/auth/update-password
http://localhost:3000/protected/profile
http://localhost:3000/

# Vercel Preview URLs
https://vercel-supabase-web3-*.vercel.app/auth/callback
https://vercel-supabase-web3-*.vercel.app/auth/confirm
https://vercel-supabase-web3-*.vercel.app/auth/update-password
https://vercel-supabase-web3-*.vercel.app/protected/profile
https://vercel-supabase-web3-*.vercel.app/
```

#### 1.2 Enable Email Authentication
- ✅ **Enable email confirmations**
- ✅ **Enable email change confirmations**
- ✅ **Secure email change enabled**

#### 1.3 Site URL Configuration
**Set Site URL to**: `https://devdapp.com` (your production domain)

---

### PHASE 2: VERCEL ENVIRONMENT VARIABLES (USER REQUIRED)

#### 2.1 Vercel Dashboard Setup
1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**
3. **Go to Settings → Environment Variables**

#### 2.2 Add Production Environment Variables
Add these **exact** variables for **Production** environment:

```
NEXT_PUBLIC_SUPABASE_URL=https://[REDACTED-PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
```

#### 2.3 Add Preview Environment Variables (Optional)
For preview deployments, add the same variables to **Preview** environment.

---

### PHASE 3: LOCAL DEVELOPMENT SETUP

#### 3.1 Install Dependencies
```bash
npm install
```

#### 3.2 Environment File Creation
Create `.env.local` with the exact content:

```bash
# Canonical MJR Supabase Project: [REDACTED-PROJECT-ID]
NEXT_PUBLIC_SUPABASE_URL=https://[REDACTED-PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

# Optional CDP Configuration
CDP_API_KEY_NAME=your-cdp-api-key-name
CDP_PRIVATE_KEY=your-cdp-private-key
NEXT_PUBLIC_WALLET_NETWORK=base-sepolia

# Optional AI Configuration
OPENAI_API_KEY=your-openai-key

# Feature Flags (disabled by default for safety)
NEXT_PUBLIC_ENABLE_CDP_WALLETS=false
NEXT_PUBLIC_ENABLE_AI_CHAT=false
```

#### 3.3 Verify Environment Configuration
```bash
npm run verify-env
```

---

### PHASE 4: DATABASE SETUP

#### 4.1 Create Auth Tables
Run this SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

---

## 🧪 TESTING YOUR SETUP

### Local Development Test
```bash
npm run dev
```

**Test these endpoints:**
- `http://localhost:3000` - Main app
- `http://localhost:3000/auth/login` - Login page
- `http://localhost:3000/auth/sign-up` - Sign up page
- `http://localhost:3000/protected` - Protected route (requires auth)

### Production Test
After deployment, test:
- `https://devdapp.com`
- Authentication flow
- Protected routes

### Automated Testing
```bash
# Verify environment
npm run verify-env

# Test production endpoints
npm run test:production

# Complete migration test
npm run migrate:test
```

---

## 🚨 TROUBLESHOOTING

### Common Issues:

#### 1. Authentication Not Working
- ✅ **Check**: Redirect URLs in Supabase match your domain
- ✅ **Check**: Site URL in Supabase matches your production domain
- ✅ **Check**: Environment variables are set correctly in Vercel

#### 2. Database Connection Issues
- ✅ **Check**: Service role key is correct (not anon key)
- ✅ **Check**: URL is exactly `https://[REDACTED-PROJECT-ID].supabase.co`
- ✅ **Check**: Environment variables are loaded

#### 3. Environment Variables Not Loading
- ✅ **Check**: File is named `.env.local` (not `.env`)
- ✅ **Check**: No extra spaces or characters
- ✅ **Check**: Keys match exactly as specified

---

## 📝 CHECKLIST SUMMARY

### USER MUST DO:
- [ ] Get anon and service role keys from Supabase dashboard
- [ ] Configure redirect URLs in Supabase Auth settings
- [ ] Set site URL in Supabase project settings
- [ ] Add environment variables to Vercel dashboard
- [ ] Deploy to Vercel and configure domain

### AUTOMATED SCRIPTS AVAILABLE:
- [ ] `npm run verify-env` - Verify local environment
- [ ] `npm run test:production` - Test production endpoints
- [ ] `npm run migrate:test` - Complete environment test

---

## 🔐 SECURITY NOTES

1. **Never commit** `.env.local` or any environment files with real keys
2. **Only use** the canonical database ID `[REDACTED-PROJECT-ID]`
3. **Keep service role key** secure and never expose in client-side code
4. **Rotate keys** periodically for security

---

## 🎯 NEXT STEPS AFTER SETUP

1. **Test authentication flow** locally
2. **Deploy to Vercel** with environment variables
3. **Test production deployment**
4. **Configure custom domain** if needed
5. **Set up monitoring** and error tracking

---

## 📚 ADDITIONAL RESOURCES

### Helpful Scripts
- `scripts/verify-env.js` - Environment verification
- `scripts/test-production-auth.js` - Production testing

### Documentation
- `docs/future/canonical-mjr-supabase-migration-guide.md` - Complete migration guide
- `docs/future/MJR-MIGRATION-SUMMARY.md` - Executive summary

### Supabase Links
- **Dashboard**: https://supabase.com/dashboard/project/[REDACTED-PROJECT-ID]
- **Auth Settings**: https://supabase.com/dashboard/project/[REDACTED-PROJECT-ID]/auth/settings
- **API Keys**: https://supabase.com/dashboard/project/[REDACTED-PROJECT-ID]/settings/api

---

*Last Updated: September 23, 2025*  
*Canonical Database ID: [REDACTED-PROJECT-ID]*  
*Production URL: https://devdapp.com*
