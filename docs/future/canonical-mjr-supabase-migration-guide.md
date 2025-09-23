# 🎯 CANONICAL MJR SUPABASE PROJECT MIGRATION GUIDE

## 📋 EXECUTIVE SUMMARY

**Date**: September 23, 2025  
**Status**: 🟡 **CRITICAL MIGRATION REQUIRED**  
**Objective**: Establish `mjrnzgunexmopvnamggw` as the canonical Supabase project ID across ALL environments  
**Current Issue**: Project uses incorrect `tydttpgytuhwoecbogvd` project ID causing login failures  
**Solution**: Complete migration to correct `mjrnzgunexmopvnamggw` project ID  

---

## 🚨 CRITICAL UNDERSTANDING

### The Root Cause
- **Current Documentation**: Points to `tydttpgytuhwoecbogvd.supabase.co` 
- **Current Environment**: May be using `tydttpgytuhwoecbogvd.supabase.co`
- **Correct Project**: `mjrnzgunexmopvnamggw.supabase.co` (confirmed by user)
- **Email Verification URLs**: Come from `mjrnzgunexmopvnamggw.supabase.co` but app expects different project

### Why This Breaks Authentication
```typescript
// User receives email from: mjrnzgunexmopvnamggw.supabase.co/auth/v1/verify?token_hash=X
// But app is configured for: tydttpgytuhwoecbogvd.supabase.co
// Result: Token verification fails because projects don't match
```

---

## 🎯 MIGRATION OBJECTIVES

### Primary Goals
1. **Consistency**: All environments use `mjrnzgunexmopvnamggw` project ID
2. **Functionality**: Email verification links work correctly
3. **Documentation**: All docs reflect correct project ID
4. **Security**: Proper environment variable management
5. **Testing**: Comprehensive verification across all environments

### Success Criteria
- ✅ Local development uses correct project ID
- ✅ Vercel production uses correct project ID  
- ✅ Vercel preview uses correct project ID
- ✅ Email verification links work end-to-end
- ✅ All documentation updated consistently
- ✅ Login flow works 100% reliably

---

## 🔧 PHASE 1: SUPABASE DASHBOARD CONFIGURATION

### 1.1 Verify Project Access
**YOU MUST DO THIS FIRST**

1. **Access Supabase Dashboard**: https://supabase.com/dashboard/project/mjrnzgunexmopvnamggw
2. **Verify Access**: Ensure you can access the project settings
3. **Document Current State**: Take screenshots of current configuration

### 1.2 Get Canonical Environment Values
**Navigate to**: https://supabase.com/dashboard/project/mjrnzgunexmopvnamggw/settings/api

**Copy These Exact Values**:
```bash
# Project URL (should be exactly this)
NEXT_PUBLIC_SUPABASE_URL=https://mjrnzgunexmopvnamggw.supabase.co

# Anon/Public Key (copy from dashboard)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=[YOUR_ANON_KEY_FROM_DASHBOARD]

# Service Role Key (copy from dashboard)
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY_FROM_DASHBOARD]
```

### 1.3 Configure Authentication Settings
**Navigate to**: https://supabase.com/dashboard/project/mjrnzgunexmopvnamggw/auth/settings

#### Site URL Configuration
```
Site URL: https://devdapp.com
```

#### Redirect URLs Configuration
**Add ALL of these URLs**:
```
# Production URLs
https://devdapp.com/auth/confirm
https://devdapp.com/auth/callback
https://devdapp.com/auth/update-password
https://devdapp.com/auth/error
https://devdapp.com/protected/profile
https://devdapp.com/

# Development URLs  
http://localhost:3000/auth/confirm
http://localhost:3000/auth/callback
http://localhost:3000/auth/update-password
http://localhost:3000/auth/error
http://localhost:3000/protected/profile
http://localhost:3000/

# Vercel Preview URLs (replace with your actual preview pattern)
https://vercel-supabase-web3-*.vercel.app/auth/confirm
https://vercel-supabase-web3-*.vercel.app/auth/callback
https://vercel-supabase-web3-*.vercel.app/auth/update-password
https://vercel-supabase-web3-*.vercel.app/auth/error
https://vercel-supabase-web3-*.vercel.app/protected/profile
https://vercel-supabase-web3-*.vercel.app/
```

#### Email Configuration
- ✅ **Enable email confirmations**: true
- ✅ **Enable email change confirmations**: true  
- ✅ **Secure email change enabled**: true

#### Email Templates
**Confirm signup**: Ensure redirect URL is `{{ .SiteURL }}/auth/confirm`
**Reset password**: Ensure redirect URL is `{{ .SiteURL }}/auth/update-password`

---

## 🔧 PHASE 2: LOCAL ENVIRONMENT MIGRATION

### 2.1 Update Local Environment File
**Create/Update `.env.local`**:

```bash
# =============================================================================
# CANONICAL MJR SUPABASE PROJECT CONFIGURATION
# Project ID: mjrnzgunexmopvnamggw
# Last Updated: September 23, 2025
# =============================================================================

# Supabase Configuration (CANONICAL)
NEXT_PUBLIC_SUPABASE_URL=https://mjrnzgunexmopvnamggw.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=[YOUR_ANON_KEY_FROM_DASHBOARD]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY_FROM_DASHBOARD]

# CDP (Coinbase Developer Platform) Configuration - Optional
CDP_API_KEY_NAME=your-cdp-api-key-name
CDP_PRIVATE_KEY=your-cdp-private-key
NEXT_PUBLIC_WALLET_NETWORK=base-sepolia

# AI Service Configuration - Optional
OPENAI_API_KEY=your-openai-key

# Feature Flags (disabled by default for safety)
NEXT_PUBLIC_ENABLE_CDP_WALLETS=false
NEXT_PUBLIC_ENABLE_AI_CHAT=false

# Development URL Override
URL=http://localhost:3000
```

### 2.2 Verify Local Environment Loading
**Create test script** `scripts/verify-env.js`:

```javascript
// scripts/verify-env.js
console.log('🔍 Environment Variable Verification');
console.log('=====================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase URL Correct:', supabaseUrl === 'https://mjrnzgunexmopvnamggw.supabase.co' ? '✅' : '❌');
console.log('Anon Key Present:', supabaseKey ? '✅' : '❌');
console.log('Service Key Present:', serviceKey ? '✅' : '❌');

if (supabaseUrl !== 'https://mjrnzgunexmopvnamggw.supabase.co') {
  console.error('❌ WRONG SUPABASE URL! Expected: https://mjrnzgunexmopvnamggw.supabase.co');
  process.exit(1);
}

console.log('✅ Environment verification passed!');
```

**Run verification**:
```bash
node scripts/verify-env.js
```

---

## 🔧 PHASE 3: VERCEL ENVIRONMENT MIGRATION

### 3.1 Update Vercel Production Environment
**Navigate to**: Vercel Dashboard → Your Project → Settings → Environment Variables

#### Delete Old Variables (if they exist)
- Remove any variables pointing to `tydttpgytuhwoecbogvd`

#### Add New Production Variables
**Environment**: Production

```
NEXT_PUBLIC_SUPABASE_URL=https://mjrnzgunexmopvnamggw.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=[YOUR_ANON_KEY_FROM_DASHBOARD]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY_FROM_DASHBOARD]
```

#### Add Optional Variables (if needed)
```
CDP_API_KEY_NAME=[your-cdp-api-key]
CDP_PRIVATE_KEY=[your-cdp-private-key]
NEXT_PUBLIC_WALLET_NETWORK=base-sepolia
OPENAI_API_KEY=[your-openai-key]
NEXT_PUBLIC_ENABLE_CDP_WALLETS=false
NEXT_PUBLIC_ENABLE_AI_CHAT=false
```

### 3.2 Update Vercel Preview Environment
**Environment**: Preview

Add the same variables as Production (above).

### 3.3 Force Vercel Redeployment
After updating environment variables:

1. **Go to Vercel Dashboard** → Deployments
2. **Find latest deployment** → Click "..." → Redeploy
3. **Choose "Use existing Build Cache"** → Redeploy
4. **Monitor deployment** for any errors

---

## 🔧 PHASE 4: DOCUMENTATION UPDATES

### 4.1 Update Primary Setup Guide
**File**: `CANONICAL_SETUP.md`

**Replace all instances** of `tydttpgytuhwoecbogvd` with `mjrnzgunexmopvnamggw`:

```bash
# Find and replace in CANONICAL_SETUP.md
# OLD: https://tydttpgytuhwoecbogvd.supabase.co
# NEW: https://mjrnzgunexmopvnamggw.supabase.co
```

### 4.2 Update Environment Example
**File**: `env-example.txt`

```bash
# Supabase Configuration (CANONICAL)
# Get these values from: https://supabase.com/dashboard/project/mjrnzgunexmopvnamggw/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://mjrnzgunexmopvnamggw.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4.3 Update All Documentation Files
**Search and replace** in these directories:
```bash
# docs/
# scripts/
# README.md
# Any other files mentioning the old project ID
```

**Command to find all references**:
```bash
grep -r "tydttpgytuhwoecbogvd" . --exclude-dir=node_modules --exclude-dir=.git
```

---

## 🔧 PHASE 5: CODE VERIFICATION

### 5.1 Verify No Hardcoded Project IDs
**Search for hardcoded references**:
```bash
grep -r "tydttpgytuhwoecbogvd" app/ lib/ components/ --include="*.ts" --include="*.tsx"
grep -r "mjrnzgunexmopvnamggw" app/ lib/ components/ --include="*.ts" --include="*.tsx"
```

**Expected Result**: No hardcoded project IDs in code (should use environment variables)

### 5.2 Verify Environment Variable Usage
**Check these files use env vars correctly**:
- `lib/supabase/client.ts` ✅
- `lib/supabase/server.ts` ✅  
- `lib/supabase/middleware.ts` ✅

**Expected pattern**:
```typescript
process.env.NEXT_PUBLIC_SUPABASE_URL!
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
```

---

## 🧪 PHASE 6: COMPREHENSIVE TESTING

### 6.1 Local Development Testing
```bash
# Start local development
npm run dev

# Test these endpoints manually:
# http://localhost:3000/auth/sign-up
# http://localhost:3000/auth/login
# http://localhost:3000/protected/profile
```

**Test Scenarios**:
1. **Sign Up Flow**:
   - Create account with test email
   - Check email inbox
   - Verify email URL contains `mjrnzgunexmopvnamggw`
   - Click verification link
   - Confirm redirect to profile

2. **Login Flow**:
   - Login with verified account
   - Access protected pages
   - Verify session persistence

### 6.2 Production Testing
**After Vercel deployment**:

```bash
# Test production URLs:
# https://devdapp.com/auth/sign-up
# https://devdapp.com/auth/login
# https://devdapp.com/protected/profile
```

**Automated Test Script**:
```javascript
// scripts/test-production-auth.js
const https = require('https');

async function testAuthEndpoints() {
  const baseUrl = 'https://devdapp.com';
  const endpoints = [
    '/auth/sign-up',
    '/auth/login', 
    '/protected/profile'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`);
      console.log(`${endpoint}: ${response.status === 200 ? '✅' : '❌'} (${response.status})`);
    } catch (error) {
      console.log(`${endpoint}: ❌ Error - ${error.message}`);
    }
  }
}

testAuthEndpoints();
```

### 6.3 Email Verification Testing
**Critical Test**:
1. Sign up with **real email** (use mailinator.com for testing)
2. **Check email source** - should come from `mjrnzgunexmopvnamggw.supabase.co`
3. **Click verification link** - should work without errors
4. **Verify redirect** - should go to profile page
5. **Test session** - should persist across page reloads

---

## 🚨 PHASE 7: TROUBLESHOOTING GUIDE

### 7.1 Common Issues and Solutions

#### Issue: "Invalid login credentials" 
**Cause**: Environment variables not loaded
**Solution**: 
```bash
# Verify environment loading
node scripts/verify-env.js

# Restart development server
npm run dev
```

#### Issue: Email verification links still point to old project
**Cause**: Supabase email templates cached
**Solution**:
1. Go to Supabase Dashboard → Authentication → Email Templates
2. **Reset to default** templates
3. **Save** and wait 5 minutes for cache clear

#### Issue: Vercel deployment fails after env var changes
**Cause**: Build cache contains old environment
**Solution**:
1. Go to Vercel Dashboard → Deployments  
2. Click "..." → **Redeploy**
3. **Uncheck "Use existing Build Cache"**
4. Redeploy with fresh build

#### Issue: Session not persisting
**Cause**: Cookie domain mismatch
**Solution**:
1. Check Supabase Site URL matches domain exactly
2. Verify redirect URLs include exact domain
3. Clear browser cookies and test again

### 7.2 Emergency Rollback Procedure
If migration causes critical issues:

1. **Revert Vercel Environment Variables**:
   - Change back to old project ID temporarily
   - Redeploy immediately

2. **Revert Local Environment**:
   - Update `.env.local` with old values
   - Restart development server

3. **Document Issue**:
   - Note what failed
   - Plan correction strategy

---

## 📊 VERIFICATION CHECKLIST

### Environment Configuration
- [ ] Local `.env.local` uses `mjrnzgunexmopvnamggw`
- [ ] Vercel Production env uses `mjrnzgunexmopvnamggw`  
- [ ] Vercel Preview env uses `mjrnzgunexmopvnamggw`
- [ ] No hardcoded project IDs in code

### Supabase Dashboard Configuration  
- [ ] Site URL set to production domain
- [ ] All redirect URLs configured correctly
- [ ] Email confirmations enabled
- [ ] Email templates use correct redirect URLs

### Documentation Updates
- [ ] `CANONICAL_SETUP.md` updated
- [ ] `env-example.txt` updated  
- [ ] All docs reference correct project ID
- [ ] No references to old project ID

### Functional Testing
- [ ] Local development auth works
- [ ] Production auth works
- [ ] Email verification works end-to-end
- [ ] Session persistence works
- [ ] Protected routes work after auth

### Production Validation
- [ ] Production deployment successful
- [ ] No build errors or warnings
- [ ] All auth endpoints return 200
- [ ] Real email verification test passes

---

## 🎯 POST-MIGRATION MONITORING

### Daily Checks (First Week)
- **Auth Success Rate**: Should be >95%
- **Email Delivery**: Should be <2 minutes
- **Error Logs**: Monitor for auth-related errors

### Weekly Checks (First Month)  
- **Performance**: Page load times after auth
- **User Reports**: Monitor for auth issues
- **Environment Drift**: Verify env vars haven't changed

### Monthly Maintenance
- **Security Review**: Rotate service keys if needed
- **Documentation Review**: Keep migration guide updated
- **Testing**: Run full auth flow tests

---

## 📚 ADDITIONAL RESOURCES

### Supabase Documentation
- [Auth Configuration](https://supabase.com/docs/guides/auth/overview)
- [Email Templates](https://supabase.com/docs/guides/auth/custom-email)
- [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)

### Next.js Documentation  
- [Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [API Routes](https://nextjs.org/docs/api-routes/introduction)

### Vercel Documentation
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Deployments](https://vercel.com/docs/concepts/deployments/overview)

---

## 🎉 SUCCESS CONFIRMATION

### Migration Complete When:
1. ✅ **Email Test**: Sign up with new email, receive verification from `mjrnzgunexmopvnamggw`, click link, access profile
2. ✅ **Environment Consistency**: All environments use same project ID  
3. ✅ **Documentation Alignment**: All docs reference correct project
4. ✅ **Zero Auth Errors**: No authentication failures in logs
5. ✅ **Team Verification**: Other team members can replicate success

### Final Validation Command:
```bash
# Run this to confirm everything is correct
echo "Checking final migration status..."
node scripts/verify-env.js
npm run build
echo "✅ Migration verification complete!"
```

---

**Document Prepared By**: AI Assistant  
**Migration Target**: Complete within 4 hours  
**Critical Success Factor**: `mjrnzgunexmopvnamggw` project ID used consistently everywhere  
**Next Review**: 24 hours post-migration for stability confirmation
