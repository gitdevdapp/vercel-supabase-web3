# Production Test Steps - Wallet Creation Fix

**Date**: October 3, 2025  
**Status**: Code pushed, waiting for build

---

## Deployment Status

✅ **Commits Pushed to main**:
- `0ffb355` - Fix: Pass CDP credentials explicitly to CdpClient constructor
- `b7cbe6c` - Docs: Add comprehensive diagnosis documentation

🔄 **Vercel Build**: In progress...

---

## Manual Production Test Steps

### Step 1: Verify Build Completed

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Check deployment status
3. Wait for "Ready" status
4. Note the production URL (should be: `https://vercel-supabase-web3.vercel.app`)

### Step 2: Create Test Account with Mailinator

1. **Navigate to**: `https://vercel-supabase-web3.vercel.app/auth/sign-up`

2. **Use Mailinator email**:
   ```
   Email: walletfix-test-$(date +%s)@mailinator.com
   Password: TestWallet123!
   ```

3. **Sign up** and wait for confirmation email

4. **Check email**: 
   - Go to: `https://www.mailinator.com/v4/public/inboxes.jsp?to=walletfix-test-[timestamp]`
   - Click confirmation link
   - Should redirect to app

### Step 3: Create Wallet

1. **Sign in** at: `https://vercel-supabase-web3.vercel.app/auth/login`

2. **Navigate to wallet page**: `/wallet` or `/protected`

3. **Create a new wallet**:
   - Click "Create Wallet" button
   - Select type: "Custom" 
   - Name: "Production Test Wallet"
   - Submit

### Step 4: Verify Success

**Expected Success ✅**:
```json
{
  "address": "0x1234567890abcdef...",
  "name": "Production Test Wallet",
  "wallet_id": "uuid-here",
  "type": "custom"
}
```

**Previous Failure ❌ (should NOT see)**:
```json
{
  "error": "Failed to create wallet",
  "details": "Wallet authentication error."
}
```

### Step 5: Check Browser Console

Press F12 → Console tab

**Good signs ✅**:
- No red errors
- No "401 Unauthorized"
- No "Wallet authentication error"
- Wallet address displayed

**Bad signs ❌**:
- Red error messages
- 401 status codes
- "Wallet authentication error"

### Step 6: Verify in Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/[REDACTED-PROJECT-ID])
2. Navigate to **Table Editor** → `user_wallets`
3. Find your wallet by wallet_address
4. Verify:
   - `wallet_address` starts with `0x`
   - `wallet_name` matches what you entered
   - `network` is `base-sepolia`
   - `user_id` matches your user
   - `created_at` is recent

---

## Automated Test Script

Alternatively, run the automated test:

```bash
node scripts/testing/test-production-wallet-creation.js
```

**Note**: You'll need to manually click the confirmation link in the email.

---

## Environment Variables Check

Verify these are set in Vercel:

```bash
CDP_API_KEY_ID=[REDACTED-CDP-API-KEY-ID]
CDP_API_KEY_SECRET=[REDACTED-CDP-API-SECRET]
CDP_WALLET_SECRET=[REDACTED-CDP-WALLET-SECRET]
NETWORK=base-sepolia
NEXT_PUBLIC_WALLET_NETWORK=base-sepolia
NEXT_PUBLIC_ENABLE_CDP_WALLETS=true
```

Check in: Vercel Dashboard → Project Settings → Environment Variables

---

## Quick Test (Browser)

**Direct API Test via Browser Console**:

1. Sign in to: `https://vercel-supabase-web3.vercel.app/auth/login`

2. Open browser console (F12)

3. Run this code:

```javascript
// Test wallet creation
fetch('/api/wallet/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Console Test Wallet',
    type: 'custom'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Response:', data);
  if (data.address) {
    console.log('✅ SUCCESS! Wallet created:', data.address);
  } else {
    console.error('❌ FAILED:', data.error);
  }
});
```

---

## What Changed vs Before

| Before Fix | After Fix |
|------------|-----------|
| `new CdpClient()` | `new CdpClient({ apiKeyId, apiKeySecret, walletSecret })` |
| 401 authentication error | 201 wallet created |
| No wallet returned | Wallet address: 0x... |
| Failed API call | Successful API call |

---

## If Test Fails

### 1. Check Vercel Logs

```
Vercel Dashboard → Project → Deployments → [Latest] → Function Logs
```

Look for:
- CDP authentication errors
- Missing environment variables
- API call failures

### 2. Check Environment Variables

```
Vercel Dashboard → Settings → Environment Variables
```

Verify all CDP variables are present for **Production** environment.

### 3. Re-deploy if Needed

```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

### 4. Check Build Logs

Look for:
- Build failures
- TypeScript errors
- Missing dependencies

---

## Success Criteria

- [ ] Vercel build completed successfully
- [ ] Test account created with mailinator
- [ ] Email confirmed
- [ ] Signed in successfully
- [ ] Wallet creation returned 201 status
- [ ] Wallet address received
- [ ] No 401 errors in console
- [ ] Wallet saved to database
- [ ] Wallet visible in UI

**All checked?** → ✅ FIX CONFIRMED IN PRODUCTION!

---

## Timeline

- **Code pushed**: October 3, 2025
- **Build started**: ~2-3 minutes after push
- **Build completes**: ~2-5 minutes total
- **Testing**: ~5 minutes
- **Total**: ~10 minutes from push to verified

---

## Next Steps After Success

1. ✅ Mark issue as resolved
2. 📝 Update production verification docs
3. 🎉 Celebrate the fix
4. 📊 Monitor for any issues
5. 🔄 Clean up test accounts if needed

---

**Status**: Waiting for Vercel build to complete...

