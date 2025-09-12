# 🚨 Vercel Deployment Errors & Solutions

## 📋 Canonical Error Handling Guide

This document serves as the definitive reference for common Vercel deployment errors, their causes, and proven solutions. It includes the specific foundation section ESLint error that was recently resolved, along with comprehensive deployment reliability practices.

---

## 🎯 Recent Foundation Section ESLint Error

### **Error Details**
```
./components/foundation-section.tsx
26:56  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
26:82  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
46:66  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
```

### **Root Cause**
ESLint's `react/no-unescaped-entities` rule detected unescaped apostrophes in JSX text content. This rule enforces proper HTML entity escaping to prevent potential parsing issues and maintain consistent rendering across different browsers.

### **Solution Applied**
**File**: `components/foundation-section.tsx`

**Changes Made:**
- Line 26: `Vercel's` → `Vercel&apos;s`
- Line 26: `Supabase's` → `Supabase&apos;s`
- Line 46: `foundation's` → `foundation&apos;s`

**Technical Fix:**
```tsx
// Before (causing error):
<p className="text-muted-foreground">
  Deploy production-ready DApps with Vercel's global CDN and Supabase's robust database
</p>

// After (fixed):
<p className="text-muted-foreground">
  Deploy production-ready DApps with Vercel&apos;s global CDN and Supabase&apos;s robust database
</p>
```

### **Prevention Strategy**
- Always use HTML entities (`&apos;`) for apostrophes in JSX text
- Consider using curly braces `{variable}` for dynamic content instead of hardcoded text
- Run `npm run lint` before commits to catch these issues locally

---

## 🚀 Vercel Deployment Reliability Best Practices

### **Pre-Deployment Checklist**
```bash
# Always run these before pushing to main
npm run lint      # Catch ESLint errors
npm run build     # Verify build succeeds locally
npm run test      # Run test suite
```

### **Environment Variable Management**
- ✅ Never commit `.env` files to git
- ✅ Use `.env.local` for local development
- ✅ Configure all required variables in Vercel dashboard
- ✅ Test with production values in preview deployments

### **Build Optimization**
- ✅ Keep bundle size under 100KB for optimal performance
- ✅ Use dynamic imports for large components
- ✅ Implement proper image optimization
- ✅ Enable gzip compression in Vercel settings

---

## 🔧 Common Deployment Errors & Solutions

### **1. ESLint Build Failures**

#### **Symptoms:**
```
Error: Command "npm run build" exited with 1
ESLint errors found in files
```

#### **Common Causes:**
- Unescaped quotes or apostrophes in JSX
- Unused variables or imports
- Missing TypeScript types
- Console.log statements in production code

#### **Solutions:**
```bash
# Fix ESLint errors locally first
npm run lint

# Auto-fix what can be auto-fixed
npm run lint -- --fix

# Check specific file
npx eslint components/foundation-section.tsx
```

#### **Prevention:**
- Run ESLint in your IDE (enable auto-save)
- Use pre-commit hooks to prevent problematic commits
- Configure ESLint to run on save in your editor

### **2. Environment Variable Errors**

#### **Symptoms:**
```
NEXT_PUBLIC_SUPABASE_URL is not defined
Supabase connection failed
```

#### **Causes:**
- Missing environment variables in Vercel
- Incorrect variable names
- Variables not prefixed correctly for client-side access

#### **Solutions:**
1. **Check Vercel Dashboard:**
   - Go to Project Settings → Environment Variables
   - Ensure all required variables are set
   - Use correct naming convention

2. **Required Variables:**
```bash
# Server-side only (no NEXT_PUBLIC_ prefix)
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Client-side accessible
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### **3. Supabase Authentication Errors**

#### **Symptoms:**
```
Auth redirect failed
Invalid redirect URL
```

#### **Causes:**
- Incorrect redirect URLs configured in Supabase
- Missing wildcard patterns for preview deployments
- Domain mismatch between Vercel and Supabase

#### **Solutions:**
1. **Configure Supabase Auth Settings:**
```
Production URLs:
https://yourdomain.com/auth/callback
https://yourdomain.com/auth/confirm

Preview URLs (wildcard pattern):
https://your-app-name-*.vercel.app/auth/callback
https://your-app-name-*.vercel.app/auth/confirm
```

2. **Verify Domain Configuration:**
- Ensure your Vercel domain matches Supabase settings
- Use wildcards for preview deployments
- Test authentication flow on both production and preview

### **4. Database Connection Errors**

#### **Symptoms:**
```
Connection to database failed
RLS policy violation
```

#### **Causes:**
- Incorrect database credentials
- Row Level Security policies blocking access
- Database schema not properly initialized

#### **Solutions:**
1. **Verify Database Schema:**
```sql
-- Check if profiles table exists
SELECT * FROM information_schema.tables
WHERE table_name = 'profiles';

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';
```

2. **Test Connection:**
```bash
# Test API endpoint
curl https://yourdomain.com/api/test-supabase
```

### **5. TypeScript Compilation Errors**

#### **Symptoms:**
```
TypeScript error: Property 'X' does not exist on type 'Y'
Module not found: Can't resolve 'path/to/module'
```

#### **Causes:**
- Missing type definitions
- Incorrect import paths
- Type mismatches

#### **Solutions:**
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Fix common issues:
# 1. Install missing types: npm install @types/package-name
# 2. Update import paths to use relative paths
# 3. Add proper type annotations
```

---

## 📊 Monitoring & Debugging Strategies

### **Vercel Dashboard Monitoring**
- ✅ **Real-time Logs**: Monitor build and runtime logs
- ✅ **Function Logs**: Debug serverless function errors
- ✅ **Performance Metrics**: Track Core Web Vitals
- ✅ **Error Tracking**: Automatic error detection and alerts

### **Supabase Monitoring**
- ✅ **Database Logs**: Real-time query monitoring
- ✅ **Auth Logs**: Authentication attempt tracking
- ✅ **API Logs**: RESTful API request monitoring
- ✅ **Realtime Logs**: WebSocket connection monitoring

### **Local Debugging**
```bash
# Development server with detailed logs
npm run dev

# Build with verbose output
npm run build --verbose

# Test specific functionality
npm run test -- --testNamePattern="specific-test"
```

---

## 🛡️ Error Prevention Workflow

### **1. Local Development**
```bash
# Before starting development
npm install
npm run dev

# Regular checks during development
npm run lint
npm run test
```

### **2. Pre-Commit Checks**
```bash
# Configure husky for pre-commit hooks
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run test"
```

### **3. Pre-Push Validation**
```bash
# Full validation before pushing
npm run lint
npm run build
npm run test
git push origin main
```

### **4. Post-Deployment Verification**
- ✅ Test all user flows on production
- ✅ Verify responsive design across devices
- ✅ Check console for runtime errors
- ✅ Monitor performance metrics

---

## 🚨 Emergency Rollback Procedures

### **Immediate Rollback (30 seconds)**
1. Open Vercel Dashboard
2. Navigate to your project → Deployments
3. Find the last working deployment (green checkmark)
4. Click "Rollback to this deployment"
5. Confirm rollback

### **Local Investigation**
```bash
# While rollback is active, investigate locally
npm run dev
npm run lint
npm run build

# Fix issues locally
git add .
git commit -m "Fix deployment errors"
git push origin main
```

### **Rollback Best Practices**
- ✅ Always have a working deployment to rollback to
- ✅ Test fixes locally before redeploying
- ✅ Use descriptive commit messages for easier rollback identification
- ✅ Keep deployment history for at least 30 days

---

## 📈 Performance Optimization

### **Build Performance**
- ✅ Minimize bundle size (< 100KB recommended)
- ✅ Use dynamic imports for code splitting
- ✅ Implement proper caching strategies
- ✅ Optimize images and assets

### **Runtime Performance**
- ✅ Monitor Core Web Vitals
- ✅ Implement proper loading states
- ✅ Use React.memo for expensive components
- ✅ Optimize database queries

---

## 🔗 Support Resources

### **Vercel Support**
- **Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Community**: [vercel.com/community](https://vercel.com/community)
- **Enterprise Support**: Direct dashboard support chat

### **Supabase Support**
- **Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Community**: [supabase.com/community](https://supabase.com/community)
- **Enterprise Support**: Direct dashboard support

### **Next.js Support**
- **Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **GitHub Issues**: [github.com/vercel/next.js](https://github.com/vercel/next.js)
- **Community**: [nextjs.org/community](https://nextjs.org/community)

---

## 🎯 Summary: Deployment Success Rate Optimization

### **Key Success Factors**
1. **Consistent Local Testing**: Always run full test suite before deployment
2. **ESLint Compliance**: Fix all linting errors before pushing
3. **Environment Validation**: Ensure all required variables are configured
4. **Rollback Readiness**: Maintain working deployment history
5. **Monitoring Setup**: Configure alerts for deployment failures

### **Expected Success Rates**
- **Local Testing**: 95%+ success rate with proper pre-deployment checks
- **Vercel Deployment**: 99%+ success rate with proper configuration
- **Post-Deployment**: 100% uptime with proper monitoring and rollback procedures

### **Continuous Improvement**
- ✅ Review deployment logs regularly
- ✅ Update dependencies proactively
- ✅ Monitor performance metrics
- ✅ Implement automated testing where possible

---

*Last Updated: September 12, 2025*
*Version: 1.0 - Canonical Error Reference*
*Status: ✅ Active - Regularly Updated*