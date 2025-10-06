# Production Deployment Steps (No Credentials in Git!)

**Date**: October 3, 2025  
**Status**: Safe deployment guide without exposing credentials

---

## 🚨 IMPORTANT: Never Commit Credentials to Git!

All sensitive credentials should ONLY be set in:
- ✅ Vercel Dashboard (Environment Variables)
- ✅ Local `.env.local` file (gitignored)
- ❌ **NEVER in code or documentation that gets committed!**

---

## Quick Deployment to Production

### Step 1: Set Environment Variables in Vercel Dashboard

1. Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

2. Add these variables for **Production** environment:

**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL` = (your prod Supabase URL)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` = (your prod anon key)
- `SUPABASE_SERVICE_ROLE_KEY` = (your prod service role key)

**CDP (from your `vercel-env-variables.txt`):**
- `CDP_API_KEY_ID` = (your CDP API key ID)
- `CDP_API_KEY_SECRET` = (your CDP API secret)
- `CDP_WALLET_SECRET` = (your CDP wallet secret)

**Configuration:**
- `NETWORK` = `base-sepolia`
- `NEXT_PUBLIC_WALLET_NETWORK` = `base-sepolia`
- `NEXT_PUBLIC_ENABLE_CDP_WALLETS` = `true`

### Step 2: Trigger Deployment

The code is already deployed! Vercel auto-deploys on git push.

Just make sure the environment variables above are set in Vercel Dashboard.

### Step 3: Verify

After environment variables are set, visit:

```
https://your-domain.vercel.app/api/debug/check-cdp-env
```

**Expected Response:**
```json
{
  "cdp_configured": true,
  "has_api_key_id": true,
  "has_api_key_secret": true,
  "has_wallet_secret": true,
  "api_key_id_length": 36,
  "network": "base-sepolia",
  "wallet_enabled": "true"
}
```

### Step 4: Test Wallet Creation

1. Go to `https://your-domain.vercel.app/protected/profile`
2. Sign in
3. Click "Create Wallet"
4. Should work without 401 error! ✅

---

## What Was Fixed

### The Code Changes (Already Deployed):

All CDP client initializations now pass credentials explicitly:

```typescript
// app/api/wallet/create/route.ts (and 3 other files)
function getCdpClient(): CdpClient {
  return new CdpClient({
    apiKeyId: env.CDP_API_KEY_ID!,
    apiKeySecret: env.CDP_API_KEY_SECRET!,
    walletSecret: env.CDP_WALLET_SECRET!,
  });
}
```

**Files updated:**
- ✅ `app/api/wallet/create/route.ts`
- ✅ `app/api/wallet/fund/route.ts`
- ✅ `app/api/wallet/transfer/route.ts`
- ✅ `lib/accounts.ts`

### What You Need to Do:

**ONLY set environment variables in Vercel Dashboard!**

The code fix is already deployed. You just need to ensure Vercel has the credentials configured.

---

## Troubleshooting

### Still getting 401 error?

1. **Check Vercel Environment Variables**:
   - Go to Vercel Dashboard
   - Verify all CDP variables are set for **Production**
   - Make sure there are no typos

2. **Force Redeploy**:
   - In Vercel Dashboard, find your deployment
   - Click "..." → "Redeploy"
   - This will pick up the environment variables

3. **Check the debug endpoint**:
   - Visit `/api/debug/check-cdp-env`
   - If `cdp_configured: false`, environment variables aren't set correctly

---

## Summary

✅ **Code is fixed and deployed**  
✅ **Debug endpoint added** (`/api/debug/check-cdp-env`)  
✅ **No credentials in git** (security safe)  
⚠️ **You need to set environment variables in Vercel Dashboard**

**Next Step**: Go to Vercel Dashboard → Environment Variables → Set CDP credentials → Redeploy if needed

---

**Reference**: Keep your credentials in `vercel-env-variables.txt` locally (this file is gitignored)


