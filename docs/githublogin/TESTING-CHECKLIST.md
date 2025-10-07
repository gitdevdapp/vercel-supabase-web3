# GitHub OAuth Testing Checklist - Production MJR

**Project:** DevDapp (devdapp.com)  
**Date:** October 6, 2025  
**Status:** 🧪 READY TO TEST

---

## 🎯 Quick Test Summary

After deploying the fix, run these 3 critical tests:

1. **Environment Variable Check** (30 seconds)
2. **GitHub OAuth Flow Test** (2 minutes)
3. **Log Verification** (1 minute)

---

## ✅ PRE-TEST CHECKLIST

Before testing, confirm:

- [ ] **Vercel Environment Variable Added**
  - Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables
  - Confirm: `NEXT_PUBLIC_APP_URL=https://devdapp.com` is present
  - Environments: Production, Preview, Development (all checked)
  - Click **"Save"** (if you see it in the screenshot above, click Save!)

- [ ] **Deployment Triggered**
  - Option A: Go to Deployments tab → Find latest → Click ⋮ → "Redeploy"
  - Option B: `git push origin main` (if you have code changes)
  - **CRITICAL:** Uncheck "Use existing Build Cache"

- [ ] **Deployment Completed**
  - Wait for build to finish (5-10 minutes)
  - Status should show: ✅ Ready
  - Click deployment → "Visit" to verify it's live

- [ ] **Supabase Configuration Verified**
  - Site URL: https://devdapp.com
  - Redirect URLs include both:
    - `https://devdapp.com/auth/callback`
    - `https://www.devdapp.com/auth/callback`

---

## 🧪 TEST 1: Environment Variable Verification

**Time:** 30 seconds  
**Purpose:** Confirm the environment variable deployed correctly

### Steps:

1. Open browser to: `https://devdapp.com`
2. Open DevTools (F12 or Right-click → Inspect)
3. Go to **Console** tab
4. Paste this command:

```javascript
console.log('Environment Check:', {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  origin: window.location.origin,
  match: process.env.NEXT_PUBLIC_APP_URL === 'https://devdapp.com'
});
```

### Expected Output:

```javascript
Environment Check: {
  NEXT_PUBLIC_APP_URL: "https://devdapp.com",
  origin: "https://devdapp.com",
  match: true
}
```

### ✅ Pass Criteria:
- `NEXT_PUBLIC_APP_URL` shows `"https://devdapp.com"`
- NOT `undefined`
- NOT `null`

### ❌ If Failed:
- Variable shows `undefined` → Redeploy needed
- Go back to Vercel → Deployments → Redeploy (uncheck cache)
- Wait 5 minutes and test again

---

## 🧪 TEST 2: GitHub OAuth Flow (CRITICAL)

**Time:** 2 minutes  
**Purpose:** Test complete GitHub authentication flow

### Setup:

1. **Open FRESH incognito/private window**
   - Chrome: Ctrl+Shift+N (Windows) or Cmd+Shift+N (Mac)
   - Firefox: Ctrl+Shift+P (Windows) or Cmd+Shift+P (Mac)
   - Safari: File → New Private Window

2. **Important:** Must be fresh session (no existing cookies)

### Test Steps:

**Step 1: Navigate to Login**
- URL: `https://devdapp.com/auth/login`
- Should see: Login page with "Sign in with GitHub" button

**Step 2: Open DevTools**
- Press F12 (or Right-click → Inspect)
- Go to **Console** tab
- Keep this open during the test

**Step 3: Click "Sign in with GitHub"**

Watch the console for this log:
```javascript
GitHub OAuth initiated: {
  callbackUrl: "https://devdapp.com/auth/callback?next=%2Fprotected%2Fprofile",
  finalDestination: "/protected/profile",
  timestamp: "2025-10-06T..."
}
```

**✅ GOOD:** `callbackUrl` starts with `https://devdapp.com` (no www)  
**❌ BAD:** `callbackUrl` starts with `https://www.devdapp.com` (has www)

If BAD: Environment variable not deployed yet. Redeploy and wait.

**Step 4: GitHub Authorization**
- Should redirect to: `https://github.com/login/oauth/authorize?...`
- Shows: "supabase by gitdevdapp wants to access..."
- Click: **"Authorize [your-username]"**

**Step 5: Watch URL Bar Carefully**

The URL should transition through these stages:

```
1. https://devdapp.com/auth/login
   ↓
2. https://github.com/login/oauth/authorize?...
   ↓
3. https://mjrnzgunexmopvnamggw.supabase.co/auth/v1/callback?code=...
   ↓
4. https://devdapp.com/auth/callback?code=...&next=/protected/profile  ← KEY!
   ↓
5. https://devdapp.com/protected/profile
```

**CRITICAL CHECK:** Did you see step 4 with `/auth/callback`?

**✅ SUCCESS:** URL went through `/auth/callback` route  
**❌ FAILURE:** URL went to `/?code=...` (homepage)

**Step 6: Verify Login Success**

After redirect completes, you should see:

- **Profile page** (`/protected/profile`)
- Your **GitHub avatar** displayed
- Your **email address** shown
- **"Create Wallet"** button available
- **No error messages**

**Step 7: Check Console for Logs**

Look for these in DevTools Console:
```javascript
✅ GitHub OAuth initiated: { ... }
```

Should NOT see:
```javascript
❌ OAuth code detected on homepage - this indicates misconfiguration
```

If you see the "homepage" warning, it means the emergency handler caught it, which means the environment variable isn't working yet.

### ✅ Test 2 Pass Criteria:

- [ ] Console log shows correct `callbackUrl` (no www)
- [ ] GitHub authorization page appears
- [ ] URL goes through `/auth/callback` (not `/?code=`)
- [ ] Lands on profile page (`/protected/profile`)
- [ ] User is logged in (can see profile info)
- [ ] No error messages

---

## 🧪 TEST 3: Vercel Function Logs

**Time:** 1 minute  
**Purpose:** Verify callback route executed successfully

### Steps:

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Click **"Functions"** tab (or "Logs" → "Functions")
4. Find the `/auth/callback` function
5. Look at recent invocations (should show one from your test)
6. Click on the most recent invocation

### Expected Logs:

```
=== OAuth Callback Debug ===
Full URL: https://devdapp.com/auth/callback?code=...&next=/protected/profile
Origin: https://devdapp.com
Code present: true
Code length: 36
Error param: null
Error description: null
Next param: /protected/profile
Request host: devdapp.com
Timestamp: 2025-10-06T...
===================================

Attempting to exchange code for session...
✅ Session exchange successful!
Exchange duration: 245ms
User ID: [your-user-id]
Email: [your-email]
Provider: github
Session expires at: [timestamp]
Redirecting to: https://devdapp.com/protected/profile
```

### ✅ Test 3 Pass Criteria:

- [ ] Function was invoked
- [ ] `Code present: true`
- [ ] `Session exchange successful!`
- [ ] `Provider: github`
- [ ] No error messages

### ❌ If No Logs Found:

This means the `/auth/callback` route was never reached. Possible causes:
- Still landing on homepage with `?code=`
- Environment variable not deployed
- Supabase redirect URLs not configured
- Need to redeploy

---

## 🧪 TEST 4: WWW Domain (Edge Case)

**Time:** 1 minute  
**Purpose:** Verify both www and non-www work

### Steps:

1. Open **new incognito window**
2. Go to: `https://www.devdapp.com/auth/login` (WITH www)
3. Click "Sign in with GitHub"
4. Complete authorization
5. Should still successfully log in

### ✅ Pass Criteria:

- Works on both `devdapp.com` and `www.devdapp.com`
- Both redirect to profile page
- No errors on either domain

---

## 🧪 TEST 5: Session Persistence

**Time:** 1 minute  
**Purpose:** Verify session persists across navigation

### Steps (after successful login from Test 2):

1. **Refresh the page** (F5)
   - Should stay logged in ✅
   - Should see profile page ✅

2. **Navigate away and back**
   - Go to: `https://devdapp.com` (homepage)
   - Then go to: `https://devdapp.com/protected/profile`
   - Should still be logged in ✅

3. **Check session cookie**
   - DevTools → Application tab (Chrome) or Storage tab (Firefox)
   - Cookies → `https://devdapp.com`
   - Find: `sb-mjrnzgunexmopvnamggw-auth-token`
   - Should exist with future expiration date ✅

4. **Test wallet creation** (optional)
   - Click "Create Wallet" button
   - Should successfully create CDP wallet ✅

### ✅ Pass Criteria:

- [ ] Session persists on refresh
- [ ] Session persists on navigation
- [ ] Cookie exists and is valid
- [ ] Protected routes remain accessible

---

## 🧪 TEST 6: Emergency Handler (Safety Net)

**Time:** 30 seconds  
**Purpose:** Verify emergency handler is in place

### Steps:

1. Read the homepage source code
2. Look for `<OAuthCodeHandler />` component
3. If code lands on homepage accidentally, handler should catch it

### How to Test (Optional):

This test is only useful if the main fix didn't work:

1. If you ever land on `https://devdapp.com/?code=xxx`
2. Watch console for:
   ```
   ⚠️ OAuth code detected on homepage - this indicates misconfiguration
   Attempting emergency recovery...
   ✅ Emergency code exchange successful
   ```
3. Should auto-redirect to profile page

**Note:** This should NOT trigger if everything is working correctly. It's a safety net.

---

## 📊 FULL TEST RESULTS SUMMARY

After completing all tests, fill this out:

```
🧪 TEST RESULTS - [Date/Time]

Environment Variable Check:
[ ] PASS  [ ] FAIL
Notes: ___________________________________

GitHub OAuth Flow:
[ ] PASS  [ ] FAIL  
Console callbackUrl: _____________________
Final URL: _______________________________
Logged in: [ ] YES  [ ] NO

Vercel Logs:
[ ] PASS  [ ] FAIL
Code present: [ ] YES  [ ] NO
Session created: [ ] YES  [ ] NO

WWW Domain:
[ ] PASS  [ ] FAIL  [ ] NOT TESTED

Session Persistence:
[ ] PASS  [ ] FAIL

Overall Result:
[ ] ✅ ALL TESTS PASSED - GitHub OAuth is working!
[ ] ⚠️ PARTIAL - Some tests passed, some failed
[ ] ❌ FAILED - OAuth still not working

Next Actions:
____________________________________
____________________________________
```

---

## 🔴 TROUBLESHOOTING GUIDE

### Issue: Environment Variable Shows `undefined`

**Symptoms:**
- Test 1 fails
- `console.log(process.env.NEXT_PUBLIC_APP_URL)` returns `undefined`

**Solutions:**
1. Verify variable added to Vercel → Settings → Environment Variables
2. Check "Production" environment is selected
3. Click "Save" button in Vercel
4. **Redeploy** (critical - env vars need redeployment)
5. Clear browser cache
6. Wait 5 minutes for deployment to complete
7. Test again

---

### Issue: Still Landing on Homepage with `?code=`

**Symptoms:**
- URL shows: `https://devdapp.com/?code=xxx`
- NOT: `https://devdapp.com/auth/callback?code=xxx`

**Diagnosis:**
- Environment variable not deployed yet
- OR Supabase redirect URLs not configured correctly

**Solutions:**

1. **Check Console Log:**
   ```javascript
   // What does callbackUrl show?
   GitHub OAuth initiated: { callbackUrl: "???" }
   ```
   - If has `www`: Environment variable not applied
   - If no `www`: Supabase issue

2. **Verify Supabase Redirect URLs:**
   - Go to: https://supabase.com/dashboard/project/mjrnzgunexmopvnamggw/auth/url-configuration
   - Confirm these exact URLs exist:
     - `https://devdapp.com/auth/callback`
     - `https://www.devdapp.com/auth/callback`
   - Add any missing
   - Wait 90 seconds for propagation

3. **Force Clean Redeploy:**
   - Vercel → Deployments
   - Redeploy latest
   - **Uncheck** "Use existing Build Cache"
   - Wait for completion
   - Test in fresh incognito window

4. **Check Emergency Handler:**
   - If it triggers, it will handle the code
   - But this means the fix isn't working yet

---

### Issue: "Authorization code expired" Error

**Symptoms:**
- Error page shows: "Authorization code has expired"

**Cause:**
- OAuth codes expire in 10 minutes
- Code was delivered but not exchanged in time

**Solution:**
- Start over with fresh login attempt
- Complete the flow quickly (takes <30 seconds normally)
- Don't wait between steps

---

### Issue: No Vercel Logs for `/auth/callback`

**Symptoms:**
- Functions tab shows no invocations
- OR no recent logs for callback

**Diagnosis:**
- The callback route is not being reached
- User is landing on homepage instead

**Solution:**
- This confirms the redirect issue
- Follow solutions for "Still Landing on Homepage"
- Check that `/auth/callback` route exists in your deployment

---

### Issue: Console Shows WWW in callbackUrl

**Symptoms:**
```javascript
GitHub OAuth initiated: {
  callbackUrl: "https://www.devdapp.com/auth/callback..."
  //           ^^^^ www is present (bad)
}
```

**Diagnosis:**
- Environment variable not deployed yet
- Falling back to `window.location.origin`

**Solution:**
1. Verify Vercel environment variable is saved
2. **Redeploy** (this is critical)
3. Clear browser cache completely
4. Test in fresh incognito window
5. If still shows www, wait 5 more minutes for deployment

---

## 📈 SUCCESS METRICS

After all fixes are deployed and tested:

### Expected Success Rates:

- **GitHub OAuth:** 99%+ success rate
- **Callback Route Reached:** 99%+ of attempts
- **Session Creation:** 99%+ of authentications
- **Homepage with `?code=`:** 0% (should never happen)

### Monitor These:

**First 24 Hours:**
- Test with 3-5 different GitHub accounts
- Monitor Vercel function logs every 6 hours
- Watch for any error patterns

**First Week:**
- Track daily login success rates
- Monitor support tickets (should drop to near zero)
- Check Supabase auth logs for failures

---

## 🎯 FINAL VERIFICATION

Before marking this as complete:

- [ ] All 5 core tests passed
- [ ] Tested with at least 2 different GitHub accounts
- [ ] Tested on both www and non-www domains
- [ ] Checked Vercel logs show successful sessions
- [ ] No console errors
- [ ] Session persists across navigation
- [ ] Can create CDP wallets after login
- [ ] No support tickets or user complaints

---

## 📞 NEXT STEPS AFTER SUCCESSFUL TESTING

Once all tests pass:

1. **Document the Fix**
   - Update team documentation
   - Add to deployment notes
   - Create KB article for support team

2. **Monitor Production**
   - Set up alerts for auth failures
   - Watch Vercel logs for patterns
   - Track success metrics

3. **User Communication** (if needed)
   - Notify users that GitHub login is fixed
   - Send test invite to previous failed users
   - Update status page

4. **Consider Enhancements**
   - Add Google OAuth (same pattern)
   - Implement www redirect at DNS level
   - Add analytics for OAuth funnel
   - Improve error messages

---

## 📋 QUICK COMMAND REFERENCE

### Check Environment Variable Locally:
```bash
echo $NEXT_PUBLIC_APP_URL
# Should output: https://devdapp.com
```

### Test OAuth Flow in Console:
```javascript
// Check env var
console.log(process.env.NEXT_PUBLIC_APP_URL);

// Check redirect URL function
import { getRedirectURL } from '@/lib/auth-helpers';
console.log(getRedirectURL('/auth/callback'));
// Should output: https://devdapp.com/auth/callback
```

### Check Cookies:
```javascript
document.cookie.split(';').find(c => c.includes('auth-token'));
```

### Force Clear Session:
```javascript
// In console (for testing)
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, 
    "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

---

**Testing Time:** 10-15 minutes total  
**Confidence:** 99% success rate expected  

**Status:** ✅ READY TO TEST NOW

---

*Last Updated: October 6, 2025*
*Testing Checklist Version: 1.0*


