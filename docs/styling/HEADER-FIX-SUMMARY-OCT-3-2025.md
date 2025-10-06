# Header Navigation Fix - October 3, 2025

## TL;DR - What Was Broken

The wallet page (`/app/wallet/page.tsx`) had `showAuthButton={false}`, which **completely removed all authentication UI** from the header.

## The Impact

❌ **When logged OUT:** No "Sign in" or "Sign up" buttons visible  
❌ **When logged IN:** No email, Profile button, or Logout button  
❌ **Mobile:** No hamburger menu at all  

**Users were literally trapped with no way to logout from the wallet page.**

---

## What I Fixed

Changed this BROKEN code:

```tsx
<GlobalNav 
  showAuthButton={false}    // ❌ WRONG
  showHomeButton={true}
  customActions={undefined}
/>
```

To this CORRECT code:

```tsx
<GlobalNav 
  showAuthButton={true}     // ✅ CORRECT
  showHomeButton={true}
  authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={false} />}
/>
```

---

## Why This Happened

During wallet development, someone set `showAuthButton={false}` instead of following the **standard GlobalNav pattern** used everywhere else in the app.

---

## Verification

✅ No other pages have this issue (grep search confirmed)  
✅ No linter errors  
✅ Follows the same pattern as homepage, guide, protected pages  
✅ Desktop shows: email + Profile + Logout when logged in  
✅ Mobile shows: hamburger menu when logged in  
✅ Logged out shows: Sign in + Sign up buttons  

---

## Detailed Documentation

See `/docs/styling/WALLET-PAGE-HEADER-BUG-FIX.md` for:
- Complete before/after comparison
- Expected behavior for all states
- Pattern to follow for all pages
- Prevention checklist

---

## Status: ✅ FIXED

The header now works correctly on the wallet page. All navigation patterns are consistent across the entire app.


