# Wallet Page Header Bug Fix

**Date**: October 3, 2025  
**Status**: ✅ FIXED  
**Priority**: CRITICAL - Header navigation completely broken on wallet page

---

## The Problem

The wallet page (`/app/wallet/page.tsx`) had **`showAuthButton={false}`** in the GlobalNav configuration, which completely removed all authentication UI from the header.

### What This Caused:

**When NOT logged in:**
- Couldn't see "Sign in" or "Sign up" buttons
- No way to authenticate from the wallet page

**When logged in:**
- No email display
- No Profile button
- **NO LOGOUT BUTTON** - Users were trapped!
- No hamburger menu on mobile

### Root Cause

During wallet development work, the GlobalNav on the wallet page was incorrectly configured:

```tsx
// ❌ BROKEN CODE (app/wallet/page.tsx lines 36-40)
<GlobalNav 
  showAuthButton={false}    // ← THIS WAS THE BUG
  showHomeButton={true}
  customActions={undefined}
/>
```

This differs from ALL other pages which correctly use:

```tsx
// ✅ CORRECT PATTERN (used on homepage, guide, protected pages)
<GlobalNav 
  showAuthButton={true}     // ← Shows auth UI
  showGuideButton={true}    // ← Context-dependent
  authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={true} />}
/>
```

---

## The Fix

### Step 1: Add Missing Imports

```tsx
import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";
```

### Step 2: Fix GlobalNav Configuration

```tsx
// ✅ FIXED CODE (app/wallet/page.tsx lines 39-43)
<GlobalNav 
  showAuthButton={true}     // ← ENABLED auth button
  showHomeButton={true}     // ← Keep Home button (correct for wallet page)
  authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={false} />}
/>
```

### Why `showGuideButton={false}` for wallet page?

The wallet page doesn't need a Guide button since it's a standalone tool page, not part of the main site flow. Users can navigate back Home, then to Guide if needed.

---

## Expected Behavior After Fix

### Desktop (md and up)

**Logged OUT:**
```
[Logo]  [Home]                    [Theme] [Sign in] [Sign up]
```

**Logged IN:**
```
[Logo]  [Home]                    [Theme] [Hey, email!] [Profile] [Logout]
```

### Mobile (< md breakpoint)

**Logged OUT:**
```
[Logo]                            [Theme] [Sign in] [Sign up]
```

**Logged IN:**
```
[Logo]                            [Theme] [☰]
```

Hamburger menu contains:
- Email address (read-only)
- Profile link
- Logout button

---

## Verification Checklist

- [x] Wallet page shows auth buttons when logged out
- [x] Wallet page shows user email, Profile, Logout when logged in on desktop
- [x] Wallet page shows hamburger menu when logged in on mobile
- [x] Home button works correctly
- [x] No linter errors introduced
- [x] Matches pattern used on all other pages

---

## Lesson Learned

**NEVER set `showAuthButton={false}` on any page unless you have a VERY specific reason and alternative auth UI.**

The correct pattern for GlobalNav across the entire app:

```tsx
<GlobalNav 
  showAuthButton={true}              // ← Always true
  showGuideButton={CONTEXT_DEPENDENT} // ← Depends on page
  showHomeButton={CONTEXT_DEPENDENT}  // ← Depends on page
  authButtonComponent={
    !hasEnvVars 
      ? <EnvVarWarning /> 
      : <AuthButton showGuideButton={CONTEXT_DEPENDENT} />
  }
/>
```

### When to Show Each Button

| Button | Homepage | Guide | Wallet | Protected | Blockchain Pages |
|--------|----------|-------|--------|-----------|------------------|
| Auth   | ✅ YES   | ✅ YES | ✅ YES  | ✅ YES    | ✅ YES           |
| Guide  | ✅ YES   | ❌ NO  | ❌ NO   | ✅ YES    | ✅ YES           |
| Home   | ❌ NO    | ✅ YES | ✅ YES  | ❌ NO     | ❌ NO            |

**Logic:**
- **Auth**: Always show (users need to login/logout everywhere)
- **Guide**: Show on pages where users might want to learn (homepage, protected area, blockchain pages)
- **Home**: Show on isolated pages that break from main flow (guide, wallet)

---

## Files Modified

1. `/app/wallet/page.tsx`
   - Added missing imports (AuthButton, EnvVarWarning, hasEnvVars)
   - Changed `showAuthButton={false}` to `showAuthButton={true}`
   - Added `authButtonComponent` prop with proper configuration

---

## Related Documentation

- `/docs/styling/MOBILE-HAMBURGER-MENU-PLAN.md` - Original mobile menu design
- `/docs/styling/HEADER-CONSISTENCY-VERIFICATION.md` - Header consistency patterns
- `/docs/styling/HEADER-FIX-IMPLEMENTATION-SUMMARY.md` - Previous header fixes

---

## Prevention

To prevent this from happening again:

1. **Always use the standard GlobalNav pattern** shown above
2. **Never disable auth button** without explicit documentation why
3. **Test all pages** after making navigation changes:
   - Test logged out state
   - Test logged in state
   - Test desktop viewport
   - Test mobile viewport
4. **Follow the button visibility table** above for consistency

The header navigation is now FIXED and consistent across all pages. ✅


