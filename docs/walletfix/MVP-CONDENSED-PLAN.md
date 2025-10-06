# MVP Wallet Fixes - CONDENSED PLAN

**Created:** October 6, 2025
**Status:** Implementation Ready
**Priority:** CRITICAL

---

## 🎯 CRITICAL PATH

User must be able to:
1. ✅ Create wallet (WORKS)
2. ✅ Request USDC from faucet (WORKS but balance update slow)
3. ❌ See past transactions (MISSING - DB exists, no API/UI)
4. ❌ Send USDC to target address (WORKS)
5. ❌ Send ETH to target address (BLOCKED)

---

## 🔧 MINIMAL FIXES REQUIRED

### Fix #1: Transaction History (NEW)
**Status:** Infrastructure exists, need API + UI

**Files to create:**
- `/app/api/wallet/transactions/route.ts` (~40 lines)
- `/components/wallet/TransactionHistory.tsx` (~150 lines)

**Files to modify:**
- `/components/wallet/WalletManager.tsx` (add 3rd tab, ~25 lines changed)

**Why safe:**
- Only ADDS new features
- Doesn't modify existing functionality
- Uses existing DB function `get_wallet_transactions`

---

### Fix #2: Enable ETH Transfers (MODIFY EXISTING)
**Status:** Currently blocked, need to add support

**Files to modify:**
- `/app/api/wallet/transfer/route.ts` (~60 lines added)

**Changes:**
1. Update validation: `z.enum(["usdc"])` → `z.enum(["usdc", "eth"])`
2. Add ETH transfer logic (native transaction, different from ERC-20)
3. Handle gas reserve (0.0001 ETH minimum for gas)

**Why safe:**
- Existing USDC logic untouched
- Adds parallel ETH case with proper gas handling
- All changes within single API route

---

### Fix #3: Balance Polling (FIX BUG)
**Status:** Works but slow/unreliable

**Files to modify:**
- `/components/wallet/FundingPanel.tsx` (~30 lines modified)

**Changes:**
1. Fix recursive setTimeout → proper async/await loop
2. Track previous balance + increase (not absolute amount)
3. Increase poll time to 90 seconds (18 attempts × 5s)
4. Add tolerance (5%) for rounding differences

**Why safe:**
- Only improves reliability
- Doesn't break existing flow
- Backwards compatible

---

## 📦 IMPLEMENTATION ORDER

**Phase 1: Non-Breaking Additions (30 min)**
1. Create `/api/wallet/transactions` endpoint
2. Create `TransactionHistory` component
3. Add history tab to WalletManager

**Phase 2: ETH Transfer Support (20 min)**
4. Update transfer API validation
5. Add ETH transfer logic
6. Test with small amount

**Phase 3: Polish (10 min)**
7. Fix balance polling
8. Add cache-busting headers to balance API

**Total: ~60 minutes of focused work**

---

## ✅ TESTING CHECKLIST (Manual on Production)

### Before ANY commits:
1. [ ] Sign in to https://vercel-supabase-web3.vercel.app
2. [ ] Create new wallet "MVP-Test"
3. [ ] Fund with USDC (verify balance updates)
4. [ ] Fund with ETH (verify balance updates)
5. [ ] View transaction history (2 fund transactions visible)
6. [ ] Send 0.1 USDC to `0x69e95EfB076Da0D2f365eD1f8520AdDa816d647B`
7. [ ] Send 0.001 ETH to `0x69e95EfB076Da0D2f365eD1f8520AdDa816d647B`
8. [ ] Verify both transactions on https://sepolia.basescan.org/
9. [ ] Check transaction history shows all 4 transactions

### Only commit to main if ALL 9 steps pass!

---

## 🚨 CRITICAL CONSTRAINTS

**NON-BREAKING:**
- ✅ No changes to existing wallet creation
- ✅ No changes to existing USDC faucet
- ✅ No changes to existing USDC transfer logic
- ✅ No UI layout breaks (mobile/desktop)
- ✅ No Vercel config changes
- ✅ No dependency changes

**REQUIRED FOR MVP:**
- ✅ User can make USDC faucet request
- ✅ User can see past transactions
- ✅ User can send to target address (both USDC and ETH)

---

## 📝 FILE CHANGES SUMMARY

**New Files (2):**
- `app/api/wallet/transactions/route.ts`
- `components/wallet/TransactionHistory.tsx`

**Modified Files (3):**
- `app/api/wallet/transfer/route.ts` (add ETH support)
- `components/wallet/FundingPanel.tsx` (fix polling)
- `components/wallet/WalletManager.tsx` (add history tab)

**Total: 5 files touched, 2 created, 3 modified**

---

## 🎯 DEFINITION OF DONE

### Must Work:
1. ✅ USDC faucet request completes in <60s
2. ✅ ETH faucet request completes in <60s
3. ✅ Balance updates visible in UI
4. ✅ Transaction history shows all operations
5. ✅ USDC send to `0x69e95EfB076Da0D2f365eD1f8520AdDa816d647B` succeeds
6. ✅ ETH send to `0x69e95EfB076Da0D2f365eD1f8520AdDa816d647B` succeeds
7. ✅ All transactions visible on BaseScan
8. ✅ No console errors
9. ✅ No linter errors
10. ✅ Mobile responsive

---

**THIS PLAN IS: Focused, minimal, non-breaking, testable**

