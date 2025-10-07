# GitHub OAuth Flow Diagram - Before & After Fix

**Project:** DevDapp (devdapp.com)  
**Date:** October 6, 2025

---

## 🔴 BEFORE FIX - Broken Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER: Clicks "Sign in with GitHub"            │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  GitHubLoginButton.tsx                                           │
│  ─────────────────────                                           │
│  • Calls: getRedirectURL('/auth/callback')                      │
│  • getRedirectURL() checks:                                      │
│    1. process.env.NEXT_PUBLIC_APP_URL → ❌ NOT SET              │
│    2. process.env.NEXT_PUBLIC_SITE_URL → ❌ NOT SET             │
│    3. process.env.NEXT_PUBLIC_VERCEL_URL → ❌ NOT SET           │
│    4. window.location.origin → ✅ Returns current URL           │
│                                                                   │
│  • Result depends on how user accessed site:                     │
│    - If user on devdapp.com → Returns: devdapp.com              │
│    - If user on www.devdapp.com → Returns: www.devdapp.com      │
│                                                                   │
│  ❌ INCONSISTENT! Changes based on user's URL                    │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  supabase.auth.signInWithOAuth()                                 │
│  ────────────────────────────────────                            │
│  • Provider: 'github'                                            │
│  • redirectTo: https://www.devdapp.com/auth/callback (example)  │
│  • Redirects user to GitHub                                      │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  GitHub OAuth Authorization                                      │
│  ─────────────────────────────                                   │
│  URL: https://github.com/login/oauth/authorize?                 │
│       client_id=...&                                             │
│       redirect_uri=https://mjrnzgunexmopvnamggw.supabase.co/... │
│       &scope=user:email                                          │
│                                                                   │
│  • User sees: "supabase by gitdevdapp wants access"             │
│  • User clicks: "Authorize"                                      │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  GitHub Redirects to Supabase                                    │
│  ────────────────────────────────                                │
│  URL: https://mjrnzgunexmopvnamggw.supabase.co/auth/v1/callback │
│       ?code=abc123def456...                                      │
│                                                                   │
│  • GitHub sends authorization code to Supabase                   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Supabase Processes OAuth                                        │
│  ────────────────────────────                                    │
│  1. Receives authorization code from GitHub                      │
│  2. Exchanges code for GitHub access token    ✅                │
│  3. Fetches user info from GitHub API         ✅                │
│  4. Creates/updates user in Supabase database ✅                │
│  5. Generates session token                   ✅                │
│                                                                   │
│  ✅ SESSION CREATED IN SUPABASE!                                 │
│     (But user doesn't have it yet)                               │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Supabase Determines Where to Redirect User                      │
│  ──────────────────────────────────────────────                  │
│  • Original request: https://www.devdapp.com/auth/callback      │
│  • Checks allowlist:                                             │
│    - https://devdapp.com/auth/callback       ✅ (in list)       │
│    - https://www.devdapp.com/auth/callback   ❓ (not exact)     │
│    - https://www.devdapp.com/**              ✅ (wildcard)      │
│                                                                   │
│  • Wildcard match is ambiguous                                   │
│  • Supabase falls back to Site URL                               │
│                                                                   │
│  ❌ REDIRECTS TO: https://www.devdapp.com/?code=...              │
│     (Homepage, not /auth/callback!)                              │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  User Lands on Homepage                                          │
│  ─────────────────────────────                                   │
│  URL: https://www.devdapp.com/?code=abc123def456...             │
│                                                                   │
│  app/page.tsx:                                                   │
│  • Shows: Hero, Features, HowItWorks sections                    │
│  • No OAuth code handling logic                                  │
│  • Code parameter is ignored                                     │
│  • User appears logged out                                       │
│                                                                   │
│  ❌ CODE EXPIRES UNUSED (10 minute lifetime)                     │
│  ❌ SESSION EXISTS IN SUPABASE BUT NOT IN BROWSER                │
│  ❌ USER REMAINS LOGGED OUT                                      │
└─────────────────────────────────────────────────────────────────┘

Result: USER FRUSTRATED 😞
```

---

## 🟢 AFTER FIX - Working Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER: Clicks "Sign in with GitHub"            │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  GitHubLoginButton.tsx                                           │
│  ─────────────────────                                           │
│  • Calls: getRedirectURL('/auth/callback')                      │
│  • getRedirectURL() checks:                                      │
│    1. process.env.NEXT_PUBLIC_APP_URL → ✅ "https://devdapp.com"│
│    2. (Doesn't need to check others)                             │
│                                                                   │
│  • ALWAYS returns: https://devdapp.com/auth/callback            │
│                                                                   │
│  ✅ CONSISTENT! Same URL every time                              │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  supabase.auth.signInWithOAuth()                                 │
│  ────────────────────────────────────                            │
│  • Provider: 'github'                                            │
│  • redirectTo: https://devdapp.com/auth/callback                │
│  •             ?next=/protected/profile                          │
│  • Redirects user to GitHub                                      │
│                                                                   │
│  Console Log:                                                    │
│  GitHub OAuth initiated: {                                       │
│    callbackUrl: "https://devdapp.com/auth/callback...",         │
│    finalDestination: "/protected/profile"                        │
│  }                                                                │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  GitHub OAuth Authorization                                      │
│  ─────────────────────────────                                   │
│  URL: https://github.com/login/oauth/authorize?                 │
│       client_id=...&                                             │
│       redirect_uri=https://mjrnzgunexmopvnamggw.supabase.co/... │
│       &scope=user:email                                          │
│                                                                   │
│  • User sees: "supabase by gitdevdapp wants access"             │
│  • User clicks: "Authorize"                                      │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  GitHub Redirects to Supabase                                    │
│  ────────────────────────────────                                │
│  URL: https://mjrnzgunexmopvnamggw.supabase.co/auth/v1/callback │
│       ?code=abc123def456...                                      │
│                                                                   │
│  • GitHub sends authorization code to Supabase                   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Supabase Processes OAuth                                        │
│  ────────────────────────────                                    │
│  1. Receives authorization code from GitHub      ✅             │
│  2. Exchanges code for GitHub access token       ✅             │
│  3. Fetches user info from GitHub API            ✅             │
│  4. Creates/updates user in Supabase database    ✅             │
│  5. Generates session token                      ✅             │
│                                                                   │
│  ✅ SESSION CREATED IN SUPABASE!                                 │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Supabase Determines Where to Redirect User                      │
│  ──────────────────────────────────────────────                  │
│  • Original request: https://devdapp.com/auth/callback          │
│  • Checks allowlist:                                             │
│    - https://devdapp.com/auth/callback       ✅ EXACT MATCH!    │
│                                                                   │
│  ✅ REDIRECTS TO: https://devdapp.com/auth/callback?code=...    │
│     (Correct route!)                                             │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  User Lands on /auth/callback Route                              │
│  ──────────────────────────────────────────                      │
│  URL: https://devdapp.com/auth/callback                         │
│       ?code=abc123def456...                                      │
│       &next=/protected/profile                                   │
│                                                                   │
│  app/auth/callback/route.ts:                                     │
│  ────────────────────────────                                    │
│  1. Extracts code parameter                      ✅             │
│  2. Calls: supabase.auth.exchangeCodeForSession(code)            │
│  3. Receives session with user data              ✅             │
│  4. Sets session cookie in browser               ✅             │
│  5. Extracts 'next' parameter                    ✅             │
│  6. Redirects to: /protected/profile             ✅             │
│                                                                   │
│  Vercel Logs:                                                    │
│  === OAuth Callback Debug ===                                    │
│  Code present: true                                              │
│  ✅ Session exchange successful!                                 │
│  User ID: aebf90ea-7296-49e6-a7cc-176203acd306                  │
│  Provider: github                                                │
│  Redirecting to: https://devdapp.com/protected/profile          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  User Lands on Profile Page                                      │
│  ─────────────────────────────                                   │
│  URL: https://devdapp.com/protected/profile                     │
│                                                                   │
│  • User is authenticated                         ✅             │
│  • Session cookie set in browser                 ✅             │
│  • User info displayed (avatar, email)           ✅             │
│  • Can create CDP wallets                        ✅             │
│  • Session persists across navigation            ✅             │
│                                                                   │
│  ✅ LOGIN SUCCESSFUL!                                            │
└─────────────────────────────────────────────────────────────────┘

Result: USER HAPPY! 😊
```

---

## 🛡️ SAFETY NET - Emergency Handler

In case the main fix doesn't work and user lands on homepage:

```
┌─────────────────────────────────────────────────────────────────┐
│  User Accidentally Lands on Homepage with Code                   │
│  ───────────────────────────────────────────────────             │
│  URL: https://devdapp.com/?code=abc123...                       │
│                                                                   │
│  app/page.tsx:                                                   │
│  • Includes: <OAuthCodeHandler />                                │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  OAuthCodeHandler Component (Client-Side)                        │
│  ─────────────────────────────────────────────                   │
│  useEffect(() => {                                               │
│    const code = searchParams.get('code');                        │
│    if (code) {                                                   │
│      console.warn('⚠️ OAuth code on homepage - misconfigured'); │
│      console.log('Attempting emergency recovery...');            │
│                                                                   │
│      supabase.auth.exchangeCodeForSession(code)                  │
│        .then(({ data, error }) => {                              │
│          if (!error && data?.session) {                          │
│            console.log('✅ Emergency recovery successful');      │
│            router.push('/protected/profile');                    │
│          } else {                                                │
│            router.push('/auth/error?error=...');                 │
│          }                                                        │
│        });                                                        │
│    }                                                              │
│  }, [searchParams]);                                             │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Emergency Code Exchange                                         │
│  ───────────────────────────                                     │
│  • Extracts code from URL                        ✅             │
│  • Exchanges code for session (client-side)      ✅             │
│  • Sets session in browser                       ✅             │
│  • Redirects to profile                          ✅             │
│                                                                   │
│  ⚠️ This is a BACKUP - should not normally trigger               │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  User Lands on Profile Page                                      │
│  ─────────────────────────────                                   │
│  ✅ LOGIN SUCCESSFUL! (via emergency handler)                    │
│  ⚠️ But indicates configuration issue needs fixing               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔑 KEY DIFFERENCES

### Before Fix:
- ❌ `getRedirectURL()` returns inconsistent URLs (www vs non-www)
- ❌ Supabase can't match redirect URL exactly
- ❌ Falls back to Site URL (homepage)
- ❌ Code lands on homepage with no handler
- ❌ Code expires unused
- ❌ User frustrated

### After Fix:
- ✅ `NEXT_PUBLIC_APP_URL` always returns `https://devdapp.com`
- ✅ Consistent redirect URL every time
- ✅ Supabase finds exact match
- ✅ Redirects to `/auth/callback`
- ✅ Code properly exchanged for session
- ✅ User logged in successfully
- ✅ Emergency handler as backup

---

## 📊 URL FLOW COMPARISON

### ❌ Before Fix:
```
1. devdapp.com/auth/login
2. github.com/login/oauth/authorize
3. mjrnzgunexmopvnamggw.supabase.co/auth/v1/callback?code=xxx
4. www.devdapp.com/?code=xxx                              ← WRONG!
   └─ Homepage (no handling)
```

### ✅ After Fix:
```
1. devdapp.com/auth/login
2. github.com/login/oauth/authorize
3. mjrnzgunexmopvnamggw.supabase.co/auth/v1/callback?code=xxx
4. devdapp.com/auth/callback?code=xxx&next=/protected/profile  ← CORRECT!
   └─ Callback route (handles code)
5. devdapp.com/protected/profile
   └─ Profile page (logged in)
```

---

## 🎯 CRITICAL SUCCESS FACTORS

1. **Environment Variable**: `NEXT_PUBLIC_APP_URL=https://devdapp.com`
   - Must be deployed to Vercel
   - Must be in Production environment
   - Requires redeployment to take effect

2. **Supabase Configuration**:
   - Site URL: `https://devdapp.com`
   - Redirect URLs include: `https://devdapp.com/auth/callback`
   - Exact match required (wildcards alone insufficient)

3. **Callback Route**: `app/auth/callback/route.ts`
   - Must extract `code` parameter
   - Must call `exchangeCodeForSession(code)`
   - Must redirect to intended destination

4. **Emergency Handler**: `OAuthCodeHandler` component
   - Safety net if user lands on homepage
   - Catches and processes orphaned codes
   - Should not normally trigger

---

*Flow Diagram Version: 1.0*  
*Last Updated: October 6, 2025*


