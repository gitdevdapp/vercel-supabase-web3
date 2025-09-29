# 🚀 CANONICAL Complete Setup Guide: Vercel + Supabase + PKCE + Profile System

**Date**: September 26, 2025  
**Status**: ✅ **PRODUCTION READY - COMPLETE SOLUTION**  
**Version**: 3.0 - Database-First PKCE Authentication with Automated Scripts  

---

## 🎯 What This Guide Delivers

This is the **definitive, single-source guide** for transforming an empty Vercel Supabase template into a **fully operational profile-based application** with:

- ✅ **Complete PKCE Email Authentication** - Zero-configuration email confirmation flow
- ✅ **Automated Database Setup** - One-command production database configuration
- ✅ **Enhanced Profile System** - Username editing, about me, automatic profile creation
- ✅ **Production-Ready Deployment** - Vercel deployment with zero build failures
- ✅ **End-to-End Flow** - Email confirmation → Profile page → Edit functionality

### 🎉 End Result
After following this guide, users will:
1. **Sign up** via email → Receive confirmation email
2. **Click email link** → Automatically redirect to `/protected/profile`
3. **Edit profile** → Update username and about_me fields
4. **Save changes** → Profile persists to production database

---

## 📋 Prerequisites (5 minutes)

Before starting, ensure you have:
- [ ] **GitHub account** with repository access
- [ ] **Supabase account** (free tier sufficient)
- [ ] **Vercel account** (free tier sufficient)
- [ ] **Node.js 18+** installed locally
- [ ] **Git** installed and configured

---

## 🏁 Phase 1: Repository Setup (10 minutes)

### Step 1.1: Clone and Install
```bash
# Clone your template repository
git clone https://github.com/your-username/vercel-supabase-web3.git
cd vercel-supabase-web3

# Install all dependencies including database tools
npm install

# Verify project structure
ls -la app/ components/ lib/ scripts/
```

### Step 1.2: Verify Scripts Available
```bash
# Check that setup scripts are present
ls -la scripts/setup-production-* scripts/enhanced-database-setup.sql
```

You should see:
- `scripts/setup-production-database.js` (interactive setup)
- `scripts/setup-production-direct.js` (direct setup)
- `scripts/enhanced-database-setup.sql` (database schema)
- `scripts/verify-production-setup.js` (verification)

---

## 🗄️ Phase 2: Supabase Project Creation (15 minutes)

### Step 2.1: Create Supabase Project
1. **Go to [supabase.com](https://supabase.com) → Sign up/Login**
2. **Create new project:**
   - Project name: `your-app-name-prod`
   - Database password: **Generate strong password** (save securely!)
   - Region: Choose closest to your users
   - Plan: Free (sufficient for development)

### Step 2.2: Get API Credentials
1. **Navigate to Project Settings → API**
2. **Copy these exact values:**
   ```
   Project URL: https://your-project-id.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (keep secret!)
   ```

⚠️ **CRITICAL**: Save the `service_role` key securely - you'll need it once for database setup.

### Step 2.3: Automated Database Setup (Choose One Method)

#### Method A: Direct Setup (Fastest - 30 seconds)
```bash
# Update the service role key in the script
# Edit scripts/setup-production-direct.js and replace SERVICE_KEY value

# Run the automated setup
npm run setup:production-direct

# Verify setup worked
npm run verify:production

# IMPORTANT: Delete the script (contains service key)
rm scripts/setup-production-direct.js
```

#### Method B: Interactive Setup (Safest)
```bash
# Run interactive setup (will prompt for service key)
npm run setup:production

# Verify setup worked  
npm run verify:production
```

#### Method C: Manual Setup (If scripts fail)
1. **Go to Supabase Dashboard → SQL Editor**
2. **Copy entire contents of `scripts/enhanced-database-setup.sql`**
3. **Paste into SQL Editor and click "Run"**
4. **Verify** you see success messages in the output

### Step 2.4: Verify Database Setup
After any method, verify the setup:
```bash
npm run verify:production
```

You should see:
```
✅ Database connection successful
✅ Table 'profiles' exists and is accessible
✅ RLS working - no private profiles accessible
✅ Profile creation properly secured
```

---

## 🔐 Phase 3: Local Environment Configuration (10 minutes)

### Step 3.1: Create Environment File
```bash
# Create local environment file
cp env-example.txt .env.local

# Edit .env.local with your Supabase credentials
```

### Step 3.2: Update .env.local File
Replace the placeholder values:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key-here

# Optional: Custom domain for production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

**🚨 CRITICAL**: Replace `your-project-id` and `your-anon-key-here` with your actual values from Step 2.2.

### Step 3.3: Test Local Setup
```bash
# Start development server
npm run dev

# In another terminal, test the setup
curl http://localhost:3000/api/test-supabase

# Expected response:
# {"success":true,"message":"Supabase connection successful"}
```

### Step 3.4: Pre-deployment Validation (MANDATORY)
```bash
# These MUST ALL PASS before deploying
npm run lint              # Check code quality
npm run lint --fix        # Auto-fix issues
npm run build             # Test production build
npm start                 # Test production server locally

# All commands must complete without errors
```

---

## 🌐 Phase 4: Vercel Deployment (20 minutes)

### Step 4.1: Create Vercel Project
1. **Go to [vercel.com](https://vercel.com) → Login with GitHub**
2. **Import Project:**
   - Click "Add New Project"
   - Select your repository
   - Framework: Next.js (auto-detected)
   - **DO NOT DEPLOY YET** - configure environment first

### Step 4.2: Configure Environment Variables
**In Vercel Project Settings → Environment Variables:**

Add for **ALL environments** (Production, Preview, Development):

```bash
Variable: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project-id.supabase.co

Variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY  
Value: your-anon-key-here
```

**Optional** (if using custom domain):
```bash
Variable: NEXT_PUBLIC_APP_URL
Value: https://your-domain.com
```

### Step 4.3: Deploy to Production
```bash
# Commit and push to trigger deployment
git add .
git commit -m "Production setup complete - deploy with database"
git push origin main

# Vercel automatically deploys (takes ~2-3 minutes)
```

### Step 4.4: Note Your Production URL
Your app will be available at:
- **Production**: `https://your-app-name.vercel.app`
- **Preview**: `https://your-app-name-git-branch.vercel.app`

---

## 🔗 Phase 5: Supabase Authentication Configuration (15 minutes)

### Step 5.1: Configure Site URL
1. **Go to Supabase Dashboard → Authentication → URL Configuration**
2. **Set Site URL to your Vercel domain:**
   ```
   https://your-app-name.vercel.app
   ```

### Step 5.2: Add Authentication Redirect URLs
**Add ALL these URLs in Supabase Dashboard → Authentication → URL Configuration:**

#### Production URLs (Required)
```
https://your-app-name.vercel.app/auth/callback
https://your-app-name.vercel.app/auth/confirm
https://your-app-name.vercel.app/auth/login
https://your-app-name.vercel.app/auth/sign-up
https://your-app-name.vercel.app/auth/forgot-password
https://your-app-name.vercel.app/auth/update-password
https://your-app-name.vercel.app/protected/profile
```

#### Development URLs (For local testing)
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/confirm
http://localhost:3000/auth/login
http://localhost:3000/auth/sign-up
http://localhost:3000/auth/forgot-password
http://localhost:3000/auth/update-password
http://localhost:3000/protected/profile
```

#### Preview Deployment URLs (For branch previews)
```
https://your-app-name-*.vercel.app/auth/callback
https://your-app-name-*.vercel.app/auth/confirm
https://your-app-name-*.vercel.app/auth/login
https://your-app-name-*.vercel.app/auth/sign-up
https://your-app-name-*.vercel.app/auth/forgot-password
https://your-app-name-*.vercel.app/auth/update-password
https://your-app-name-*.vercel.app/protected/profile
```

---

## 🧪 Phase 6: Complete End-to-End Testing (10 minutes)

### Step 6.1: Test Complete Authentication Flow
1. **Go to your production URL**: `https://your-app-name.vercel.app`
2. **Click "Sign Up"** or navigate to `/auth/sign-up`
3. **Enter email and password** (use a real email you can access)
4. **Check your email** for confirmation message
5. **Click the confirmation link** in email
6. **Verify**: You should be redirected to `/protected/profile`

### Step 6.2: Test Profile Functionality  
After email confirmation:
1. **Verify profile page loads** with your email and default values
2. **Edit username** - try changing to something unique
3. **Edit about me** - add some text about yourself
4. **Click "Update Profile"** button
5. **Verify changes persist** - refresh page and check values remain

### Step 6.3: Test Security Features
1. **Open incognito window** → try to access `/protected/profile`
2. **Verify**: Should redirect to login page (protected route working)
3. **Login with your account** → should access profile successfully
4. **Logout** → verify you can't access protected pages

---

## 🎯 Understanding the Complete System

### PKCE Authentication Flow
```
1. User clicks "Sign Up" → Supabase generates PKCE code
2. Email sent with confirmation link containing token
3. User clicks link → /auth/confirm route processes PKCE exchange
4. Supabase validates token → creates authenticated session
5. Trigger fires → automatic profile creation in database
6. User redirected → /protected/profile with full access
```

### Database Architecture
The enhanced database setup includes:

#### Profiles Table
```sql
profiles (
  id UUID PRIMARY KEY,           -- Links to auth.users
  username TEXT UNIQUE,          -- Editable username (3-30 chars)
  email TEXT,                    -- From auth.users.email
  full_name TEXT,                -- Display name
  avatar_url TEXT,               -- Profile picture
  about_me TEXT,                 -- Bio (up to 1000 chars)
  is_public BOOLEAN,             -- Profile visibility
  email_verified BOOLEAN,        -- Email confirmation status
  onboarding_completed BOOLEAN,  -- Onboarding state
  created_at TIMESTAMP,          -- Creation time
  updated_at TIMESTAMP,          -- Last update
  last_active_at TIMESTAMP       -- Activity tracking
)
```

#### Security Features
- **Row Level Security (RLS)**: Users can only access their own profiles
- **Automatic Profile Creation**: Trigger creates profile on user signup
- **Data Validation**: Constraints ensure username format and length limits
- **Performance Indexes**: Fast queries for common operations

### Application Features
- **Protected Routes**: `/protected/profile` requires authentication
- **Profile Management**: Username and about_me editing with validation
- **Responsive Design**: Works on mobile and desktop
- **Real-time Feedback**: Character counting and validation messages
- **Error Handling**: User-friendly error messages and loading states

---

## 🚨 Troubleshooting Guide

### Issue 1: Email Links Still Point to Localhost
**Symptoms**: Confirmation emails contain `localhost:3000` URLs instead of production URL

**Solution**:
1. Verify Site URL in Supabase is set to production domain
2. Check `NEXT_PUBLIC_APP_URL` environment variable in Vercel
3. Redeploy application to pick up new environment variables
4. Clear browser cache and test in incognito mode

### Issue 2: Profile Page Shows "Profile not found"
**Symptoms**: After email confirmation, profile page shows error

**Solution**:
1. Check if database setup completed successfully:
   ```bash
   npm run verify:production
   ```
2. Verify the `handle_new_user()` trigger was created
3. Check Supabase logs for database errors
4. Manually create a profile via SQL Editor if needed

### Issue 3: Authentication Redirects Fail
**Symptoms**: Email confirmation redirects to error page

**Solution**:
1. Verify ALL redirect URLs are added to Supabase (see Phase 5.2)
2. Ensure wildcard patterns are correctly configured
3. Check that Site URL exactly matches production domain
4. Test with different browsers and clear cookies

### Issue 4: Build Failures During Deployment
**Symptoms**: Vercel deployment fails with lint or build errors

**Solution**:
```bash
# Run these locally to identify issues
npm run lint
npm run lint --fix
npm run build

# Common fixes:
# - Remove unused imports
# - Fix TypeScript errors
# - Check environment variable names
```

### Issue 5: Database Connection Errors
**Symptoms**: "Invalid API key" or connection failures

**Solution**:
1. Verify anon key is correct in Vercel environment variables
2. Check Supabase project is active and accessible
3. Ensure environment variables are set for all environments
4. Test connection with verification script

---

## 🔄 Ongoing Development Workflow

### Standard Development Process
```bash
# 1. Always start from main branch
git checkout main
git pull origin main

# 2. Make changes locally
# Edit components, add features, etc.

# 3. Test locally before deployment
npm run dev
# Verify changes work as expected

# 4. MANDATORY pre-deployment validation
npm run lint && npm run lint --fix
npm run build
npm run start
# ALL must pass without errors

# 5. Deploy only after successful validation
git add .
git commit -m "Descriptive commit message"
git push origin main
# Vercel auto-deploys in ~2-3 minutes
```

### Emergency Rollback (30 seconds)
If deployment breaks:
1. **Vercel Dashboard → Deployments**
2. **Find last working deployment** (green checkmark)
3. **Click "..." → "Redeploy"**
4. **Site reverts immediately**

---

## 📊 Production Monitoring

### Health Checks
Regular monitoring endpoints:
- **Homepage**: `https://your-app.vercel.app/` (should load without errors)
- **API Health**: `https://your-app.vercel.app/api/test-supabase` (connection test)
- **Auth Flow**: Test signup/login periodically

### Performance Metrics
Monitor in Vercel Analytics:
- **Core Web Vitals**: Should maintain 90+ scores
- **Function Duration**: Auth operations < 2s
- **Error Rate**: Should be < 1%

### Security Monitoring
- **Supabase Auth Logs**: Monitor for suspicious activity
- **RLS Policy Violations**: Check for unauthorized access attempts
- **Environment Variables**: Ensure no secrets in client-side code

---

## 🎉 Success Validation Checklist

### ✅ Complete Setup Verification
- [ ] **Repository cloned and dependencies installed**
- [ ] **Supabase project created with database schema**
- [ ] **Local development environment working**
- [ ] **Vercel deployment successful without build errors**
- [ ] **Authentication redirect URLs configured correctly**
- [ ] **Database setup scripts executed successfully**

### ✅ Functionality Testing
- [ ] **User signup creates account and sends confirmation email**
- [ ] **Email confirmation link redirects to production domain**
- [ ] **Profile page loads after email confirmation**
- [ ] **Username editing works and persists changes**
- [ ] **About me editing works with character limits**
- [ ] **Profile updates save to database successfully**
- [ ] **Logout/login cycle maintains profile data**
- [ ] **Protected routes block unauthorized access**

### ✅ Security & Performance
- [ ] **RLS policies prevent unauthorized data access**
- [ ] **No sensitive credentials in browser or Git**
- [ ] **HTTPS enforced on production**
- [ ] **Mobile responsive design verified**
- [ ] **Performance scores above 90**
- [ ] **Error handling provides helpful user feedback**

---

## 🎯 What You've Built

After completing this guide, you have:

### 🏗️ **Complete Authentication System**
- PKCE-based email confirmation flow
- Secure session management with Supabase
- Protected routes with automatic redirects
- Login/logout functionality

### 👤 **Enhanced Profile System**
- Automatic profile creation on signup
- Username editing with validation (3-30 characters, alphanumeric)
- About me field with character limits (1000 chars)
- Profile visibility controls
- Real-time validation feedback

### 🗄️ **Production Database**
- Enhanced profiles table with 11+ fields
- Row Level Security protecting user data
- Automatic triggers for profile management
- Performance indexes for fast queries
- Data validation constraints

### 🚀 **Production-Ready Deployment**
- Zero-downtime deployment pipeline
- Environment variable management
- Build error prevention system
- Emergency rollback capabilities
- Performance monitoring

---

## 📞 Support & Next Steps

### Immediate Next Steps
1. **Test thoroughly** with multiple user accounts
2. **Monitor performance** in Vercel Analytics
3. **Set up error tracking** (Sentry, LogRocket, etc.)
4. **Plan additional features** (avatar uploads, social auth, etc.)

### Advanced Features to Consider
- **Avatar upload** to Supabase Storage
- **Social authentication** (Google, GitHub, Discord)
- **Web3 wallet integration** (already scaffolded)
- **Admin dashboard** for user management
- **Email templates** customization

### Support Resources
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Project Documentation**: Check `docs/current/` for latest system state

---

**🎉 Congratulations!** You now have a fully operational profile-based application with enterprise-grade authentication and database management.

---

*Last Updated: September 26, 2025*  
*Guide Version: 3.0 - Canonical Complete Solution*  
*Status: ✅ Production Ready - Zero Configuration Required*
