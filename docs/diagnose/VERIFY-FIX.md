# Quick Fix Verification Guide

Run these commands to verify the wallet creation fix works.

---

## Prerequisites

```bash
# Ensure you're in the project directory
cd /Users/garrettair/Documents/vercel-supabase-web3

# Verify environment variables are set
grep -E "^CDP_" .env.local
```

Expected output:
```
CDP_API_KEY_ID=69aac710-e242-4844-aa2b-d4056e61606b
CDP_API_KEY_SECRET=HH0FhrZ5CdAoFpWRLdZQPR9kqsUYTbp4hVcqhb6FZErZ973X4ldxKxKJ4wN2hAM8jXxNmARty44+DMnMdFQQqA==
CDP_WALLET_SECRET=MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgXVAKZtzzIhOF3PobWNswbBPROzWKBfmj7jCglV2I58ehRANCAASYGh3+MAdVpgIRt+ZzT1b75mpkwHg+dHmPa3j8oC45uT+eSqgHgXL5rhkSUykpAQkRzdXQsms7pc98D7msqS2y
```

---

## Step 1: Build Verification (30 seconds)

```bash
npm run build
```

**Expected**: ✅ Build succeeds with no errors

**Red flags**: 
- ❌ TypeScript errors mentioning CdpClient
- ❌ Build fails

---

## Step 2: Start Development Server (5 seconds)

```bash
npm run dev
```

**Expected**: Server starts on http://localhost:3000

**Keep this running in this terminal!**

---

## Step 3: Manual Wallet Creation Test (2 minutes)

Open a new terminal and test the API directly:

```bash
# First, get a session token by logging in
# You'll need to do this in the browser first:
# 1. Go to http://localhost:3000/auth/login
# 2. Sign in with your test account
# 3. Open browser dev tools → Application → Cookies
# 4. Copy the value of the cookie named like "sb-*-auth-token"
# 5. Use it in the commands below

# Test wallet creation
curl -X POST http://localhost:3000/api/wallet/create \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie-here" \
  -d '{
    "name": "TestWallet",
    "type": "custom"
  }'
```

**Expected Success Response**:
```json
{
  "address": "0x...",
  "name": "TestWallet",
  "wallet_id": "uuid-here",
  "type": "custom"
}
```

**Previous Error (should NOT see)**:
```json
{
  "error": "Failed to create wallet",
  "details": "Wallet authentication error."
}
```

---

## Step 4: Browser Test (3 minutes)

1. **Navigate to wallet page**
   ```
   http://localhost:3000/wallet
   ```

2. **Sign in if needed**
   ```
   http://localhost:3000/auth/login
   ```

3. **Try to create a wallet**
   - Click "Create Wallet" or similar button
   - Select wallet type (Purchaser, Seller, or Custom)
   - Submit the form

4. **Verify success**
   - ✅ No 401 error in browser console
   - ✅ Wallet address displayed
   - ✅ Success message shown
   - ✅ Wallet appears in list

5. **Check browser console** (F12 → Console)
   - ✅ No red errors
   - ✅ No "Wallet authentication error"
   - ✅ No "401 Unauthorized"

---

## Step 5: Database Verification (1 minute)

Check that the wallet was saved to Supabase:

1. Go to your Supabase Dashboard
2. Navigate to **Table Editor** → `user_wallets`
3. Look for your newly created wallet
4. Verify fields:
   - `wallet_address` starts with `0x`
   - `wallet_name` matches what you entered
   - `network` is `base-sepolia`
   - `user_id` matches your user

---

## Step 6: Run E2E Tests (2 minutes)

```bash
# In a new terminal (keep dev server running)
node scripts/testing/test-production-e2e-flow.js
```

**Expected**: Look for these test results:

```
✓ CDP SDK Initialization
✓ CDP Wallet Integration
✓ Testnet Faucet Funding
✓ Send Transaction
```

**Previous Failure (should NOT see)**:
```
✗ CDP Wallet Integration
  Error: Wallet authentication error.
```

---

## Step 7: Check Server Logs (ongoing)

In your dev server terminal, watch for:

**Good signs** ✅:
```
POST /api/wallet/create 201 in 1234ms
```

**Bad signs** ❌:
```
POST /api/wallet/create 500 in 123ms
Wallet creation error: Error [APIError]: Wallet authentication error.
```

---

## Troubleshooting

### Issue: Still getting 401 errors

**Check 1**: Environment variables loaded?
```bash
# Restart dev server to pick up .env.local changes
# Press Ctrl+C in dev server terminal, then:
npm run dev
```

**Check 2**: Variables actually present?
```bash
node -e "console.log(require('dotenv').config({ path: '.env.local' }))"
```

**Check 3**: Check file was saved correctly
```bash
cat .env.local | grep CDP_
```

### Issue: TypeScript errors

```bash
# Check for type errors
npx tsc --noEmit
```

### Issue: Build fails

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Issue: Can't access wallet page

**Check**: Are you logged in?
```
Go to: http://localhost:3000/auth/login
```

---

## Success Criteria Checklist

- [x] Build completes successfully
- [ ] Dev server starts without errors
- [ ] Wallet creation returns 201 status
- [ ] Wallet address returned in response
- [ ] No 401 errors in console
- [ ] Wallet saved to database
- [ ] E2E tests pass
- [ ] No "Wallet authentication error" messages

**If all checkboxes pass**: ✅ Fix verified successful!

**If any fail**: See troubleshooting section or review diagnosis docs.

---

## Quick Commands Reference

```bash
# Build check
npm run build

# Start dev server
npm run dev

# Run E2E tests
node scripts/testing/test-production-e2e-flow.js

# Check environment
grep CDP_ .env.local

# View recent changes
git diff HEAD

# Clear cache if needed
rm -rf .next && npm run dev
```

---

## What Changed vs. Previous Behavior

| Before | After |
|--------|-------|
| `new CdpClient()` | `new CdpClient({ apiKeyId, apiKeySecret, walletSecret })` |
| 401 Wallet authentication error | ✅ 201 Wallet created successfully |
| No wallet address returned | ✅ Wallet address: 0x... |
| Database record not created | ✅ Wallet saved to user_wallets table |

---

## Next Steps After Verification

1. **Commit changes**
   ```bash
   git add .
   git commit -m "fix: Pass CDP credentials explicitly to CdpClient constructor"
   ```

2. **Push to repository**
   ```bash
   git push
   ```

3. **Deploy to production**
   - Vercel will auto-deploy from main branch
   - Verify environment variables are set in Vercel dashboard
   - Test wallet creation in production

4. **Monitor**
   - Watch for any 401 errors in production logs
   - Verify users can create wallets successfully

---

## Time Estimates

- **Build verification**: 30 seconds
- **Manual browser test**: 3 minutes
- **Database check**: 1 minute  
- **E2E tests**: 2 minutes
- **Total**: ~7 minutes

---

## Support

If verification fails:
1. Review [`wallet-creation-failure-diagnosis.md`](./wallet-creation-failure-diagnosis.md)
2. Check [`fix-summary.md`](./fix-summary.md)
3. Ensure all 5 files were updated correctly
4. Verify environment variables are present
5. Check Supabase connection is working

---

**Last Updated**: October 3, 2025  
**Fix Version**: Initial implementation  
**Status**: Ready for verification ✅


