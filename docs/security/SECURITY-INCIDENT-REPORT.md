# Security Incident Report

**Date**: October 6, 2025  
**Severity**: HIGH  
**Status**: Credentials Exposed - Immediate Action Required

---

## 🚨 Summary

Production credentials were accidentally committed to the git repository and pushed to remote `origin/main`.

**Affected Commit**: `28b156c` - "test: add CDP diagnostic endpoint to test initialization strategies in production"

---

## 📋 Exposed Credentials

### 1. CDP (Coinbase Developer Platform) Credentials
**Files**: 
- `UPDATE-VERCEL-CDP-CREDENTIALS.md`
- `docs/wallet/CDP-CREDENTIALS-MISMATCH.md`

**Exposed Data**:
- ❌ `CDP_API_KEY_ID`: `69aac710-e242-4844-aa2b-d4056e61606b`
- ❌ `CDP_API_KEY_SECRET`: Full secret key (base64 encoded)
- ❌ `CDP_WALLET_SECRET`: Full private key (PEM format)

**Risk**: Anyone with access to the repository can:
- Create/manage wallets on your CDP account
- Execute blockchain transactions
- Access wallet balances
- Potentially drain funds

---

### 2. Supabase Credentials (Partial Exposure)
**File**: `vercel-env-variables.txt` (gitignored - NOT in repository ✅)

**Status**: 
- ✅ NOT committed to git (properly gitignored)
- ⚠️ However, project ID is referenced in some docs: `mjrnzgunexmopvnamggw`

**Action**: Consider rotating Supabase keys as a precaution if repository is public.

---

## ✅ Immediate Actions Taken

1. **Sanitized Files**: Removed actual credentials from:
   - `UPDATE-VERCEL-CDP-CREDENTIALS.md`
   - `docs/wallet/CDP-CREDENTIALS-MISMATCH.md`

2. **Updated .gitignore**: Added patterns to prevent future credential leaks

3. **Ready to Commit**: Safe versions are staged for commit

---

## 🔴 CRITICAL: Actions You Must Take NOW

### Step 1: Rotate CDP Credentials (URGENT - Do This First!)

1. **Login to CDP Dashboard**:
   ```
   https://portal.cdp.coinbase.com/
   ```

2. **Revoke Compromised API Key**:
   - Navigate to API Keys section
   - Find API Key ID: `69aac710-e242-4844-aa2b-d4056e61606b`
   - Click "Revoke" or "Delete"
   - Confirm deletion

3. **Generate New API Key**:
   - Click "Create API Key"
   - Save the new credentials securely (NOT in git!)
   - Download the JSON file to a secure location

4. **Update Vercel Environment Variables**:
   ```
   Go to: Vercel Dashboard → Settings → Environment Variables
   
   Update (for Production, Preview, and Development):
   - CDP_API_KEY_ID → [new value]
   - CDP_API_KEY_SECRET → [new value]
   - CDP_WALLET_SECRET → [new value from CDP dashboard]
   ```

5. **Trigger Vercel Redeploy**:
   ```bash
   git commit --allow-empty -m "chore: redeploy with rotated credentials"
   git push origin main
   ```

---

### Step 2: Audit Wallet Activity

Check for unauthorized transactions:

1. **Review CDP Dashboard**:
   - Check for unexpected wallet creations
   - Review transaction history
   - Look for unusual API activity

2. **Check Blockchain Explorers**:
   - Visit: https://sepolia.basescan.org/
   - Search for your wallet addresses
   - Verify all transactions are legitimate

3. **If Suspicious Activity Found**:
   - Immediately transfer any funds to new wallets
   - Contact Coinbase CDP support
   - Document all unauthorized transactions

---

### Step 3: Rotate Supabase Keys (Recommended)

Even though Supabase credentials weren't committed, project ID was referenced:

1. **Login to Supabase**:
   ```
   https://supabase.com/dashboard/project/mjrnzgunexmopvnamggw/settings/api
   ```

2. **Click "Reset API Keys"**:
   - This generates new anon and service role keys
   - Old keys are immediately invalidated

3. **Update Vercel Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY → [new anon key]
   SUPABASE_SERVICE_ROLE_KEY → [new service role key]
   ```

4. **Update Local Environment**:
   ```bash
   # Update your local .env.local file
   # DO NOT commit this file!
   ```

---

### Step 4: Commit the Sanitized Files

```bash
cd /Users/garrettair/Documents/vercel-supabase-web3

# Review changes
git diff

# Commit sanitized versions
git add .gitignore UPDATE-VERCEL-CDP-CREDENTIALS.md docs/wallet/CDP-CREDENTIALS-MISMATCH.md
git commit -m "security: remove exposed credentials from documentation

BREAKING: All CDP credentials have been removed from docs
ACTION REQUIRED: Rotate all CDP API keys immediately
See SECURITY-INCIDENT-REPORT.md for details"

# Push to remote
git push origin main
```

---

### Step 5: Consider Git History Cleanup (Optional but Recommended)

The old credentials are still in git history (commit `28b156c`). Options:

#### Option A: BFG Repo-Cleaner (Recommended)
```bash
# Install BFG
brew install bfg  # macOS
# or download from: https://rtyley.github.io/bfg-repo-cleaner/

# Clone a fresh copy
cd /tmp
git clone --mirror https://github.com/[your-username]/[your-repo].git

# Remove sensitive data
bfg --replace-text <(echo '69aac710-e242-4844-aa2b-d4056e61606b==[REDACTED]') [your-repo].git
bfg --replace-text <(echo 'HH0FhrZ5CdAoFpWRLdZQPR9k==[REDACTED]') [your-repo].git

# Push cleaned history
cd [your-repo].git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

#### Option B: git-filter-repo
```bash
# Install git-filter-repo
pip install git-filter-repo

# Create replacement file
cat > /tmp/replacements.txt <<EOF
69aac710-e242-4844-aa2b-d4056e61606b==[REDACTED]
HH0FhrZ5CdAoFpWRLdZQPR9k==[REDACTED]
MIGHAgEAMBMGByqGSM49AgEG==[REDACTED]
EOF

# Clean history
git filter-repo --replace-text /tmp/replacements.txt

# Force push
git push --force
```

⚠️ **Warning**: Force pushing rewrites history and affects all collaborators!

---

## 📊 Timeline

| Time | Event |
|------|-------|
| Unknown | Credentials added to `UPDATE-VERCEL-CDP-CREDENTIALS.md` |
| Unknown | Commit `28b156c` created with credentials |
| Unknown | Pushed to `origin/main` |
| Oct 6, 2025 | Credentials discovered during security audit |
| Oct 6, 2025 | Files sanitized and this report created |

---

## 🔒 Prevention Measures Implemented

1. **Updated .gitignore**:
   - Added patterns for credential documentation files
   - Added `*-CREDENTIALS-*.local.md` pattern

2. **Documentation Template**:
   - `env-example.txt` uses placeholders (correct approach)
   - All credential docs should follow this pattern

3. **Best Practices Going Forward**:
   - ✅ Use `vercel-env-variables.txt` locally (gitignored)
   - ✅ Only commit placeholder templates
   - ✅ Add pre-commit hooks to scan for credentials
   - ✅ Use tools like `git-secrets` or `truffleHog`

---

## 🎯 Checklist

### Immediate (Do Today)
- [ ] Revoke CDP API Key `69aac710-...` 
- [ ] Generate new CDP credentials
- [ ] Update Vercel environment variables (Production)
- [ ] Update Vercel environment variables (Preview)
- [ ] Update Vercel environment variables (Development)
- [ ] Redeploy Vercel application
- [ ] Test wallet creation with new credentials
- [ ] Audit CDP dashboard for unauthorized activity
- [ ] Check blockchain explorer for suspicious transactions

### This Week
- [ ] Rotate Supabase API keys
- [ ] Update local `.env.local` with new credentials
- [ ] Commit sanitized documentation files
- [ ] Consider cleaning git history (BFG or filter-repo)
- [ ] Set up pre-commit hooks for credential scanning
- [ ] Review all team members with repository access

### Long-term
- [ ] Implement automated secret scanning in CI/CD
- [ ] Set up credential rotation schedule (quarterly)
- [ ] Add security awareness training for team
- [ ] Document incident in security playbook

---

## 📞 Support Resources

- **CDP Support**: https://www.coinbase.com/cloud/products/developer-platform
- **Supabase Support**: https://supabase.com/docs/guides/platform
- **Git History Cleaning**: https://rtyley.github.io/bfg-repo-cleaner/

---

## 📝 Lessons Learned

1. **Never commit actual credentials** - even in documentation
2. **Use placeholders** in all committed files
3. **Gitignore is not enough** - human error can bypass it
4. **Automate secret scanning** to catch mistakes early
5. **Rotate credentials regularly** as a security best practice

---

**Report Created**: October 6, 2025  
**Last Updated**: October 6, 2025  
**Next Review**: After credential rotation is complete

