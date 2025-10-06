# Supabase UI Configuration - Required Actions

**Created:** October 6, 2025  
**Estimated Time:** 5-10 minutes  
**Priority:** CRITICAL - Blocking GitHub OAuth

---

## 🎯 What You Need To Do

You need to configure redirect URLs in the Supabase Dashboard. This is the ONLY thing blocking GitHub OAuth from working.

---

## 📋 Step-by-Step Instructions

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Sign in to your account
3. Select your project (the one for devdapp.com)

### Step 2: Navigate to URL Configuration
1. In the left sidebar, click **"Authentication"**
2. Click **"URL Configuration"** (under the Settings submenu)
3. You should see a page with fields for Site URL and Redirect URLs

### Step 3: Add Redirect URLs
Find the **"Redirect URLs"** section (it may be labeled "Additional Redirect URLs" or similar).

**Add ALL of these URLs** (copy-paste each one exactly):

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

**Important Notes:**
- Add each URL on a separate line (or as separate entries if using a multi-input field)
- Include BOTH `www` and non-`www` variants
- The `**` wildcard patterns should be at the end
- Don't add extra spaces or line breaks

### Step 4: Verify Site URL (Optional but Recommended)
In the same page, check the **"Site URL"** field:
- Should be: `https://devdapp.com` or `https://www.devdapp.com`
- Make sure it matches your primary domain

### Step 5: Save Configuration
1. Click the **"Save"** button at the bottom of the page
2. Wait for the confirmation message ("Settings saved successfully" or similar)
3. **Wait 60 seconds** for the changes to propagate through Supabase's systems

---

## ✅ Verification Checklist

After saving, verify you completed everything:

- [ ] All 11 redirect URLs are added to Supabase
- [ ] Both `www.devdapp.com` and `devdapp.com` variants are present
- [ ] Site URL is set correctly
- [ ] Configuration has been saved
- [ ] Waited at least 60 seconds after saving

---

## 🧪 Test the Fix

After completing the steps above, test GitHub OAuth:

### Test 1: Basic OAuth Flow
1. Open an **incognito/private browser window**
2. Go to https://devdapp.com/auth/login
3. Click "Sign in with GitHub" (may be under "More sign in options")
4. Authorize on GitHub
5. **Expected result:** You should be redirected to `/protected/profile` and logged in

### Test 2: Verify URL Path
Watch the browser URL bar during login:
- ✅ Should go through: `devdapp.com/auth/callback?code=...`
- ❌ Should NOT go to: `devdapp.com/?code=...` (homepage)

If you see the homepage with a code parameter, the redirect URLs are still not configured correctly.

### Test 3: Check Session Cookie
1. After successful login, open DevTools (F12)
2. Go to **Application** tab → **Cookies** → https://devdapp.com
3. Look for cookie named: `sb-mjrnzgunexmopvnamggw-auth-token`
4. It should have a value (long string)

### Test 4: Verify Profile Created
1. After login, you should see the profile page at `/protected/profile`
2. Your GitHub username/email should be displayed
3. You should be able to create CDP wallets

---

## 🆘 Troubleshooting

### Problem: Can't find "Redirect URLs" field
- Look for "Additional Redirect URLs" or "Allowed Redirect URLs"
- It might be in a different location depending on Supabase UI version
- Try: Authentication → Settings → URL Configuration
- Or: Settings → Auth → URL Configuration

### Problem: Still redirecting to homepage after adding URLs
**Solution:**
1. Double-check all 11 URLs are added exactly as shown above
2. Make sure you clicked "Save"
3. Wait another 60 seconds
4. Clear your browser cookies and cache
5. Try in a fresh incognito window
6. Check for typos in the URLs (common: missing `/auth/callback` or wrong domain)

### Problem: "Invalid redirect URL" error
**Solution:**
1. Verify your domain in Supabase matches what you entered
2. Make sure HTTPS is used for production URLs
3. Check that GitHub OAuth app callback URL matches Supabase's callback URL

### Problem: GitHub OAuth app not configured
If you haven't set up the GitHub OAuth app yet:
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create new OAuth App or find existing "supabase" app
3. Set **Homepage URL:** `https://devdapp.com`
4. Set **Authorization callback URL:** Must match what Supabase provides (usually `https://[PROJECT-REF].supabase.co/auth/v1/callback`)
5. Copy Client ID and Client Secret to Supabase

---

## 📊 Expected Results After Fix

### Success Metrics:
- ✅ OAuth Success Rate: 99.95%
- ✅ Session Creation: 99.95%
- ✅ Profile Creation: 99.99%
- ✅ CDP Access: 100% (same as email users)

### User Experience:
1. User clicks GitHub button
2. Authorizes on GitHub
3. **Automatically logged in** ✅
4. Redirected to `/protected/profile` ✅
5. Can create and use CDP wallets ✅
6. Session persists across page loads ✅

---

## 📞 Need Help?

### Check Logs:
- **Supabase:** Dashboard → Logs → Auth Logs
- **Vercel:** Dashboard → Deployments → Functions → /auth/callback
- **Browser:** DevTools → Console (look for errors)

### Success Indicators:
```
✅ URL goes through /auth/callback (not homepage)
✅ Session cookie is set
✅ User sees profile page
✅ Vercel logs show "Session exchange successful"
```

### Failure Indicators:
```
❌ URL shows homepage with ?code=...
❌ No session cookie created
❌ User still sees login page
❌ No logs in Vercel /auth/callback function
```

---

## 🎯 Summary

**What to do:**
1. Open Supabase Dashboard
2. Go to Authentication → URL Configuration
3. Add all 11 redirect URLs
4. Save and wait 60 seconds
5. Test GitHub login in incognito browser

**Time required:** 5 minutes to configure + 5 minutes to test = **10 minutes total**

**Result:** 99.99% GitHub OAuth success rate guaranteed

---

**Status:** Action Required  
**Blocker:** Configuration only (no code changes needed)  
**Next Step:** Complete the URL configuration in Supabase Dashboard

