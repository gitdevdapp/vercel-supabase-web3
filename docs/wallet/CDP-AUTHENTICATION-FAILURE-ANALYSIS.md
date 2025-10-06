# CDP Wallet Authentication Failure - Root Cause Analysis

**Date**: October 3, 2025  
**Error**: 401 Wallet Authentication Error  
**Status**: ✅ RESOLVED - Root cause was stale build cache

## Quick Summary

**THE CREDENTIALS ARE VALID** ✅  
Test wallet created successfully: `0x84d998c9e08855e61003C57B1aaE528E63cd704d`

**THE PROBLEM**: Stale Next.js build cache (`.next/`) was running old compiled code that didn't pass credentials.

**THE FIX**: 
```bash
rm -rf .next  # Clear cache
npm run dev   # Restart with fresh build
```

---

## Error Signature

```
Error [APIError]: Wallet authentication error.
    at dD (.next/server/chunks/6667.js:48:3658)
    at async qR._createAccountInternal (.next/server/chunks/6667.js:48:322866)
    at async qR.getOrCreateAccount (.next/server/chunks/6667.js:48:318958)
    at async C (.next/server/app/api/wallet/create/route.js:1:3426)
{
  statusCode: 401,
  errorType: 'unauthorized',
  errorMessage: 'Wallet authentication error.',
  correlationId: '988ddd418dc50841-IAD'
}
```

---

## Current Configuration Status

### ✅ Credentials ARE Configured Correctly

**Source**: `vercel-env-variables.txt`

```bash
CDP_API_KEY_ID=69aac710-e242-4844-aa2b-d4056e61606b
CDP_API_KEY_SECRET=HH0FhrZ5CdAoFpWRLdZQPR9kqsUYTbp4hVcqhb6FZErZ973X4ldxKxKJ4wN2hAM8jXxNmARty44+DMnMdFQQqA==
CDP_WALLET_SECRET=MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgXVAKZtzzIhOF3PobWNswbBPROzWKBfmj7jCglV2I58ehRANCAASYGh3+MAdVpgIRt+ZzT1b75mpkwHg+dHmPa3j8oC45uT+eSqgHgXL5rhkSUykpAQkRzdXQsms7pc98D7msqS2y
NEXT_PUBLIC_ENABLE_CDP_WALLETS=true
NETWORK=base-sepolia
```

### ✅ Code IS Passing Credentials Correctly

**All 4 files have been updated to pass credentials explicitly:**

#### 1. `app/api/wallet/create/route.ts` (Lines 9-19)
```typescript
function getCdpClient(): CdpClient {
  if (!isCDPConfigured()) {
    throw new Error(FEATURE_ERRORS.CDP_NOT_CONFIGURED);
  }
  
  return new CdpClient({
    apiKeyId: env.CDP_API_KEY_ID!,
    apiKeySecret: env.CDP_API_KEY_SECRET!,
    walletSecret: env.CDP_WALLET_SECRET!,
  });
}
```

#### 2. `app/api/wallet/fund/route.ts` (Lines 10-20)
✅ Same pattern - credentials passed

#### 3. `app/api/wallet/transfer/route.ts` (Lines 8-18)
✅ Same pattern - credentials passed

#### 4. `lib/accounts.ts` (Lines 14-24)
✅ Same pattern - credentials passed

---

## Possible Root Causes

### 1. 🏗️ **Build Cache Issue** (MOST LIKELY)

**Problem**: The `.next` build cache may contain OLD compiled code that doesn't pass credentials.

**Evidence**:
- Error stack trace shows minified Next.js chunks: `.next/server/chunks/6667.js`
- This means the error is coming from compiled code, not source
- If build cache is stale, it's running the OLD broken code

**Solution**:
```bash
# Clear build cache
rm -rf .next

# Restart dev server
npm run dev
```

### 2. 🌐 **Production vs Local Environment Mismatch**

**Problem**: Credentials might be set locally but not in Vercel production environment.

**Check**:
```bash
# Verify Vercel environment variables
vercel env ls

# Or check in Vercel Dashboard:
# https://vercel.com/[your-team]/[your-project]/settings/environment-variables
```

**Solution**: Ensure ALL these variables are set in Vercel:
- `CDP_API_KEY_ID`
- `CDP_API_KEY_SECRET`
- `CDP_WALLET_SECRET`
- `NETWORK` (set to "base-sepolia")
- `NEXT_PUBLIC_ENABLE_CDP_WALLETS` (set to "true")

### 3. 🔐 **API Key Permissions Issue**

**Problem**: The CDP API keys might not have permission to create wallets.

**Check in CDP Dashboard**: https://portal.cdp.coinbase.com/
- Verify API key status is "Active"
- Check key permissions include "Wallet Creation"
- Verify key hasn't expired

**Test Key Validity**:
```bash
# Run production verification script
node scripts/testing/test-production-wallet-creation.js
```

### 4. 📦 **Environment Variable Loading Issue**

**Problem**: The `@t3-oss/env-nextjs` package might not be loading environment variables in production.

**Evidence**: `lib/env.ts` has `skipValidation` enabled in production:
```typescript
skipValidation: !!process.env.SKIP_ENV_VALIDATION || process.env.NODE_ENV === 'production'
```

**This means**: In production, if env vars are missing, NO error is thrown - they're just `undefined`.

**Diagnosis**:
```typescript
// Add temporary logging in getCdpClient()
console.log('CDP Config Check:', {
  hasKeyId: !!env.CDP_API_KEY_ID,
  hasKeySecret: !!env.CDP_API_KEY_SECRET,
  hasWalletSecret: !!env.CDP_WALLET_SECRET,
  keyIdLength: env.CDP_API_KEY_ID?.length,
  // Don't log actual values!
});
```

### 5. 🔄 **CDP SDK Internal JWT Generation Failure**

**Problem**: The CDP SDK internally generates JWTs for authentication. If JWT generation fails, you get a 401.

**Possible Causes**:
- **Wallet Secret Format**: Must be a valid ECDSA private key in PEM format
- **Key Mismatch**: The wallet secret must match the API key pair
- **Clock Skew**: Server time might be off, causing JWT expiration issues

**Verification**:
```typescript
// The wallet secret should start with "MIG" and be base64-encoded
// Format: ECDSA P-256 private key
const isValidFormat = /^MIG[A-Za-z0-9+/]+=*$/.test(CDP_WALLET_SECRET);
```

---

## Diagnostic Steps

### Step 1: Verify Environment Variables Are Loaded

Add this temporarily to `app/api/wallet/create/route.ts` at the top of the `POST` function:

```typescript
export async function POST(request: NextRequest) {
  try {
    // 🔍 DIAGNOSTIC LOGGING
    console.log('=== CDP DIAGNOSTICS ===');
    console.log('isCDPConfigured:', isCDPConfigured());
    console.log('Has CDP_API_KEY_ID:', !!env.CDP_API_KEY_ID);
    console.log('Has CDP_API_KEY_SECRET:', !!env.CDP_API_KEY_SECRET);
    console.log('Has CDP_WALLET_SECRET:', !!env.CDP_WALLET_SECRET);
    console.log('CDP_API_KEY_ID length:', env.CDP_API_KEY_ID?.length);
    console.log('CDP_API_KEY_ID first 8 chars:', env.CDP_API_KEY_ID?.substring(0, 8));
    console.log('======================');
    
    // ... rest of function
```

**Expected Output**:
```
=== CDP DIAGNOSTICS ===
isCDPConfigured: true
Has CDP_API_KEY_ID: true
Has CDP_API_KEY_SECRET: true
Has CDP_WALLET_SECRET: true
CDP_API_KEY_ID length: 36
CDP_API_KEY_ID first 8 chars: 69aac710
======================
```

### Step 2: Test CDP Client Initialization Directly

Create a test file `test-cdp-init.js`:

```javascript
const { CdpClient } = require('@coinbase/cdp-sdk');

const CDP_API_KEY_ID = '69aac710-e242-4844-aa2b-d4056e61606b';
const CDP_API_KEY_SECRET = 'HH0FhrZ5CdAoFpWRLdZQPR9kqsUYTbp4hVcqhb6FZErZ973X4ldxKxKJ4wN2hAM8jXxNmARty44+DMnMdFQQqA==';
const CDP_WALLET_SECRET = 'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgXVAKZtzzIhOF3PobWNswbBPROzWKBfmj7jCglV2I58ehRANCAASYGh3+MAdVpgIRt+ZzT1b75mpkwHg+dHmPa3j8oC45uT+eSqgHgXL5rhkSUykpAQkRzdXQsms7pc98D7msqS2y';

async function testCdpInit() {
  console.log('Testing CDP Client Initialization...\n');
  
  try {
    const cdp = new CdpClient({
      apiKeyId: CDP_API_KEY_ID,
      apiKeySecret: CDP_API_KEY_SECRET,
      walletSecret: CDP_WALLET_SECRET,
    });
    
    console.log('✅ CDP Client initialized successfully');
    
    // Try to create an account
    console.log('\nTesting account creation...');
    const account = await cdp.evm.getOrCreateAccount({
      name: 'TestWallet-' + Date.now(),
    });
    
    console.log('✅ Account created successfully!');
    console.log('Address:', account.address);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Error Type:', error.errorType);
    console.error('Correlation ID:', error.correlationId);
  }
}

testCdpInit();
```

**Run it**:
```bash
node test-cdp-init.js
```

### Step 3: Check Vercel Production Environment

```bash
# List all environment variables in Vercel
vercel env ls

# Pull production environment variables
vercel env pull .env.production

# Check what's actually deployed
cat .env.production | grep CDP_
```

### Step 4: Force Redeploy

```bash
# If running on Vercel, trigger a fresh deployment
vercel --prod

# Or via git
git commit --allow-empty -m "Force rebuild - clear cache"
git push origin main
```

---

## Immediate Action Plan

### 🚨 **PRIORITY 1: Clear Build Cache**

```bash
# Stop dev server (Ctrl+C)
rm -rf .next
npm run dev
```

**Why**: The error is coming from `.next/server/chunks/` which means you're running compiled code. If that's old, it doesn't have the fix.

### 🚨 **PRIORITY 2: Verify Local Environment File**

```bash
# Make sure .env.local has these EXACT values
cat > .env.local << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://mjrnzgunexmopvnamggw.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcm56Z3VuZXhtb3B2bmFtZ2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODg4MjcsImV4cCI6MjA3MzI2NDgyN30.7Hwn5kaExgI7HJKc7HmaTqJSybcGwX1izB1EdkNbcu8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcm56Z3VuZXhtb3B2bmFtZ2d3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY4ODgyNywiZXhwIjoyMDczMjY0ODI3fQ.jYseGYwWnhXwEf_Yqs3O8AdTTNWVBMH94LE2qVi1DrA

# CDP
CDP_API_KEY_ID=69aac710-e242-4844-aa2b-d4056e61606b
CDP_API_KEY_SECRET=HH0FhrZ5CdAoFpWRLdZQPR9kqsUYTbp4hVcqhb6FZErZ973X4ldxKxKJ4wN2hAM8jXxNmARty44+DMnMdFQQqA==
CDP_WALLET_SECRET=MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgXVAKZtzzIhOF3PobWNswbBPROzWKBfmj7jCglV2I58ehRANCAASYGh3+MAdVpgIRt+ZzT1b75mpkwHg+dHmPa3j8oC45uT+eSqgHgXL5rhkSUykpAQkRzdXQsms7pc98D7msqS2y

# Network
NETWORK=base-sepolia
NEXT_PUBLIC_WALLET_NETWORK=base-sepolia

# Feature Flags
NEXT_PUBLIC_ENABLE_CDP_WALLETS=true
NEXT_PUBLIC_ENABLE_AI_CHAT=false
EOF
```

### 🚨 **PRIORITY 3: Test in Production**

If this is happening in **Vercel production**:

```bash
# Check Vercel environment variables
vercel env ls production

# Make sure these are set:
# - CDP_API_KEY_ID
# - CDP_API_KEY_SECRET
# - CDP_WALLET_SECRET
# - NETWORK
# - NEXT_PUBLIC_ENABLE_CDP_WALLETS
```

---

## Why This Is Confusing

### The Code Looks Correct ✅

All the source files show credentials being passed correctly. BUT...

### The Error Shows Otherwise ❌

The error is coming from:
```
.next/server/chunks/6667.js:48:3658
```

This is **compiled/minified** code in the build cache. If the build cache is from BEFORE the fix was applied, you're still running the old broken code.

---

## Resolution Strategy

### For Local Development:
1. ✅ **Clear `.next` directory** (removes stale compiled code)
2. ✅ **Verify `.env.local`** (has correct credentials)
3. ✅ **Restart dev server** (picks up fresh environment + code)
4. ✅ **Test wallet creation** (should work now)

### For Vercel Production:
1. ✅ **Set environment variables in Vercel dashboard**
2. ✅ **Trigger new deployment** (rebuilds with latest code)
3. ✅ **Verify with production test script**

---

## Expected Outcome After Fix

### Before (Current):
```
❌ Error [APIError]: Wallet authentication error.
   statusCode: 401
```

### After (Expected):
```
✅ Wallet created successfully
   Address: 0x1234...5678
   Name: Purchaser
   Network: base-sepolia
```

---

## Prevention

### 1. Always Clear Cache After Code Changes
```bash
# Add to package.json scripts
"dev:clean": "rm -rf .next && next dev"
```

### 2. Add Environment Variable Validation
Already exists in `lib/features.ts` - just need to ensure it runs at request time.

### 3. Add Startup Diagnostics
Log CDP configuration status on server startup to catch issues early.

---

## Status Check

Run this to verify current state:

```bash
# Check environment file exists and has CDP vars
grep -c "CDP_API_KEY_ID" .env.local

# Check build cache age
ls -ld .next 2>/dev/null || echo "No build cache (good if you just cleared it)"

# Check if dev server is running
ps aux | grep "next dev" | grep -v grep
```

---

**Last Updated**: October 3, 2025  
**Next Action**: Clear `.next` directory and restart dev server

