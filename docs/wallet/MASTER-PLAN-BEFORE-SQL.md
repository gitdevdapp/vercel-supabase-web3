# 🔐 MASTER IMPLEMENTATION PLAN - BEFORE SQL

**Purpose**: Complete guide for all steps required BEFORE running the SQL script  
**Critical**: SQL script will BREAK wallet if these steps are skipped  
**Time Required**: 1.5 hours  
**Status**: ✅ Authentication flows 99.9% safe

---

## 🎯 OBJECTIVE

Add authentication protection to wallet system to prevent breaking changes when SQL is executed.

**Why this matters:**
- Current wallet has NO authentication
- SQL implementation requires authentication
- Running SQL before code changes = complete wallet failure

---

## ⚠️ CRITICAL UNDERSTANDING

### What's Safe ✅
- **Email/password login** - Completely unaffected
- **Email confirmation** - Completely unaffected  
- **Password reset** - Completely unaffected
- **GitHub OAuth** - Completely unaffected
- **Profile system** - Completely unaffected
- **All auth flows** - Zero risk

### What Will Break 🔴
- **Wallet page** - Currently public, needs auth guard
- **Wallet APIs** - Currently public, need auth checks
- **Frontend** - No 401 handling, needs error management

---

## 📋 IMPLEMENTATION STEPS

### STEP 1: Protect Wallet Page (15 minutes)

**File**: `app/wallet/page.tsx`

**Add imports:**
```typescript
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
```

**Change function to async and add auth check:**
```typescript
export default async function WalletPage() {
  // 🔒 AUTHENTICATION CHECK
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirectTo=/wallet");
  }

  // ... rest of existing code
}
```

**Test:**
```bash
# Logout, then try /wallet → Should redirect to /sign-in ✅
```

---

### STEP 2: Protect API Routes (40 minutes)

Apply this pattern to ALL wallet API routes:

**Files to update:**
- `app/api/wallet/create/route.ts`
- `app/api/wallet/fund/route.ts`
- `app/api/wallet/transfer/route.ts`
- `app/api/wallet/list/route.ts`

**Add to imports:**
```typescript
import { createClient } from "@/lib/supabase/server";
```

**Add at start of each POST/GET handler:**
```typescript
export async function POST(request: NextRequest) {
  try {
    // 🔒 AUTHENTICATION CHECK
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // ... rest of existing logic
  } catch (error) {
    // ... existing error handling
  }
}
```

**Test each route:**
```bash
curl -X POST http://localhost:3000/api/wallet/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","type":"custom"}'
# Expected: 401 Unauthorized ✅
```

---

### STEP 3: Add Frontend Error Handling (30 minutes)

**Files to update:**
- `components/wallet/WalletManager.tsx`
- `components/wallet/FundingPanel.tsx`
- `components/wallet/USDCTransferPanel.tsx`

**Add helper function to each component:**
```typescript
// Add after state declarations
const handleApiError = (response: Response) => {
  if (response.status === 401) {
    window.location.href = '/sign-in?redirectTo=/wallet';
    return true;
  }
  return false;
};
```

**Update fetch calls:**
```typescript
const response = await fetch('/api/wallet/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, type })
});

// Add this check
if (handleApiError(response)) {
  return;
}

if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.error || "Operation failed");
}
```

---

### STEP 4: Build & Deploy (15 minutes)

```bash
# 1. Build locally
npm run build
# Must succeed with no errors ✅

# 2. Test locally
npm run dev
# Test: Logout → /wallet → Should redirect ✅
# Test: Login → /wallet → Should work ✅

# 3. Commit changes
git add .
git commit -m "feat: add authentication protection to wallet system"

# 4. Deploy to production
git push origin main

# 5. Verify Vercel deployment succeeds ✅

# 6. Test production
# Logout → /wallet → Redirects to login ✅
# Login → /wallet → Shows wallet page ✅
```

---

## ✅ COMPLETION CHECKLIST

Before proceeding to SQL, verify ALL items:

### Code Changes
- [ ] `app/wallet/page.tsx` - Auth guard added
- [ ] `app/api/wallet/create/route.ts` - Auth check added
- [ ] `app/api/wallet/fund/route.ts` - Auth check added
- [ ] `app/api/wallet/transfer/route.ts` - Auth check added
- [ ] `app/api/wallet/list/route.ts` - Auth check added
- [ ] `components/wallet/WalletManager.tsx` - 401 handler added
- [ ] `components/wallet/FundingPanel.tsx` - 401 handler added
- [ ] `components/wallet/USDCTransferPanel.tsx` - 401 handler added

### Testing
- [ ] `npm run build` succeeds
- [ ] Local testing passes
- [ ] Deployed to production
- [ ] Vercel deployment succeeds
- [ ] Production: Logout → /wallet redirects
- [ ] Production: Login → /wallet works

### Verification
- [ ] All API routes return 401 when not authenticated
- [ ] Frontend redirects to login on 401
- [ ] No build errors
- [ ] No runtime errors
- [ ] Email auth still works ✅
- [ ] Profile system still works ✅

---

## 🔍 VERIFICATION TESTS

### Test 1: Authentication Protection
```bash
# Test wallet page (logged out)
# Expected: Redirect to /sign-in

# Test API routes (no auth)
curl -X POST http://localhost:3000/api/wallet/create \
  -H "Content-Type: application/json" \
  -d '{}'
# Expected: 401 Unauthorized
```

### Test 2: Auth Flows Still Work
1. Sign up new user → Email confirmation works ✅
2. Login with email → Works ✅
3. Password reset → Works ✅
4. Profile creation → Works ✅

### Test 3: Wallet Requires Auth
1. Logout
2. Access /wallet → Redirects to login ✅
3. Login
4. Access /wallet → Shows wallet page ✅

---

## 🚨 TROUBLESHOOTING

### Build fails
**Cause**: Import errors or async syntax issues  
**Fix**: Check all imports are correct, functions are async

### API returns 500 instead of 401
**Cause**: Auth check not at start of function  
**Fix**: Move auth check to very first thing in handler

### Frontend doesn't redirect
**Cause**: handleApiError not called or incorrect  
**Fix**: Ensure it's called after every fetch, before checking response.ok

### Tests show wallet page still public
**Cause**: Page not async or redirect not executed  
**Fix**: Ensure function is `async` and redirect is before return

---

## 🎯 SUCCESS CRITERIA

You are ready for SQL when:

✅ **All code changes complete**  
✅ **All tests passing**  
✅ **Build succeeds**  
✅ **Production deployed**  
✅ **Wallet requires authentication**  
✅ **Auth flows unaffected**

---

## ⏭️ NEXT STEPS

**After completing this plan:**

1. ✅ Verify all checklist items complete
2. ✅ Confirm production deployment works
3. ✅ Test wallet requires authentication
4. ➡️ Proceed to: `MASTER-PLAN-AFTER-SQL.md`
5. ➡️ Run SQL script in Supabase
6. ➡️ Integrate database storage

---

## 📊 TIME BREAKDOWN

| Step | Task | Time |
|------|------|------|
| 1 | Protect wallet page | 15 min |
| 2 | Protect API routes | 40 min |
| 3 | Frontend error handling | 30 min |
| 4 | Build & deploy | 15 min |
| **Total** | | **1.5 hours** |

---

## 🔒 SAFETY CONFIRMATION

**Authentication flows:** ✅ **ZERO RISK**
- This plan adds NEW authentication checks
- ZERO modifications to existing auth
- Auth system completely protected

**Wallet system:** ✅ **CONTROLLED CHANGES**
- Adds authentication protection
- Prevents unauthorized access
- Prepares for database integration

**Risk level:** 🟢 **LOW**
- Changes are additive only
- Rollback available via git revert
- Auth flows guaranteed safe

---

**Version**: 1.0  
**Date**: October 2, 2025  
**Next**: MASTER-PLAN-AFTER-SQL.md  
**Estimated Time**: 1.5 hours

