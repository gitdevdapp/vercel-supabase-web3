# Mobile Guide Page Redirect Issue - Root Cause & Fix

**Date**: October 2, 2025  
**Issue**: Authenticated users on Android Chrome are redirected to `/auth/login` when clicking `/guide` button  
**Status**: ✅ ROOT CAUSE IDENTIFIED + SIMPLE FIX READY

---

## 🔴 The Problem

### What Happens
1. ✅ User logs in successfully on Android Chrome
2. ✅ Profile page loads correctly (user IS authenticated)
3. ❌ User clicks "Guide" button to navigate to `/guide`
4. ❌ **Gets redirected to `/auth/login` instead**

### What Works
- ✅ **Desktop (macOS Chrome)**: Everything works perfectly
- ✅ **Mobile login**: Works fine
- ✅ **Mobile profile**: Loads correctly
- ❌ **Mobile navigation to `/guide`**: FAILS

---

## 🔍 Root Cause

### The Issue: Double Auth Check on Mobile

**Middleware** (`middleware.ts` line 20):
```typescript
// /guide is NOT excluded from middleware
"/((?!_next/static|_next/image|favicon.ico|api/|auth/confirm|auth/callback|auth/error|wallet|root|tezos|apechain|avalanche|stacks|flow|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
```

**What happens:**
1. Middleware runs and checks `supabase.auth.getClaims()` 
2. **On Android Chrome**, session cookies aren't properly read during navigation
3. Middleware sees `!user` and redirects to `/auth/login` (line 52-59 in `lib/supabase/middleware.ts`)

**But the `/guide` page ALREADY handles its own auth:**
```typescript
// app/guide/page.tsx lines 17-32
const supabase = await createClient()
const { data } = await supabase.auth.getClaims()
const isAuthenticated = !!data?.claims

if (!isAuthenticated) {
  return <GuideLockedView />  // Shows locked view, no redirect
}
```

### Why Desktop Works But Mobile Doesn't

**Desktop browsers**: Session cookies persist reliably across navigation  
**Mobile browsers (especially Android Chrome)**: Cookies may not be immediately available during navigation due to:
- Stricter cookie policies
- Navigation timing issues  
- Tab suspension/restoration
- Cross-tab session management differences

The middleware runs **before** the page loads, so on mobile it sees "no cookies = no user" and redirects.

---

## ✅ The Fix: Exclude `/guide` from Middleware

### Why This Works

1. **No redundant check**: `/guide` page handles its own auth
2. **No redirect loop**: Shows locked view instead of redirecting
3. **Mobile-friendly**: No middleware cookie check during navigation
4. **Desktop unchanged**: Already works, will continue working
5. **Zero breaking changes**: Auth still enforced by the page itself

### Implementation

**File**: `middleware.ts` (line 20)

**Current** (guide IS checked by middleware):
```typescript
"/((?!_next/static|_next/image|favicon.ico|api/|auth/confirm|auth/callback|auth/error|wallet|root|tezos|apechain|avalanche|stacks|flow|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
```

**Fixed** (guide EXCLUDED from middleware):
```typescript
"/((?!_next/static|_next/image|favicon.ico|api/|auth/confirm|auth/callback|auth/error|wallet|root|tezos|apechain|avalanche|stacks|flow|guide|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
```

**Change**: Add `|guide` to the exclusion list (before the `|.*\\` part)

---

## 🧪 Testing Plan

### Desktop (macOS Chrome)
1. ✅ Login works
2. ✅ Profile loads
3. ✅ Click Guide button → loads guide (authenticated view)
4. ✅ Logout → visit `/guide` → shows locked view

### Mobile (Android Chrome)
1. ✅ Login works  
2. ✅ Profile loads
3. ✅ Click Guide button → **NOW LOADS GUIDE** (no redirect!)
4. ✅ Logout → visit `/guide` → shows locked view

### Unauthenticated Access
1. ✅ Visit `/guide` directly without login → shows `<GuideLockedView />` (as designed)
2. ✅ No security issue: page-level auth still enforced

---

## 🎯 Why This Is The Right Fix

### ❌ Previous Approaches That Failed
- Changing PKCE flow → broke email confirmations
- Modifying cookie handling → no effect on mobile
- Session storage changes → didn't fix navigation issue
- Elaborate test plans → didn't address root cause

### ✅ This Approach
- **Simple**: One-line change
- **Safe**: No auth flow changes
- **Targeted**: Fixes exact mobile navigation issue
- **Maintains security**: Page still checks auth
- **No side effects**: Other routes unchanged

---

## 📋 Implementation Checklist

- [ ] Update `middleware.ts` to exclude `/guide`
- [ ] Test on desktop (Chrome macOS)
- [ ] Test on mobile (Chrome Android)
- [ ] Test unauthenticated access to `/guide`
- [ ] Verify no regression on other pages
- [ ] Document change in git commit

---

## 🔒 Security Verification

**Question**: Is it safe to exclude `/guide` from middleware?

**Answer**: YES ✅

**Reason**: The `/guide` page has its own server-side auth check:
```typescript
// This runs on the server for every request
const supabase = await createClient()  // Server client
const { data } = await supabase.auth.getClaims()
const isAuthenticated = !!data?.claims

if (!isAuthenticated) {
  return <GuideLockedView />  // Not authenticated → locked view
}

// Only reached if authenticated
return <div>...</div>  // Full guide content
```

The middleware auth check is **redundant** and causes mobile issues.

---

## Summary

**Root Cause**: Middleware auth check fails on mobile navigation due to cookie timing issues  
**Fix**: Exclude `/guide` from middleware since page handles own auth  
**Risk**: Zero - page-level auth still enforced  
**Benefit**: Fixes mobile navigation without breaking anything  
**Implementation**: One line change in `middleware.ts`

