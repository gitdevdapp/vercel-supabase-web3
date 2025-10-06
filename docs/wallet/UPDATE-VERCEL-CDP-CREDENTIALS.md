# Update Vercel CDP Credentials

## 🔍 The Problem

Vercel production has OLD CDP credentials (`b8e00d85...`) instead of the NEW working ones (`69aac710...`).

## Possible Causes

1. **Environment variables were set for Preview/Development but not Production**
2. **Someone/something overwrote them** (team member, script, etc.)
3. **You're looking at a different Vercel project** (check project name!)
4. **Vercel imported old values** from a previous deployment

## ✅ Solution: Update the Credentials

### Step 1: Verify Which Project You're Looking At

Run:
```bash
vercel project ls
```

Make sure you're updating the RIGHT project!

### Step 2: Update Production Environment Variables

Go to Vercel Dashboard:
```
https://vercel.com/[your-team]/[your-project]/settings/environment-variables
```

**Find and UPDATE these variables for PRODUCTION:**

1. **CDP_API_KEY_ID**
   - Current (OLD): `b8e00d85-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - Update to (NEW): `69aac710-e242-4844-aa2b-d4056e61606b`

2. **CDP_API_KEY_SECRET**
   - Update to: `HH0FhrZ5CdAoFpWRLdZQPR9kqsUYTbp4hVcqhb6FZErZ973X4ldxKxKJ4wN2hAM8jXxNmARty44+DMnMdFQQqA==`

3. **CDP_WALLET_SECRET**
   - Update to: `MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgXVAKZtzzIhOF3PobWNswbBPROzWKBfmj7jCglV2I58ehRANCAASYGh3+MAdVpgIRt+ZzT1b75mpkwHg+dHmPa3j8oC45uT+eSqgHgXL5rhkSUykpAQkRzdXQsms7pc98D7msqS2y`

**IMPORTANT:** Make sure you're editing the **Production** environment, not Preview/Development!

### Step 3: Trigger Redeploy

After updating, you MUST redeploy:

#### Option A: Empty Commit
```bash
git commit --allow-empty -m "chore: redeploy with updated CDP credentials"
git push origin main
```

#### Option B: Vercel Dashboard
1. Go to Deployments
2. Click latest deployment "..." menu
3. Click "Redeploy"
4. ✅ Confirm

### Step 4: Verify

After redeploy completes, check:
```
https://your-domain.vercel.app/api/debug/check-cdp-env
```

Should now show:
```json
{
  "api_key_id_preview": "69aac710",  // ✅ NEW credentials
  "cdp_configured": true
}
```

### Step 5: Test Wallet Creation

1. Go to `/protected/profile`
2. Click "Create Wallet"
3. Should work! ✅

---

## 🔒 Prevent This From Happening Again

### Check Who Has Access

In Vercel Dashboard → Settings → Members:
- See who has access to change environment variables
- Remove anyone who shouldn't have access

### Enable Vercel Audit Log

Vercel Pro+ plans have audit logs that show who changed what and when.

### Document the Working Credentials

Keep `vercel-env-variables.txt` as the source of truth:
- These are the WORKING credentials (tested locally)
- If Vercel credentials differ, Vercel is WRONG
- Update Vercel to match this file

---

## Quick Reference: Working Credentials

```
CDP_API_KEY_ID=69aac710-e242-4844-aa2b-d4056e61606b
CDP_API_KEY_SECRET=HH0FhrZ5CdAoFpWRLdZQPR9kqsUYTbp4hVcqhb6FZErZ973X4ldxKxKJ4wN2hAM8jXxNmARty44+DMnMdFQQqA==
CDP_WALLET_SECRET=MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgXVAKZtzzIhOF3PobWNswbBPROzWKBfmj7jCglV2I58ehRANCAASYGh3+MAdVpgIRt+ZzT1b75mpkwHg+dHmPa3j8oC45uT+eSqgHgXL5rhkSUykpAQkRzdXQsms7pc98D7msqS2y
```

These credentials were tested and successfully created wallet: `0x84d998c9e08855e61003C57B1aaE528E63cd704d`


