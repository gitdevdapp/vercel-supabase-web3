# 🚀 Canonical Deployment Guide: Template to Production

## 📋 Complete Setup for Public Template Repository

This is the definitive guide for deploying a clone of this public template repository to a new Vercel account and new Supabase free account, with proper security and redirect URL configuration.

---

## 🎯 What This Guide Covers

- ✅ Fork/clone this public template repository
- ✅ Create new Supabase free account and database
- ✅ Configure `.env.local` securely with git ignore
- ✅ Set up Supabase authentication and redirect URLs
- ✅ Deploy to Vercel with automatic deployment from GitHub
- ✅ Configure custom domain (optional)
- ✅ Implement database schema with Row Level Security

---

## 📦 Prerequisites

- GitHub account
- Node.js 18+ installed
- Git installed
- Text editor (VS Code, Cursor, etc.)

---

## 🚀 Phase 1: Repository Setup (10 minutes)

### Step 1.1: Clone the Template Repository
```bash
# Option A: Fork the repository on GitHub (recommended)
# 1. Go to the repository page
# 2. Click "Fork" button
# 3. Clone your fork

# Option B: Clone directly
git clone https://github.com/gitdevdapp/vercel-supabase-web3.git
cd vercel-supabase-web3

# Install dependencies
npm install
```

### Step 1.2: Verify Project Structure
```bash
# Check that key files exist
ls -la app/           # Next.js app directory
ls -la components/    # React components
ls -la lib/supabase/  # Supabase configuration
ls -la docs/          # Documentation
```

---

## 🗄️ Phase 2: Supabase Database Setup (15 minutes)

### Step 2.1: Create Supabase Account and Project
1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up** for a free account (GitHub login recommended)
3. **Create new project**:
   - Project name: `your-app-name`
   - Database password: Generate a strong password (save it!)
   - Region: Choose closest to your users
   - Pricing plan: Free (includes 50,000 monthly active users)

### Step 2.2: Get Your Supabase Credentials
Once your project is created:
1. **Navigate to Project Settings → API**
2. **Copy these values**:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: Long string starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Example credentials format**:
```
Project URL: https://your-project-id.supabase.co
Anon Key: your-anon-key-here
```

### Step 2.3: Configure Database Schema
1. **Open Supabase SQL Editor** (Dashboard → SQL Editor)
2. **Create a new query**
3. **Copy and paste this SQL**:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  about_me TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profile access
CREATE POLICY "Users can view own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, about_me)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'email', 'user'), 
    null, 
    null
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

4. **Click "Run"** to execute the SQL
5. **Verify success**: Check that `profiles` table appears in Table Editor

---

## 🔐 Phase 3: Local Environment Setup (10 minutes)

### Step 3.1: Create .env.local File
```bash
# Navigate to project root
cd /path/to/your-project

# Create .env.local file
touch .env.local

# Open in your editor
code .env.local  # VS Code
cursor .env.local  # Cursor
```

### Step 3.2: Add Supabase Credentials
Add the following to your `.env.local` file:

```bash
# Supabase Configuration
# Replace with your actual credentials from Step 2.2
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key-here

# Optional: Service Role Key (for admin operations - keep secret!)
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**🔒 IMPORTANT**: Replace `your-project-id` and `your-anon-key-here` with your actual values from Step 2.2.

### Step 3.3: Verify Git Ignore Configuration
```bash
# Check that .env.local is ignored
grep -n "\.env\.local" .gitignore

# If not found, add it
echo ".env.local" >> .gitignore

# Verify it's ignored
git check-ignore .env.local
# Should output: .env.local
```

### Step 3.4: Test Local Setup
```bash
# Start development server
npm run dev

# Test Supabase connection
curl http://localhost:3000/api/test-supabase

# Expected response:
# {"message":"Supabase connection successful!","timestamp":"...","user_count":0}
```

---

## 🌐 Phase 4: Vercel Deployment Setup (20 minutes)

### Step 4.1: Create Vercel Account and Project
1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up** with GitHub (recommended for easy repository access)
3. **Import Git Repository**:
   - Click "Add New Project"
   - Select your repository
   - Framework: Next.js (auto-detected)
   - Keep default build settings

### Step 4.2: Configure Environment Variables in Vercel
1. **Go to Project Settings → Environment Variables**
2. **Add these variables for all environments** (Production, Preview, Development):

```bash
NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project-id.supabase.co

NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
Value: your-anon-key-here
```

3. **Click "Save"** after each variable

### Step 4.3: Deploy to Vercel
```bash
# Option A: Automatic deployment (recommended)
git add .
git commit -m "Initial deployment setup"
git push origin main
# Vercel automatically deploys

# Option B: Manual deployment via CLI
npm i -g vercel
vercel login
vercel --prod
```

---

## 🔗 Phase 5: Supabase Authentication URLs (10 minutes)

### Step 5.1: Get Your Vercel Domain
1. **Check Vercel Dashboard** for your project
2. **Note your domains**:
   - **Production**: `your-app-name.vercel.app` or custom domain
   - **Preview**: `your-app-name-git-branch.vercel.app`

### Step 5.2: Configure Supabase Redirect URLs
1. **Go to Supabase Dashboard → Authentication → URL Configuration**
2. **Set Site URL**:
   ```
   https://your-app-name.vercel.app
   ```

3. **Add Redirect URLs** (add each one separately):
   ```
   # Production URLs
   https://your-app-name.vercel.app/auth/callback
   https://your-app-name.vercel.app/auth/confirm
   https://your-app-name.vercel.app/auth/login
   https://your-app-name.vercel.app/auth/sign-up
   https://your-app-name.vercel.app/auth/forgot-password
   https://your-app-name.vercel.app/auth/update-password
   https://your-app-name.vercel.app/protected/profile

   # Preview deployment URLs (for testing)
   https://your-app-name-*.vercel.app/auth/callback
   https://your-app-name-*.vercel.app/auth/confirm

   # Local development URLs
   http://localhost:3000/auth/callback
   http://localhost:3000/auth/confirm
   ```

4. **Save configuration**

### Step 5.3: Test Authentication Flow
1. **Visit your deployed app**: `https://your-app-name.vercel.app`
2. **Try signing up**: Click "Sign Up" and create an account
3. **Check email**: Confirm your email address
4. **Test login**: Log in with your new account
5. **Check profile**: Visit `/protected/profile` to verify profile creation

---

## 🏷️ Phase 6: Custom Domain Setup (Optional - 15 minutes)

### Step 6.1: Add Custom Domain in Vercel
1. **Vercel Dashboard → Project Settings → Domains**
2. **Add domain**: `your-domain.com`
3. **Configure DNS** at your domain registrar:
   ```dns
   Type: CNAME
   Name: @ (or your domain)
   Value: cname.vercel-dns.com
   TTL: 300
   ```

### Step 6.2: Update Supabase URLs for Custom Domain
1. **Update Site URL in Supabase**:
   ```
   https://your-domain.com
   ```

2. **Add custom domain redirect URLs**:
   ```
   https://your-domain.com/auth/callback
   https://your-domain.com/auth/confirm
   https://your-domain.com/auth/login
   https://your-domain.com/auth/sign-up
   https://your-domain.com/auth/forgot-password
   https://your-domain.com/auth/update-password
   https://your-domain.com/protected/profile
   ```

---

## 🧪 Phase 7: Testing & Verification (10 minutes)

### Step 7.1: Functionality Test Checklist
- [ ] ✅ Homepage loads correctly
- [ ] ✅ User registration works
- [ ] ✅ Email confirmation works
- [ ] ✅ User login/logout works
- [ ] ✅ Profile page accessible
- [ ] ✅ Profile editing works
- [ ] ✅ Mobile responsive design
- [ ] ✅ Dark/light mode switching

### Step 7.2: Security Verification
- [ ] ✅ `.env.local` not committed to Git
- [ ] ✅ Users can only access their own profiles
- [ ] ✅ Authentication required for protected routes
- [ ] ✅ HTTPS enabled on production
- [ ] ✅ No console errors on frontend

### Step 7.3: Performance Check
```bash
# Check Core Web Vitals
# Visit: https://pagespeed.web.dev/
# Test: https://your-app-name.vercel.app

# Expected scores:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 100
# SEO: 90+
```

---

## 🔄 Phase 8: Ongoing Deployment Workflow

### Standard Development Workflow
```bash
# 1. Make changes locally
git checkout main
git pull origin main

# 2. Make your changes
# Edit files as needed

# 3. Test locally
npm run dev
# Verify changes work

# 4. Deploy to production
git add .
git commit -m "Descriptive commit message"
git push origin main
# Vercel automatically deploys in ~2 minutes
```

### Emergency Rollback (if needed)
1. **Vercel Dashboard → Deployments**
2. **Find last working deployment** (green checkmark)
3. **Click "Rollback to this deployment"**
4. **Site reverts in ~30 seconds**

---

## 🔐 Security Best Practices

### Environment Variables
- ✅ **Never commit** `.env.local` to Git
- ✅ **Use `NEXT_PUBLIC_*`** prefix for client-side variables
- ✅ **Keep service role keys** server-side only
- ✅ **Rotate keys** if compromised

### Database Security
- ✅ **Row Level Security** enabled by default
- ✅ **Users can only access** their own data
- ✅ **API keys restricted** to specific domains
- ✅ **Automatic profile creation** on signup

### Application Security
- ✅ **HTTPS enforced** in production
- ✅ **XSS protection** via React
- ✅ **Input validation** on forms
- ✅ **Secure session management** via Supabase

---

## 🚨 Troubleshooting Common Issues

### Issue 1: "Invalid API key" Error
**Cause**: Wrong credentials or environment variables not loaded

**Solution**:
1. Verify credentials in Supabase Dashboard → Settings → API
2. Check environment variables in Vercel Dashboard
3. Restart development server: `npm run dev`
4. Redeploy if needed

### Issue 2: Authentication Redirects Fail
**Cause**: Missing or incorrect redirect URLs in Supabase

**Solution**:
1. Check Supabase Dashboard → Authentication → URL Configuration
2. Ensure all URLs include your exact domain
3. Add both production and preview URLs
4. Test email confirmation flow

### Issue 3: Profile Not Created
**Cause**: Database trigger not working or RLS blocking access

**Solution**:
1. Check Supabase Dashboard → Table Editor → profiles
2. Verify trigger exists and is enabled
3. Test with SQL: `SELECT * FROM profiles WHERE id = auth.uid();`
4. Check RLS policies are correct

### Issue 4: Build Failures
**Cause**: Environment variables missing or TypeScript errors

**Solution**:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test build locally: `npm run build`
4. Fix TypeScript errors if any

---

## 📊 Monitoring & Analytics

### Vercel Analytics
1. **Enable in Project Settings → Analytics**
2. **Monitor**:
   - Page load times
   - Core Web Vitals
   - Deployment success rate
   - Error tracking

### Supabase Monitoring
1. **Dashboard → Settings → Logs**
2. **Monitor**:
   - Database queries
   - Authentication events
   - API usage
   - Error logs

---

## 📚 Additional Resources

### Documentation
- **This project**: `docs/` directory
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)

### Support
- **Vercel**: Dashboard chat or support@vercel.com
- **Supabase**: Dashboard support or Discord community
- **Next.js**: GitHub discussions or Stack Overflow

---

## ✅ Deployment Success Checklist

### Technical Setup
- [ ] ✅ Repository cloned and dependencies installed
- [ ] ✅ Supabase project created with database schema
- [ ] ✅ Environment variables configured securely
- [ ] ✅ Vercel project deployed successfully
- [ ] ✅ Authentication redirect URLs configured
- [ ] ✅ Custom domain configured (if applicable)

### Functionality Verification
- [ ] ✅ User registration and email confirmation working
- [ ] ✅ User login and logout functional
- [ ] ✅ Profile creation and editing operational
- [ ] ✅ Protected routes securing content appropriately
- [ ] ✅ Mobile responsive design verified
- [ ] ✅ Performance metrics acceptable

### Security & Best Practices
- [ ] ✅ No sensitive credentials in Git repository
- [ ] ✅ Row Level Security policies protecting user data
- [ ] ✅ HTTPS enforced on production domain
- [ ] ✅ Error tracking and monitoring configured
- [ ] ✅ Rollback strategy tested and confirmed

---

## 🎉 Congratulations!

You've successfully deployed a production-ready Next.js application with Supabase authentication. Your app features:

- 🔐 **Secure authentication** with email confirmation
- 👤 **User profiles** with automatic creation
- 📱 **Mobile-responsive** design
- 🚀 **Auto-deployment** from GitHub commits
- 🛡️ **Row-level security** protecting user data
- ⚡ **Fast performance** with Vercel's global CDN
- 🔄 **Easy rollbacks** for safe updates

---

*Last Updated: September 12, 2025*  
*Guide Version: 1.0*  
*Status: ✅ Production Ready*
