# Force Redeploy to Production

## The Issue
- ✅ Code fix is deployed (credentials passed to CdpClient)
- ✅ Environment variables are set in Vercel
- ❌ Still getting 401 error

## Why?
**Vercel needs to redeploy to pick up the environment variables!**

If you added/updated environment variables AFTER the last deployment, Vercel is still running the old deployment without those variables.

## Solution: Force Redeploy

### Option 1: Empty Commit (Triggers Auto-Deploy)

```bash
git commit --allow-empty -m "chore: trigger redeploy for CDP env vars"
git push origin main
```

This will trigger Vercel to rebuild and deploy with the latest environment variables.

### Option 2: Redeploy from Vercel Dashboard

1. Go to: https://vercel.com/[your-team]/[your-project]
2. Click on "Deployments" tab
3. Find the latest production deployment
4. Click the "..." menu → "Redeploy"
5. ⚠️ **UNCHECK** "Use existing Build Cache"
6. Click "Redeploy"

### Option 3: Vercel CLI (if logged in)

```bash
vercel login
vercel --prod --force
```

## After Redeploying

### Test 1: Check Environment Variables
Visit: `https://your-domain.vercel.app/api/debug/check-cdp-env`

Should return:
```json
{
  "cdp_configured": true,
  "has_api_key_id": true,
  "has_api_key_secret": true,
  "has_wallet_secret": true,
  "api_key_id_length": 36,
  "api_key_id_preview": "69aac710",
  "wallet_enabled": "true"
}
```

### Test 2: Create Wallet
1. Go to `/protected/profile`
2. Sign in
3. Click "Create Wallet"
4. Should work! ✅

## Still Not Working?

Check these in Vercel Dashboard → Settings → Environment Variables:

Make sure these are set for **Production** (not just Preview):
- ✅ CDP_API_KEY_ID
- ✅ CDP_API_KEY_SECRET  
- ✅ CDP_WALLET_SECRET
- ✅ NEXT_PUBLIC_ENABLE_CDP_WALLETS = true
- ✅ NETWORK = base-sepolia


