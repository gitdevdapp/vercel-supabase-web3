# CDP Credentials Mismatch Issue

**Date**: October 3, 2025  
**Issue**: Vercel production has different (old) CDP credentials than local working credentials

---

## 🔍 Discovery

### Local Working Credentials (Tested ✅)
```
CDP_API_KEY_ID starts with: 69aac710...
```
Successfully created wallet: `0x84d998c9e08855e61003C57B1aaE528E63cd704d`

### Vercel Production Credentials (Current ❌)
```json
{
  "api_key_id_preview": "b8e00d85",
  "cdp_configured": true
}
```
API Key ID starts with: `b8e00d85...` (DIFFERENT!)

---

## ❓ How Did This Happen?

Environment variables in Vercel don't revert automatically. Possible explanations:

### 1. **Wrong Environment Selected**
- Credentials were updated for **Preview/Development** but not **Production**
- Check: Vercel Dashboard → Environment Variables → filter by "Production"

### 2. **Team Member Made Changes**
- Someone with access reverted the credentials
- Check: Vercel Dashboard → Settings → Members
- Check: Audit logs (if on Pro+ plan)

### 3. **Multiple Vercel Projects**
- You might be looking at a different project than what's deployed
- Check: Run `vercel project ls` to see linked project

### 4. **Vercel CLI Script Overwrote Them**
- If you ran a deployment script, it might have set old values
- Check: Any `.sh` or `.js` scripts that call `vercel env`

### 5. **Environment Variable Import**
- Vercel can import env vars from files
- Old values might have been imported from somewhere

---

## ✅ The Fix

### Step 1: Go to Vercel Dashboard

Navigate to:
```
Settings → Environment Variables
```

### Step 2: Filter by Production

Make sure you're looking at **Production** environment variables, not Preview/Development.

### Step 3: Update These 3 Variables

**Find and EDIT (don't delete and re-add):**

1. `CDP_API_KEY_ID`
   - Change from: `b8e00d85-...` (old)
   - Change to: `69aac710-e242-4844-aa2b-d4056e61606b` (new)

2. `CDP_API_KEY_SECRET`
   - Update to working value from `vercel-env-variables.txt`

3. `CDP_WALLET_SECRET`
   - Update to working value from `vercel-env-variables.txt`

### Step 4: Redeploy

After updating environment variables:

```bash
git commit --allow-empty -m "chore: redeploy after CDP credential update"
git push origin main
```

Or use Vercel Dashboard → Redeploy

### Step 5: Verify

```
GET /api/debug/check-cdp-env
```

Should now show:
```json
{
  "api_key_id_preview": "69aac710",  // ✅ Correct now!
  "cdp_configured": true,
  "has_api_key_id": true,
  "has_api_key_secret": true,
  "has_wallet_secret": true
}
```

### Step 6: Test Wallet Creation

Should work without 401 error! ✅

---

## 🔒 Prevention

### Document Your Credentials

- Keep `vercel-env-variables.txt` as source of truth
- Never commit it to git (it's gitignored)
- But keep it safe as reference

### Audit Access

- Review who has access to Vercel project
- Remove unnecessary team members
- Use principle of least privilege

### Use Vercel CLI for Consistency

Instead of manual dashboard updates, use CLI:

```bash
# Set production environment variable
vercel env add CDP_API_KEY_ID production

# View all production vars
vercel env ls production

# Pull current production values to file
vercel env pull .env.production.local
```

This creates an audit trail and is repeatable.

---

## 📊 Credential History

### Old Credentials (b8e00d85...)
- Status: ❌ Not working (401 errors)
- Last seen: October 3, 2025 in Vercel production
- Origin: Unknown (possibly from 2 weeks ago)

### New Credentials (69aac710...)
- Status: ✅ Working (tested successfully)
- Created: Recently in CDP dashboard
- Tested: October 3, 2025 - created wallet successfully
- Source: `vercel-env-variables.txt`

---

## 🎯 Action Items

- [ ] Update Vercel production environment variables to use `69aac710...` credentials
- [ ] Trigger redeploy
- [ ] Verify with `/api/debug/check-cdp-env`
- [ ] Test wallet creation
- [ ] Document why credentials changed
- [ ] Review Vercel access permissions

---

**Summary**: The working credentials (69aac710...) need to be set in Vercel production. The old credentials (b8e00d85...) somehow got restored and need to be replaced.


