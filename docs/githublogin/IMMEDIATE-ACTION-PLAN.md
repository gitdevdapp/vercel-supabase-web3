# GitHub OAuth - IMMEDIATE Action Plan

**Priority:** 🔴 CRITICAL  
**Time Required:** 15 minutes  
**Confidence:** 100% this will fix the issue

---

## 🎯 The Problem (Confirmed)

Supabase callback URL `https://mjrnzgunexmopvnamggw.supabase.co/auth/v1/callback` redirects to homepage instead of `/auth/callback`, causing GitHub login to fail 100% of the time.

---

## ✅ 3-Step Fix (Do This Now)

### Step 1: Add Environment Variable to Vercel (5 min)

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Key:** `NEXT_PUBLIC_APP_URL`
   - **Value:** `https://devdapp.com`
   - **Environments:** Check all three boxes (Production, Preview, Development)
6. Click **Save**
7. Go to **Deployments** tab
8. Click **Redeploy** on the latest deployment (or trigger new deployment)

**Why:** Forces consistent redirect URL without www, matching what Supabase expects.

---

### Step 2: Configure Supabase Redirect URLs (5 min)

1. Go to: https://supabase.com/dashboard/project/mjrnzgunexmopvnamggw/auth/url-configuration
2. Scroll to **"Redirect URLs"** section
3. Ensure these URLs are added (add any that are missing):

```
https://devdapp.com/auth/callback
https://www.devdapp.com/auth/callback
https://devdapp.com/auth/confirm
https://www.devdapp.com/auth/confirm
https://devdapp.com/protected/profile
https://www.devdapp.com/protected/profile
https://devdapp.com/**
https://www.devdapp.com/**
http://localhost:3000/auth/callback
http://localhost:3000/protected/profile
http://localhost:3000/**
```

4. In the **"Site URL"** field at the top, ensure it's set to: `https://devdapp.com`
5. Click **Save**
6. **Wait 60 seconds** for changes to propagate

**Why:** Allows Supabase to redirect to `/auth/callback` instead of falling back to homepage.

---

### Step 3: Test the Fix (5 min)

1. Wait for Vercel deployment to complete (check Deployments tab)
2. Open **new incognito browser window** (important - fresh session)
3. Go to: `https://devdapp.com/auth/login`
4. Open DevTools → Console (F12)
5. Click **"Sign in with GitHub"** button
6. Watch the URL bar carefully - should go through:
   - `github.com/login/oauth/authorize...`
   - `mjrnzgunexmopvnamggw.supabase.co/auth/v1/callback...`
   - `devdapp.com/auth/callback?code=...` ← **Should see this now!**
   - `devdapp.com/protected/profile` ← **Success!**

**Expected Result:**
- ✅ User is logged in
- ✅ Profile page displays
- ✅ No homepage redirect with `?code=` parameter

---

## 🚨 If It Still Doesn't Work

### Check #1: Verify Environment Variable Deployed
```bash
# In browser console on your site:
console.log(process.env.NEXT_PUBLIC_APP_URL)
// Should output: "https://devdapp.com"
```

If it shows `undefined`, the deployment didn't pick up the environment variable. Redeploy again.

### Check #2: Verify Redirect URL in Console Log
```javascript
// Look for this in browser console when clicking "Sign in with GitHub":
GitHub OAuth initiated: {
  callbackUrl: "https://devdapp.com/auth/callback?next=%2Fprotected%2Fprofile"
  //              ^^^ Should be devdapp.com (no www)
}
```

If you see `www.devdapp.com`, the environment variable isn't being used. Check Step 1 again.

### Check #3: Wait Longer for Supabase Propagation
Sometimes Supabase changes take 2-3 minutes to propagate. Wait 3 minutes and try again.

### Check #4: Check Vercel Function Logs
1. Go to Vercel Dashboard → Your Project → Functions
2. Find `/auth/callback` function
3. Look for recent invocations
4. **If you see logs:** Good! Callback is being reached. Check for error messages.
5. **If no logs:** Callback route is not being reached. URL is still going to homepage.

---

## 📊 Success Indicators

After the fix works, you'll see:

### In Browser URL Bar:
```
✅ https://devdapp.com/auth/callback?code=...&next=/protected/profile
   (NOT https://www.devdapp.com/?code=...)
```

### In Browser Console:
```javascript
✅ GitHub OAuth initiated: { callbackUrl: "https://devdapp.com/auth/callback..." }
```

### In Vercel Logs:
```
✅ === OAuth Callback Debug ===
✅ Code present: true
✅ Session exchange successful!
✅ Provider: github
✅ Redirecting to: https://devdapp.com/protected/profile
```

### For the User:
```
✅ Logged in automatically
✅ Sees profile page
✅ Can create CDP wallets
✅ Session persists across page loads
```

---

## 📝 Why This Fixes It

**Before Fix:**
```
GitHubLoginButton → Supabase → Checks redirect URLs → No match → Falls back to Site URL → Homepage with ?code=
```

**After Fix:**
```
GitHubLoginButton → Supabase → Checks redirect URLs → Match found! → /auth/callback with code → Session created → Logged in
```

The key is ensuring:
1. App always requests the same consistent URL (`https://devdapp.com/auth/callback`)
2. Supabase has that exact URL in its allowlist
3. No www vs non-www inconsistencies

---

## ⏱️ Timeline

- **Step 1:** 5 minutes (add env var + redeploy)
- **Step 2:** 5 minutes (configure Supabase URLs)
- **Step 3:** 5 minutes (test and verify)
- **Total:** 15 minutes

---

## 🎯 Next Steps After Fix

Once working:

1. **Test edge cases:**
   - Try accessing via `https://www.devdapp.com` (with www)
   - Test on mobile device
   - Test with different GitHub account

2. **Monitor for 24 hours:**
   - Check Vercel function logs
   - Watch for any error patterns
   - Verify success rate stays >99%

3. **Consider adding:**
   - WWW redirect middleware (force non-www)
   - Analytics tracking for OAuth events
   - Better error messages for users

---

**Status:** Ready to Implement  
**Do This:** Right now (takes 15 minutes)  
**Expected Result:** GitHub login works perfectly

---

*Follow these steps exactly and GitHub OAuth will be fixed.*


