# Header Navigation Fix Plan

**Date**: October 3, 2025  
**Status**: 🚨 Critical Bug Fix  
**Priority**: P0 - Immediate Action Required

---

## Executive Summary

Critical navigation bugs preventing proper header functionality across logged-in and logged-out states on multiple pages. Both desktop and mobile views are affected.

### Issues Identified

1. **❌ Logged Out State**: Sign in/Sign up buttons not showing on some pages
2. **❌ Logged In Mobile State**: Guide link missing from hamburger menu
3. **❌ TypeScript Error**: `customActions` parameter used but not defined in GlobalNav interface

### Root Causes

1. **Missing `showGuideButton` prop**: 8 pages not passing `showGuideButton={true}` to `<AuthButton />` component
2. **Interface mismatch**: GlobalNav uses `customActions` prop but it's not in the TypeScript interface

---

## Current State Analysis

### File: `components/navigation/global-nav.tsx`

**Problem 1: Interface Definition (Lines 8-15)**
```typescript
interface GlobalNavProps {
  showAuthButton?: boolean;
  showDeployButton?: boolean;
  showHomeButton?: boolean;
  showGuideButton?: boolean;
  // ❌ MISSING: customActions?: React.ReactNode;
  authButtonComponent?: React.ReactNode;
}
```

**Problem 2: Usage of Undefined Prop (Lines 22, 54)**
```typescript
export function GlobalNav({ 
  showAuthButton = true,
  showDeployButton = false,
  showHomeButton = false,
  showGuideButton = false,
  customActions, // ❌ Used but not in interface
  authButtonComponent
}: GlobalNavProps) {
```

### File: `components/auth-button.tsx`

**Current Implementation (CORRECT):**
- ✅ Lines 19-34: Logged IN - Desktop shows Profile + Logout, Mobile shows Hamburger
- ✅ Lines 36-44: Logged OUT - Shows Sign in + Sign up buttons
- ✅ Line 33: Passes `showGuideButton` prop to MobileMenu

**Expected Behavior:**
- When `showGuideButton={true}` is passed, hamburger menu should include Guide link
- When `showGuideButton={false}` (default), hamburger menu should NOT include Guide link

### File: `components/navigation/mobile-menu.tsx`

**Current Implementation (CORRECT):**
- ✅ Lines 52-58: Conditionally shows Guide link based on `showGuideButton` prop
- ✅ Lines 60-64: Always shows Profile link
- ✅ Lines 68-73: Always shows Logout link

---

## Pages Audit

### ✅ Pages Working Correctly

| Page | File | Status | Notes |
|------|------|--------|-------|
| Protected Layout | `app/protected/layout.tsx` | ✅ Working | Correctly passes `showGuideButton={true}` |

### ❌ Pages With Broken Navigation

| Page | File | Issue | Impact |
|------|------|-------|--------|
| Homepage | `app/page.tsx` | Missing `showGuideButton={true}` | Logged-in users: No Guide in hamburger menu |
| Guide Page | `app/guide/page.tsx` | Missing `showGuideButton={true}` (2x) | Logged-in users: No Guide in hamburger menu |
| Flow Page | `app/flow/page.tsx` | Missing `showGuideButton={true}` | Logged-in users: No Guide in hamburger menu |
| Root Page | `app/root/page.tsx` | Missing `showGuideButton={true}` | Logged-in users: No Guide in hamburger menu |
| Avalanche Page | `app/avalanche/page.tsx` | Missing `showGuideButton={true}` | Logged-in users: No Guide in hamburger menu |
| ApeChain Page | `app/apechain/page.tsx` | Missing `showGuideButton={true}` | Logged-in users: No Guide in hamburger menu |
| Tezos Page | `app/tezos/page.tsx` | Missing `showGuideButton={true}` | Logged-in users: No Guide in hamburger menu |
| Stacks Page | `app/stacks/page.tsx` | Missing `showGuideButton={true}` | Logged-in users: No Guide in hamburger menu |

---

## Required Fixes

### Fix 1: Add `customActions` to GlobalNav Interface

**File**: `components/navigation/global-nav.tsx`

**Change Line 8-15 from:**
```typescript
interface GlobalNavProps {
  showAuthButton?: boolean;
  showDeployButton?: boolean;
  showHomeButton?: boolean;
  showGuideButton?: boolean;
  authButtonComponent?: React.ReactNode;
}
```

**To:**
```typescript
interface GlobalNavProps {
  showAuthButton?: boolean;
  showDeployButton?: boolean;
  showHomeButton?: boolean;
  showGuideButton?: boolean;
  customActions?: React.ReactNode;
  authButtonComponent?: React.ReactNode;
}
```

### Fix 2: Pass `showGuideButton={true}` to AuthButton - Homepage

**File**: `app/page.tsx`

**Change Line 42 from:**
```typescript
authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
```

**To:**
```typescript
authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={true} />}
```

### Fix 3: Pass `showGuideButton={true}` to AuthButton - Guide Page (2 instances)

**File**: `app/guide/page.tsx`

**Change Line 28 from:**
```typescript
authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
```

**To:**
```typescript
authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={true} />}
```

**Change Line 41 from:**
```typescript
authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton />} 
```

**To:**
```typescript
authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={true} />}
```

### Fix 4: Pass `showGuideButton={true}` to AuthButton - Flow Page

**File**: `app/flow/page.tsx`

**Change Line 57 from:**
```typescript
authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
```

**To:**
```typescript
authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={true} />}
```

### Fix 5: Pass `showGuideButton={true}` to AuthButton - Root Page

**File**: `app/root/page.tsx`

**Change Line 57 from:**
```typescript
authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
```

**To:**
```typescript
authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={true} />}
```

### Fix 6: Pass `showGuideButton={true}` to AuthButton - Avalanche Page

**File**: `app/avalanche/page.tsx`

**Change Line 57 from:**
```typescript
authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
```

**To:**
```typescript
authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={true} />}
```

### Fix 7: Pass `showGuideButton={true}` to AuthButton - ApeChain Page

**File**: `app/apechain/page.tsx`

**Change Line 57 from:**
```typescript
authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
```

**To:**
```typescript
authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={true} />}
```

### Fix 8: Pass `showGuideButton={true}` to AuthButton - Tezos Page

**File**: `app/tezos/page.tsx`

**Change Line 57 from:**
```typescript
authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
```

**To:**
```typescript
authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={true} />}
```

### Fix 9: Pass `showGuideButton={true}` to AuthButton - Stacks Page

**File**: `app/stacks/page.tsx`

**Change Line 57 from:**
```typescript
authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
```

**To:**
```typescript
authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={true} />}
```

---

## Expected Behavior After Fixes

### Desktop View (All Pages)

**Logged OUT State:**
```
[Logo] [Guide]          [Theme] [Sign in] [Sign up]
```

**Logged IN State:**
```
[Logo] [Guide]          [Theme] [Hey, user@email.com!] [Profile] [Logout]
```

### Mobile View (All Pages)

**Logged OUT State:**
```
[Logo]                  [Theme] [Sign in] [Sign up]
```

**Logged IN State:**
```
[Logo]                  [Theme] [☰]
                                 └─ Hamburger Menu:
                                    - user@email.com
                                    - Guide ✅ (NOW INCLUDED)
                                    - Profile
                                    - Logout
```

---

## Verification Checklist

After applying all fixes, verify:

- [ ] **Desktop - Logged OUT**: All pages show Sign in + Sign up buttons
- [ ] **Desktop - Logged IN**: All pages show Profile + Logout buttons
- [ ] **Desktop - Guide Button**: Shows on desktop when `showGuideButton={true}` on GlobalNav
- [ ] **Mobile - Logged OUT**: All pages show Sign in + Sign up buttons (no hamburger)
- [ ] **Mobile - Logged IN**: All pages show hamburger menu icon
- [ ] **Mobile - Hamburger Menu**: Contains Guide, Profile, and Logout links
- [ ] **TypeScript**: No compilation errors for `customActions`
- [ ] **All Pages**: Navigate through all 9 pages and test both states

### Pages to Test

1. ✅ Homepage (`/`)
2. ✅ Guide Page (`/guide`)
3. ✅ Protected Profile (`/protected/profile`)
4. ✅ Flow Page (`/flow`)
5. ✅ Root Page (`/root`)
6. ✅ Avalanche Page (`/avalanche`)
7. ✅ ApeChain Page (`/apechain`)
8. ✅ Tezos Page (`/tezos`)
9. ✅ Stacks Page (`/stacks`)

---

## Implementation Order

1. **First**: Fix GlobalNav interface (prevents TypeScript errors)
2. **Second**: Fix all 8 page files (enables proper navigation)
3. **Third**: Test on desktop (verify logged in/out states)
4. **Fourth**: Test on mobile (verify hamburger menu)

---

## Additional Notes

### Why This Happened

The `showGuideButton` prop was added to `AuthButton` component but many pages were already using `<AuthButton />` without the prop. Since the default is `false`, those pages never showed the Guide link in the hamburger menu.

### Prevention

Going forward, when adding new pages:
- Always pass `showGuideButton={true}` to `<AuthButton />` if Guide should be accessible
- Reference `app/protected/layout.tsx` as the correct implementation pattern

### Related Documentation

- See `docs/styling/MOBILE-HAMBURGER-MENU-PLAN.md` for original hamburger menu design
- See `components/auth-button.tsx` for AuthButton implementation details
- See `components/navigation/mobile-menu.tsx` for mobile menu structure

---

**Status**: Ready for implementation  
**Estimated Time**: 10 minutes  
**Risk Level**: Low (simple prop additions, no logic changes)

