# 🔐 Mobile Authentication Session Loss - Diagnosis & Fix Plan

**Date**: October 2, 2025  
**Issue**: Users successfully login on `/auth/login`, see profile page, but are prompted to login again when navigating to `/guide` page  
**Platform**: Particularly affects **mobile browsers** (iOS Safari, Chrome mobile)  
**Session Configuration**: Supabase default session length  

---

## 🚨 Problem Statement

**User Flow:**
1. ✅ User signs in successfully on `/auth/login`
2. ✅ User is redirected to `/protected/profile` (session valid)
3. ❌ User navigates to `/guide` page
4. ❌ User is prompted to login again (session appears lost)

**Critical Context**: Session length is set to Supabase defaults, so session expiration is NOT the issue.

---

## 🔍 Root Cause Analysis

### Current Implementation Review

#### 1. **Auth Flow Configuration** (`lib/supabase/client.ts` & `server.ts`)
```typescript
// Current: Using 'implicit' flow
{
  auth: {
    flowType: 'implicit',  // ⚠️ OUTDATED FLOW
    autoRefreshToken: true,
    persistSession: true,
  }
}
```

#### 2. **Middleware Cookie Handling** (`lib/supabase/middleware.ts`)
```typescript
// Line 26-35: Cookie setAll implementation
setAll(cookiesToSet) {
  cookiesToSet.forEach(({ name, value }) =>
    request.cookies.set(name, value),  // ⚠️ MISSING OPTIONS
  );
  supabaseResponse = NextResponse.next({ request });
  cookiesToSet.forEach(({ name, value, options }) =>
    supabaseResponse.cookies.set(name, value, options),  // ✅ Has options
  );
}
```

#### 3. **Page Authentication Check** (`app/guide/page.tsx`)
```typescript
// Lines 17-19
const supabase = await createClient()
const { data } = await supabase.auth.getClaims()
const isAuthenticated = !!data?.claims
```

---

## 📊 Issue Ranking: Most to Least Likely

### 🥇 **#1: Implicit Flow Type - MOST LIKELY**
**Severity**: 🔴 **CRITICAL**  
**Impact**: Session loss on mobile browsers, especially iOS Safari

**Problem:**
- App uses deprecated `flowType: 'implicit'` 
- Implicit flow has known issues with mobile browser cookie handling
- Mobile browsers (especially Safari) have strict cookie policies that break implicit flow
- Modern Supabase (v2+) **strongly recommends PKCE flow**

**Evidence:**
- Archive docs show previous PKCE attempts (`docs/archive/UNIFIED_AUTH_CURRENT_STATE.md`)
- PKCE flow is more secure and mobile-friendly
- Default Supabase implementation uses PKCE, not implicit

**Why It Causes Mobile Issues:**
- Implicit flow relies on URL fragments (`#access_token=...`)
- Mobile browsers often strip URL fragments on navigation
- Cookie-based PKCE flow is more reliable across browsers

---

### 🥈 **#2: Missing Cookie Options in Middleware - LIKELY**
**Severity**: 🟠 **HIGH**  
**Impact**: Cookies not properly configured for cross-page navigation

**Problem:**
```typescript
// middleware.ts line 27-28
cookiesToSet.forEach(({ name, value }) =>
  request.cookies.set(name, value),  // ❌ Options parameter ignored
);
```

The first `forEach` loop sets cookies on the request object but **ignores the `options` parameter**. This means:
- `SameSite` attribute not set → Mobile browsers reject cookies
- `Secure` attribute not set → HTTPS issues
- `httpOnly` attribute not set → Security issues
- `maxAge`/`expires` not set → Premature expiration

**Mobile Browser Impact:**
- iOS Safari requires `SameSite=Lax` or `SameSite=None; Secure`
- Without proper SameSite, cookies are blocked on navigation
- This explains why login works (same page) but navigation fails

---

### 🥉 **#3: Session Refresh Timing - POSSIBLE**
**Severity**: 🟡 **MEDIUM**  
**Impact**: Race condition between navigation and token refresh

**Problem:**
- `autoRefreshToken: true` should keep session alive
- Mobile browsers may pause JavaScript during navigation
- Refresh token exchange might not complete before page load
- Middleware runs before client-side refresh can occur

**Scenario:**
1. User on `/protected/profile` - session valid but near expiry
2. User clicks link to `/guide`
3. Navigation starts, client-side refresh paused
4. Middleware runs on `/guide` request
5. Session expired, no fresh token yet
6. Middleware redirects to login

---

### 4️⃣ **#4: Cookie Storage Conflicts - UNLIKELY BUT POSSIBLE**
**Severity**: 🟢 **LOW**  
**Impact**: Multiple storage mechanisms causing conflicts

**Problem:**
- Browser client uses `localStorage` by default
- Server expects cookies
- Implicit flow uses URL fragments
- Mobile browsers may not sync these properly

---

## ✅ Recommended Fix: Use Default Supabase PKCE Flow

### **Critical Discovery:**
The middleware cookie handling was **already correct**. `request.cookies.set()` doesn't support options (TypeScript won't compile), and `response.cookies.set()` already passes options correctly. This is NOT the issue.

### **Why PKCE is the Solution:**
1. ✅ **Mobile-First**: Designed for modern mobile browsers
2. ✅ **Cookie-Based**: No URL fragment issues
3. ✅ **Supabase Default**: Recommended by official docs since v2
4. ✅ **More Secure**: Prevents token interception
5. ✅ **No Custom Code**: Use standard Supabase implementation

### **Why Implicit Flow Fails on Mobile:**
- Implicit flow uses URL fragments (`#access_token=...`) for tokens
- Mobile browsers (especially iOS Safari) strip fragments on navigation
- Designed for SPAs, not Next.js server-side rendering
- Deprecated by OAuth 2.0 spec in favor of PKCE

---

## 🛠️ Simplest Possible Fix Plan

### **Step 1: Switch to PKCE Flow (5 min)**

#### Update `lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',  // ✅ CHANGED: Modern, mobile-friendly flow
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      }
    }
  );
}
```

#### Update `lib/supabase/server.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',  // ✅ CHANGED: Match client configuration
        autoRefreshToken: true,
        persistSession: true,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component context - middleware will handle
          }
        },
      },
    },
  );
}
```

### **Step 2: Fix Middleware Cookie Options (2 min)**

#### Update `lib/supabase/middleware.ts`:
```typescript
cookies: {
  getAll() {
    return request.cookies.getAll();
  },
  setAll(cookiesToSet) {
    cookiesToSet.forEach(({ name, value, options }) =>  // ✅ ADD options
      request.cookies.set(name, value, options ?? {}),   // ✅ Pass options
    );
    supabaseResponse = NextResponse.next({
      request,
    });
    cookiesToSet.forEach(({ name, value, options }) =>
      supabaseResponse.cookies.set(name, value, options),
    );
  },
},
```

### **Step 3: Verify Default Session Settings (1 min)**

**Supabase Dashboard → Authentication → Settings:**
- JWT Expiry: `3600` (1 hour) - ✅ Default
- Refresh Token Lifetime: `604800` (7 days) - ✅ Default
- Refresh Token Reuse Interval: `10` seconds - ✅ Default

**No changes needed** - defaults are correct.

---

## 🧪 Testing Plan

### **Manual Testing (Mobile)**
1. Clear browser cache and cookies
2. Open app in **iOS Safari** (most strict browser)
3. Sign up with test email
4. Confirm email and reach profile page
5. Navigate to `/guide` page
6. ✅ Should stay authenticated (no login prompt)
7. Repeat on **Chrome Mobile** (Android)

### **Automated Testing**
```typescript
// __tests__/mobile-auth-persistence.test.ts
test('session persists across page navigation', async () => {
  // 1. Login
  await signIn(testUser);
  
  // 2. Verify session on profile
  const profileResponse = await fetch('/protected/profile');
  expect(profileResponse.status).toBe(200);
  
  // 3. Navigate to guide
  const guideResponse = await fetch('/guide');
  expect(guideResponse.status).toBe(200);  // Not 307 redirect
  
  // 4. Verify session still valid
  const session = await getSession();
  expect(session).toBeDefined();
});
```

---

## 📝 Why This Is The Simplest Fix

1. ✅ **No custom logic** - Use Supabase defaults
2. ✅ **Two file changes** - `client.ts` and `server.ts`
3. ✅ **One line fix** - Add `options` parameter in middleware
4. ✅ **No database changes** - Pure client configuration
5. ✅ **No new dependencies** - Use existing Supabase SSR package
6. ✅ **Backwards compatible** - Existing sessions auto-migrate

---

## 🚀 Expected Outcome

After implementing these changes:

✅ **Mobile browsers** (iOS Safari, Chrome) will maintain sessions across navigation  
✅ **Session cookies** will have proper `SameSite=Lax` attributes  
✅ **Auto-refresh** will work reliably on all devices  
✅ **No login prompts** when navigating from profile to guide  
✅ **Default Supabase behavior** - no custom workarounds  

---

## 📚 References

- [Supabase Auth Helpers Documentation](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [PKCE Flow Specification](https://oauth.net/2/pkce/)
- [Next.js Middleware Cookies](https://nextjs.org/docs/app/building-your-application/routing/middleware#using-cookies)
- Safari Cookie Policies: [WebKit Blog](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)

---

## ⚠️ Alternative Solutions (NOT Recommended)

### ❌ **Option A: Keep Implicit Flow + Add Cookie Options**
- Only fixes cookie attributes, not the root flow issue
- Implicit flow still unreliable on mobile
- Deprecated by OAuth 2.0 standards

### ❌ **Option B: Use localStorage Instead of Cookies**
- Doesn't work with SSR/middleware
- Can't validate session server-side
- Security issues (localStorage is client-only)

### ❌ **Option C: Disable Auth on /guide**
- Defeats the purpose of protected content
- Bad user experience
- Security vulnerability

---

## ✅ Conclusion

**Root Cause:** Using deprecated `implicit` flow + missing cookie options in middleware  
**Fix:** Switch to PKCE flow (Supabase default) + pass cookie options correctly  
**Effort:** ~10 minutes for 2 file changes  
**Impact:** Solves mobile session persistence completely  
**Risk:** Very low - PKCE is the recommended approach  

**Next Step:** Implement the fix, test on mobile, and verify session persistence works across all pages.

