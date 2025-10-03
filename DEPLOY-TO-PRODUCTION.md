# Deploy CDP Wallets to Production Vercel 🚀

**Date**: October 3, 2025  
**Target**: Production Vercel + Production Supabase (mjrnzgunexmopvnamggw)

---

## Quick Deploy Steps

### Step 1: Set Environment Variables in Vercel ⚙️

Go to your Vercel dashboard and add these environment variables:

**🔗 Vercel Dashboard URL:**
```
https://vercel.com/[your-team]/[your-project]/settings/environment-variables
```

**Required Variables for PRODUCTION Environment:**

```bash
# Supabase Production (mjrnzgunexmopvnamggw)
NEXT_PUBLIC_SUPABASE_URL=https://mjrnzgunexmopvnamggw.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcm56Z3VuZXhtb3B2bmFtZ2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODg4MjcsImV4cCI6MjA3MzI2NDgyN30.7Hwn5kaExgI7HJKc7HmaTqJSybcGwX1izB1EdkNbcu8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcm56Z3VuZXhtb3B2bmFtZ2d3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY4ODgyNywiZXhwIjoyMDczMjY0ODI3fQ.jYseGYwWnhXwEf_Yqs3O8AdTTNWVBMH94LE2qVi1DrA

# CDP Production Credentials (TESTED AND WORKING ✅)
CDP_API_KEY_ID=69aac710-e242-4844-aa2b-d4056e61606b
CDP_API_KEY_SECRET=HH0FhrZ5CdAoFpWRLdZQPR9kqsUYTbp4hVcqhb6FZErZ973X4ldxKxKJ4wN2hAM8jXxNmARty44+DMnMdFQQqA==
CDP_WALLET_SECRET=MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgXVAKZtzzIhOF3PobWNswbBPROzWKBfmj7jCglV2I58ehRANCAASYGh3+MAdVpgIRt+ZzT1b75mpkwHg+dHmPa3j8oC45uT+eSqgHgXL5rhkSUykpAQkRzdXQsms7pc98D7msqS2y

# Network Configuration
NETWORK=base-sepolia
NEXT_PUBLIC_WALLET_NETWORK=base-sepolia

# Feature Flags - ENABLE CDP WALLETS
NEXT_PUBLIC_ENABLE_CDP_WALLETS=true
NEXT_PUBLIC_ENABLE_AI_CHAT=false
NEXT_PUBLIC_ENABLE_WEB3_AUTH=false
```

**⚠️ IMPORTANT**: Set these for **Production** environment (not just Preview/Development)

---

### Step 2: Deploy to Production 🚀

#### Option A: Using Vercel CLI (Fastest)

```bash
# Deploy current code to production
vercel --prod

# This will:
# ✅ Use latest code (with credentials fix)
# ✅ Pick up environment variables from dashboard
# ✅ Clear any old build cache
# ✅ Deploy to production domain
```

#### Option B: Push to Git (Triggers Auto-Deploy)

```bash
# Commit any pending changes
git add -A
git commit -m "Fix: CDP wallet creation with credentials"
git push origin main

# Vercel will automatically deploy
# Check deployment status: https://vercel.com/[your-team]/[your-project]
```

#### Option C: Manual Redeploy in Dashboard

1. Go to: https://vercel.com/[your-team]/[your-project]
2. Find latest deployment
3. Click "..." menu → "Redeploy"
4. Check ✅ "Use existing Build Cache" = OFF (force fresh build)
5. Click "Redeploy"

---

### Step 3: Verify Production Deployment ✅

#### Check #1: Environment Variables Loaded

Add this API route temporarily to verify env vars are loaded:

**File**: `app/api/debug/check-cdp-env/route.ts`

```typescript
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { isCDPConfigured } from "@/lib/features";

export async function GET() {
  return NextResponse.json({
    cdp_configured: isCDPConfigured(),
    has_api_key_id: !!env.CDP_API_KEY_ID,
    has_api_key_secret: !!env.CDP_API_KEY_SECRET,
    has_wallet_secret: !!env.CDP_WALLET_SECRET,
    api_key_id_length: env.CDP_API_KEY_ID?.length || 0,
    api_key_id_preview: env.CDP_API_KEY_ID?.substring(0, 8) || 'missing',
    network: env.NETWORK,
    wallet_enabled: env.NEXT_PUBLIC_ENABLE_CDP_WALLETS,
  });
}
```

Then visit: `https://your-domain.vercel.app/api/debug/check-cdp-env`

**Expected Response:**
```json
{
  "cdp_configured": true,
  "has_api_key_id": true,
  "has_api_key_secret": true,
  "has_wallet_secret": true,
  "api_key_id_length": 36,
  "api_key_id_preview": "69aac710",
  "network": "base-sepolia",
  "wallet_enabled": "true"
}
```

#### Check #2: Test Wallet Creation

Run the production test script:

```bash
node scripts/testing/test-production-wallet-creation.js
```

Or manually:
1. Go to: `https://your-domain.vercel.app`
2. Sign in with existing account
3. Navigate to `/protected/profile`
4. Click "Create Wallet"
5. Should see: ✅ "Wallet created successfully"
6. Should NOT see: ❌ "401 Wallet authentication error"

---

## Troubleshooting Production Issues

### Issue #1: "CDP not configured" error

**Symptom**: API returns `503 Service Unavailable` with message "CDP not configured"

**Cause**: Environment variables not set in Vercel or not set for Production environment

**Fix**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Make sure variables are checked for ✅ **Production** environment
3. Redeploy

### Issue #2: Still getting 401 error

**Symptom**: Same 401 authentication error in production

**Possible Causes**:

#### A. Old deployment still cached
```bash
# Force fresh deployment
vercel --prod --force
```

#### B. Environment variables not picked up
```bash
# Check what's actually deployed
vercel env pull .env.production
cat .env.production | grep CDP_
```

#### C. Different API keys needed for production
- Verify CDP API keys are active in dashboard
- Check they have production permissions
- https://portal.cdp.coinbase.com/

### Issue #3: Works locally but not in production

**Diagnosis Steps**:

1. **Check Vercel Function Logs**:
   - Go to: https://vercel.com/[your-team]/[your-project]/logs
   - Look for errors in `/api/wallet/create` function
   - Check if environment variables are undefined

2. **Compare Environments**:
   ```bash
   # Local env
   grep CDP_ .env.local
   
   # Production env (from Vercel)
   vercel env pull .env.production
   grep CDP_ .env.production
   ```

3. **Test CDP Credentials Directly**:
   - Create temporary API route that tests CDP init
   - Deploy and hit that endpoint
   - Check if credentials work on Vercel's infrastructure

---

## CLI Commands Reference

### Set Environment Variables via CLI

If you prefer using CLI instead of dashboard:

```bash
# Set production environment variables
vercel env add CDP_API_KEY_ID production
# (paste value when prompted)

vercel env add CDP_API_KEY_SECRET production
# (paste value when prompted)

vercel env add CDP_WALLET_SECRET production
# (paste value when prompted)

vercel env add NETWORK production
# Enter: base-sepolia

vercel env add NEXT_PUBLIC_ENABLE_CDP_WALLETS production
# Enter: true

# Deploy after setting vars
vercel --prod
```

### Check Current Environment

```bash
# List all production env vars
vercel env ls production

# Pull production env to file
vercel env pull .env.production

# View what's actually set
cat .env.production
```

### Force Clean Deployment

```bash
# Clear cache and redeploy
vercel --prod --force

# Or delete .vercel cache first
rm -rf .vercel
vercel --prod
```

---

## Expected Production URLs

After deployment, test these endpoints:

### Main App
```
https://your-domain.vercel.app
```

### Protected Profile (with wallet)
```
https://your-domain.vercel.app/protected/profile
```

### API Endpoints
```
POST https://your-domain.vercel.app/api/wallet/create
POST https://your-domain.vercel.app/api/wallet/fund
POST https://your-domain.vercel.app/api/wallet/transfer
GET  https://your-domain.vercel.app/api/wallet/list
```

### Debug Endpoint (temporary)
```
GET https://your-domain.vercel.app/api/debug/check-cdp-env
```

---

## Verification Checklist

Before considering deployment complete:

- [ ] Environment variables set in Vercel dashboard (Production)
- [ ] `CDP_API_KEY_ID` set correctly
- [ ] `CDP_API_KEY_SECRET` set correctly  
- [ ] `CDP_WALLET_SECRET` set correctly
- [ ] `NEXT_PUBLIC_ENABLE_CDP_WALLETS=true` set
- [ ] `NETWORK=base-sepolia` set
- [ ] Supabase credentials set (URL, anon key, service role key)
- [ ] Fresh deployment triggered (not using old cache)
- [ ] Debug endpoint shows all vars loaded correctly
- [ ] Can create wallet in production without 401 error
- [ ] Wallet appears in Supabase `user_wallets` table
- [ ] Transaction logged in `wallet_transactions` table

---

## Quick Reference: Copy-Paste for Vercel Dashboard

When adding environment variables in Vercel dashboard, copy these blocks:

### Block 1: Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://mjrnzgunexmopvnamggw.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcm56Z3VuZXhtb3B2bmFtZ2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODg4MjcsImV4cCI6MjA3MzI2NDgyN30.7Hwn5kaExgI7HJKc7HmaTqJSybcGwX1izB1EdkNbcu8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcm56Z3VuZXhtb3B2bmFtZ2d3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY4ODgyNywiZXhwIjoyMDczMjY0ODI3fQ.jYseGYwWnhXwEf_Yqs3O8AdTTNWVBMH94LE2qVi1DrA
```

### Block 2: CDP (Credentials tested and working ✅)
```
CDP_API_KEY_ID=69aac710-e242-4844-aa2b-d4056e61606b
CDP_API_KEY_SECRET=HH0FhrZ5CdAoFpWRLdZQPR9kqsUYTbp4hVcqhb6FZErZ973X4ldxKxKJ4wN2hAM8jXxNmARty44+DMnMdFQQqA==
CDP_WALLET_SECRET=MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgXVAKZtzzIhOF3PobWNswbBPROzWKBfmj7jCglV2I58ehRANCAASYGh3+MAdVpgIRt+ZzT1b75mpkwHg+dHmPa3j8oC45uT+eSqgHgXL5rhkSUykpAQkRzdXQsms7pc98D7msqS2y
```

### Block 3: Configuration
```
NETWORK=base-sepolia
NEXT_PUBLIC_WALLET_NETWORK=base-sepolia
NEXT_PUBLIC_ENABLE_CDP_WALLETS=true
```

---

## What Happens After Deployment

1. **Vercel builds your app** with latest code (credentials fix applied)
2. **Environment variables** are injected at runtime
3. **CDP client** gets initialized with correct credentials
4. **Wallet creation** calls CDP API with valid auth
5. **Success!** Wallets are created and stored in Supabase

---

## Need Help?

### Check Deployment Status
```
vercel ls
```

### View Recent Logs
```
vercel logs [deployment-url]
```

### Get Project Info
```
vercel project ls
vercel inspect
```

---

**Ready to Deploy?** 

```bash
vercel --prod
```

🚀 **Your production wallet creation will work after this deployment!**

