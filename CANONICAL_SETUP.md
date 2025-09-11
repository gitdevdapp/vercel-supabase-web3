# 🚀 CANONICAL SUPABASE + VERCEL SETUP GUIDE

## 📋 OVERVIEW
This guide provides the **exact, sequential steps** to properly configure your production Supabase + Next.js + Vercel setup with the canonical database ID `tydttpgytuhwoecbogvd`.

**⚠️ CRITICAL**: Only use these exact credentials:
- **URL**: `https://tydttpgytuhwoecbogvd.supabase.co`
- **Anon Key**: `[REDACTED - GET FROM SUPABASE DASHBOARD]`

---

## 🎯 QUICK START (USER ACTION REQUIRED)

### Step 1: Environment Configuration
**YOU MUST DO THIS** - Cursor AI cannot access your Supabase dashboard.

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/tydttpgytuhwoecbogvd/settings/api
2. **Copy the Service Role Key** (under "Project API keys")
3. **Create `.env.local`** in your project root:

```bash
# Canonical Supabase Project: tydttpgytuhwoecbogvd
NEXT_PUBLIC_SUPABASE_URL=https://tydttpgytuhwoecbogvd.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
```

---

## 🔄 SEQUENTIAL CONFIGURATION STEPS

### PHASE 1: SUPABASE AUTH SETUP (USER REQUIRED)

#### 1.1 Configure Authentication Redirect URLs
**YOU MUST DO THIS** - Go to: https://supabase.com/dashboard/project/tydttpgytuhwoecbogvd/auth/settings

**Add these redirect URLs** (replace `your-domain.com` with your actual domain):

```
http://localhost:3000/auth/callback
https://your-domain.com/auth/callback
http://localhost:3000/auth/confirm
https://your-domain.com/auth/confirm
```

#### 1.2 Enable Email Authentication
- ✅ **Enable email confirmations**
- ✅ **Enable email change confirmations**
- ✅ **Secure email change enabled**

#### 1.3 Site URL Configuration
**Set Site URL to**: `https://your-domain.com` (your production domain)

---

### PHASE 2: VERCEL ENVIRONMENT VARIABLES (USER REQUIRED)

#### 2.1 Vercel Dashboard Setup
1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**
3. **Go to Settings → Environment Variables**

#### 2.2 Add Production Environment Variables
Add these **exact** variables for **Production** environment:

```
NEXT_PUBLIC_SUPABASE_URL=https://tydttpgytuhwoecbogvd.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
```

#### 2.3 Add Preview Environment Variables (Optional)
For preview deployments, add the same variables to **Preview** environment.

---

### PHASE 3: LOCAL DEVELOPMENT SETUP (CURSOR AI CAN DO THIS)

#### 3.1 Install Dependencies
```bash
npm install
```

#### 3.2 Environment File Creation
**Cursor AI can create this file** with the exact content:

```bash
# .env.local
# Canonical Supabase Project: tydttpgytuhwoecbogvd
NEXT_PUBLIC_SUPABASE_URL=https://tydttpgytuhwoecbogvd.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
```

---

### PHASE 4: DATABASE SETUP (CURSOR AI CAN HELP)

#### 4.1 Create Auth Tables
**Cursor AI can help you run this SQL** in Supabase SQL Editor:

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

#### 4.2 Test Database Connection
**Cursor AI can help you create a test API route** to verify the connection.

---

## 🛠️ WHAT CURSOR AI CAN AUTOMATE

### ✅ CAN BE DONE BY CURSOR AI:
1. **Create `.env.local`** with canonical credentials
2. **Install npm dependencies**
3. **Create test API routes** for Supabase connectivity
4. **Generate database schema SQL**
5. **Create authentication components**
6. **Set up middleware for protected routes**
7. **Generate environment variable validation**

### ❌ CANNOT BE DONE BY CURSOR AI (REQUIRES YOU):
1. **Access Supabase Dashboard** to get service role key
2. **Configure redirect URLs** in Supabase Auth settings
3. **Set up Vercel environment variables** in dashboard
4. **Deploy to Vercel** and configure domain
5. **Configure DNS** for custom domain
6. **Set site URL** in Supabase project settings

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
- `https://your-domain.com`
- Authentication flow
- Protected routes

---

## 🚨 TROUBLESHOOTING

### Common Issues:

#### 1. Authentication Not Working
- ✅ **Check**: Redirect URLs in Supabase match your domain
- ✅ **Check**: Site URL in Supabase matches your production domain
- ✅ **Check**: Environment variables are set correctly in Vercel

#### 2. Database Connection Issues
- ✅ **Check**: Service role key is correct (not anon key)
- ✅ **Check**: URL is exactly `https://tydttpgytuhwoecbogvd.supabase.co`
- ✅ **Check**: Environment variables are loaded

#### 3. Environment Variables Not Loading
- ✅ **Check**: File is named `.env.local` (not `.env`)
- ✅ **Check**: No extra spaces or characters
- ✅ **Check**: Keys match exactly as specified

---

## 📝 CHECKLIST SUMMARY

### USER MUST DO:
- [ ] Get service role key from Supabase dashboard
- [ ] Configure redirect URLs in Supabase Auth settings
- [ ] Set site URL in Supabase project settings
- [ ] Add environment variables to Vercel dashboard
- [ ] Deploy to Vercel and configure domain

### CURSOR AI CAN DO:
- [ ] Create `.env.local` file
- [ ] Install dependencies
- [ ] Create test API routes
- [ ] Generate database schema
- [ ] Build authentication UI components
- [ ] Set up protected routes middleware

---

## 🔐 SECURITY NOTES

1. **Never commit** `.env.local` or any environment files with real keys
2. **Only use** the canonical database ID `tydttpgytuhwoecbogvd`
3. **Always use** the exact anon key provided above
4. **Keep service role key** secure and never expose in client-side code

---

## 🎯 NEXT STEPS AFTER SETUP

1. **Test authentication flow** locally
2. **Deploy to Vercel** with environment variables
3. **Test production deployment**
4. **Configure custom domain** if needed
5. **Set up monitoring** and error tracking

---

*Last Updated: September 11, 2025*
*Canonical Database ID: tydttpgytuhwoecbogvd*
