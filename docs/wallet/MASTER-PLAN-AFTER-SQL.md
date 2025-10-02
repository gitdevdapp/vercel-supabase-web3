# 💾 MASTER IMPLEMENTATION PLAN - AFTER SQL

**Purpose**: Complete guide for database integration after SQL script execution  
**Prerequisites**: MASTER-PLAN-BEFORE-SQL.md fully completed ✅  
**Time Required**: 3 hours  
**Status**: Ready to execute

---

## 🎯 OBJECTIVE

Integrate Supabase database storage with wallet operations for:
- User wallet ownership tracking
- Complete transaction audit trail
- Row-level security enforcement
- Transaction history queries

---

## 📋 PHASE 1: RUN SQL SCRIPT (5 minutes)

### Step 1: Execute SQL in Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → Your Project
2. Navigate to **SQL Editor** → **New Query**
3. Open file: `docs/wallet/CDP-WALLET-SETUP.sql`
4. Copy **ENTIRE file** contents (Cmd/Ctrl+A, Cmd/Ctrl+C)
5. Paste into Supabase SQL Editor
6. Click **Run** ▶️

**Expected Success Output:**
```
status: "Setup Complete"
tables_created: 2
rls_policies: 6
helper_functions: 3
```

---

### Step 2: Verify Database Setup

**Run verification query:**
```sql
SELECT 
  table_name,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = table_name) as policies
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_wallets', 'wallet_transactions');
```

**Expected Output:**
```
user_wallets          | 4
wallet_transactions   | 2
```

**Verify helper functions:**
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%wallet%';
```

**Expected: 3 functions**
- `get_user_wallet`
- `get_wallet_transactions`
- `log_wallet_operation`

---

### Step 3: Test RLS Policies

```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_wallets', 'wallet_transactions');

-- Expected: Both tables show rowsecurity = true
```

✅ **Database setup complete!**

---

## 📋 PHASE 2: INTEGRATE DATABASE STORAGE (2.5 hours)

### STEP 1: Update Wallet Creation API (30 minutes)

**File**: `app/api/wallet/create/route.ts`

**After CDP wallet creation, add database storage:**

```typescript
// After account is created...
const account = await cdp.evm.getOrCreateAccount({ name });

// 💾 STORE IN DATABASE
const { data: wallet, error: dbError } = await supabase
  .from('user_wallets')
  .insert({
    user_id: user.id,
    wallet_address: account.address,
    wallet_name: name,
    network: 'base-sepolia'
  })
  .select()
  .single();

if (dbError) {
  console.error('Failed to save wallet:', dbError);
  return NextResponse.json(
    { error: 'Failed to save wallet to database' },
    { status: 500 }
  );
}

// 📝 LOG WALLET CREATION
await supabase.rpc('log_wallet_operation', {
  p_user_id: user.id,
  p_wallet_id: wallet.id,
  p_operation_type: 'create',
  p_token_type: 'eth',
  p_status: 'success'
});

// Return wallet info
return NextResponse.json({
  wallet_address: wallet.wallet_address,
  wallet_id: wallet.id,
  wallet_name: wallet.wallet_name,
  network: wallet.network
}, { status: 201 });
```

**Test:**
```bash
# Create wallet via API (authenticated)
# Then verify in Supabase:
SELECT * FROM user_wallets ORDER BY created_at DESC LIMIT 1;
# Should see newly created wallet ✅
```

---

### STEP 2: Update Faucet Funding API (30 minutes)

**File**: `app/api/wallet/fund/route.ts`

**Add wallet ownership verification:**

```typescript
const { address, token } = validation.data;

// 🔒 VERIFY WALLET OWNERSHIP
const { data: wallet, error: walletError } = await supabase
  .from('user_wallets')
  .select('*')
  .eq('wallet_address', address)
  .eq('user_id', user.id)
  .single();

if (walletError || !wallet) {
  return NextResponse.json(
    { error: 'Wallet not found or you do not own this wallet' },
    { status: 404 }
  );
}

// Request faucet (existing code)
const { transactionHash } = await cdp.evm.requestFaucet({
  address,
  network,
  token: token.toLowerCase() as "usdc" | "eth",
});

// Wait for confirmation (existing code)
const tx = await publicClient.waitForTransactionReceipt({
  hash: transactionHash,
});

// 📝 LOG TRANSACTION
await supabase.rpc('log_wallet_operation', {
  p_user_id: user.id,
  p_wallet_id: wallet.id,
  p_operation_type: 'fund',
  p_token_type: token,
  p_amount: token === 'eth' ? 0.001 : 1.0,
  p_to_address: address,
  p_tx_hash: transactionHash,
  p_status: tx.status === 'success' ? 'success' : 'failed'
});

return NextResponse.json({
  transactionHash,
  status: tx.status,
  explorerUrl: `https://sepolia.basescan.org/tx/${transactionHash}`
});
```

**Test:**
```bash
# Fund wallet via API
# Verify in Supabase:
SELECT * FROM wallet_transactions ORDER BY created_at DESC LIMIT 1;
# Should see fund operation logged ✅
```

---

### STEP 3: Update Transfer API (45 minutes)

**File**: `app/api/wallet/transfer/route.ts`

**Add ownership verification and transaction logging:**

```typescript
const { fromAddress, toAddress, amount, token } = await request.json();

// 🔒 VERIFY WALLET OWNERSHIP
const { data: wallet, error: walletError } = await supabase
  .from('user_wallets')
  .select('*')
  .eq('wallet_address', fromAddress)
  .eq('user_id', user.id)
  .single();

if (walletError || !wallet) {
  return NextResponse.json(
    { error: 'Wallet not found or you do not own this wallet' },
    { status: 404 }
  );
}

try {
  // Execute transfer (existing CDP code)
  const result = await account.createTransaction({...}).submit();

  // 📝 LOG SUCCESS
  await supabase.rpc('log_wallet_operation', {
    p_user_id: user.id,
    p_wallet_id: wallet.id,
    p_operation_type: 'send',
    p_token_type: token,
    p_amount: amount,
    p_from_address: fromAddress,
    p_to_address: toAddress,
    p_tx_hash: result.transactionHash,
    p_status: 'success'
  });

  return NextResponse.json({
    transactionHash: result.transactionHash,
    status: 'success'
  });

} catch (error) {
  // 📝 LOG FAILURE
  await supabase.rpc('log_wallet_operation', {
    p_user_id: user.id,
    p_wallet_id: wallet.id,
    p_operation_type: 'send',
    p_token_type: token,
    p_amount: amount,
    p_from_address: fromAddress,
    p_to_address: toAddress,
    p_status: 'failed',
    p_error_message: error instanceof Error ? error.message : 'Unknown error'
  });

  return NextResponse.json(
    { error: error.message },
    { status: 500 }
  );
}
```

**Test:**
```bash
# Transfer funds via API
# Verify both success and failure are logged:
SELECT * FROM wallet_transactions 
WHERE operation_type = 'send' 
ORDER BY created_at DESC LIMIT 5;
```

---

### STEP 4: Update Wallet List API (45 minutes)

**File**: `app/api/wallet/list/route.ts`

**Replace with database-backed implementation:**

```typescript
import { createClient } from "@/lib/supabase/server";
import { createPublicClient, http } from "viem";
import { getChainSafe } from "@/lib/accounts";

const USDC_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
] as const;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 📖 QUERY FROM DATABASE
    const { data: userWallets, error: dbError } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (dbError) {
      return NextResponse.json(
        { error: 'Failed to fetch wallets' },
        { status: 500 }
      );
    }

    if (!userWallets || userWallets.length === 0) {
      return NextResponse.json({ wallets: [] });
    }

    // 💰 ENRICH WITH BLOCKCHAIN BALANCES
    const publicClient = createPublicClient({
      chain: getChainSafe(),
      transport: http(),
    });

    const walletsWithBalances = await Promise.all(
      userWallets.map(async (wallet) => {
        try {
          const ethBalance = await publicClient.getBalance({
            address: wallet.wallet_address as `0x${string}`
          });

          const usdcBalance = await publicClient.readContract({
            address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as `0x${string}`,
            abi: USDC_ABI,
            functionName: 'balanceOf',
            args: [wallet.wallet_address as `0x${string}`]
          });

          return {
            address: wallet.wallet_address,
            name: wallet.wallet_name,
            type: 'custom',
            balances: {
              eth: Number(ethBalance) / 1e18,
              usdc: Number(usdcBalance) / 1_000_000
            },
            created_at: wallet.created_at
          };
        } catch (error) {
          return {
            address: wallet.wallet_address,
            name: wallet.wallet_name,
            type: 'custom',
            balances: { eth: 0, usdc: 0 },
            error: 'Failed to fetch balance'
          };
        }
      })
    );

    return NextResponse.json({
      wallets: walletsWithBalances,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to list wallets' },
      { status: 500 }
    );
  }
}
```

**Test:**
```bash
# List wallets via API
# Should return wallets from database with live balances ✅
```

---

### STEP 5: Build & Deploy (30 minutes)

```bash
# 1. Build locally
npm run build
# Must succeed ✅

# 2. Commit changes
git add .
git commit -m "feat: integrate wallet database storage and transaction logging"

# 3. Deploy to production
git push origin main

# 4. Wait for Vercel deployment ✅
```

---

## 📋 PHASE 3: PRODUCTION TESTING (30 minutes)

### Test 1: Complete User Flow

**On production site:**

1. **Create new test user**
   - Sign up with email
   - Confirm email → ✅ Works
   - Login → ✅ Works

2. **Create wallet**
   - Navigate to /wallet
   - Create new wallet
   - **Verify in Supabase:**
     ```sql
     SELECT * FROM user_wallets ORDER BY created_at DESC LIMIT 1;
     ```
   - Should see wallet ✅

3. **Fund wallet (ETH)**
   - Request faucet
   - **Verify transaction logged:**
     ```sql
     SELECT * FROM wallet_transactions 
     WHERE operation_type = 'fund' 
     ORDER BY created_at DESC LIMIT 1;
     ```
   - Should see fund operation ✅

4. **Fund wallet (USDC)**
   - Request USDC faucet
   - Verify second transaction logged ✅

5. **Transfer funds**
   - Send USDC to another address
   - **Verify transfer logged:**
     ```sql
     SELECT * FROM wallet_transactions 
     WHERE operation_type = 'send' 
     ORDER BY created_at DESC LIMIT 1;
     ```
   - Should see transfer ✅

---

### Test 2: Security Verification

**Create two test users:**

1. **User A:**
   - Create wallet
   - Note wallet address
   - Logout

2. **User B:**
   - Sign up and login
   - Try to fund User A's wallet → Should fail ✅
   - Try to transfer from User A's wallet → Should fail ✅
   - Check wallet list → Should NOT see User A's wallet ✅

**Verify in Supabase:**
```sql
-- Login as User B, run this
-- Should only see User B's wallets
SELECT * FROM user_wallets;

-- Should only see User B's transactions
SELECT * FROM wallet_transactions;
```

✅ **RLS is working correctly!**

---

### Test 3: Database Queries

**Verify complete setup:**

```sql
-- 1. Check all wallets with user info
SELECT 
  uw.wallet_address,
  uw.wallet_name,
  uw.network,
  u.email,
  uw.created_at
FROM user_wallets uw
JOIN auth.users u ON u.id = uw.user_id
ORDER BY uw.created_at DESC
LIMIT 10;

-- 2. Check all transactions with user info
SELECT 
  wt.operation_type,
  wt.token_type,
  wt.amount,
  wt.status,
  wt.tx_hash,
  u.email,
  wt.created_at
FROM wallet_transactions wt
JOIN auth.users u ON u.id = wt.user_id
ORDER BY wt.created_at DESC
LIMIT 20;

-- 3. Check user wallet summary
SELECT 
  u.email,
  COUNT(DISTINCT uw.id) as wallet_count,
  COUNT(wt.id) as transaction_count
FROM auth.users u
LEFT JOIN user_wallets uw ON uw.user_id = u.id
LEFT JOIN wallet_transactions wt ON wt.user_id = u.id
GROUP BY u.id, u.email
ORDER BY wallet_count DESC;

-- 4. Test helper functions
SELECT * FROM public.get_user_wallet(auth.uid());

SELECT * FROM public.get_wallet_transactions(
  (SELECT id FROM user_wallets WHERE user_id = auth.uid() LIMIT 1),
  50
);
```

---

## ✅ COMPLETION CHECKLIST

### Database Setup
- [ ] SQL script executed in Supabase
- [ ] Verification query shows 2 tables, 6 policies
- [ ] Helper functions created (3 total)
- [ ] RLS policies tested and working

### API Integration
- [ ] `/api/wallet/create` stores in `user_wallets`
- [ ] `/api/wallet/create` logs to `wallet_transactions`
- [ ] `/api/wallet/fund` verifies ownership
- [ ] `/api/wallet/fund` logs transactions
- [ ] `/api/wallet/transfer` verifies ownership
- [ ] `/api/wallet/transfer` logs success
- [ ] `/api/wallet/transfer` logs failures
- [ ] `/api/wallet/list` queries from database
- [ ] `/api/wallet/list` enriches with balances

### Production Testing
- [ ] Email signup works ✅
- [ ] Email confirmation works ✅
- [ ] Email login works ✅
- [ ] Wallet creation stores in DB
- [ ] Faucet requests log transactions
- [ ] Transfers log transactions
- [ ] RLS prevents cross-user access
- [ ] All database queries work
- [ ] Helper functions work
- [ ] Build succeeds
- [ ] Deployment succeeds

---

## 🔍 DATABASE VERIFICATION QUERIES

### Quick Status Check
```sql
-- Verify setup
SELECT 
  'Setup Complete' as status,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('user_wallets', 'wallet_transactions')) as tables,
  (SELECT COUNT(*) FROM pg_policies 
   WHERE schemaname = 'public' 
   AND tablename IN ('user_wallets', 'wallet_transactions')) as policies,
  (SELECT COUNT(*) FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name LIKE '%wallet%') as functions;

-- Expected: tables: 2, policies: 6, functions: 3
```

### Data Integrity Check
```sql
-- Check for orphaned records (should be 0)
SELECT COUNT(*) as orphaned_transactions
FROM wallet_transactions wt
LEFT JOIN user_wallets uw ON uw.id = wt.wallet_id
WHERE uw.id IS NULL;

-- Check RLS enforcement
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('user_wallets', 'wallet_transactions')
ORDER BY tablename, policyname;
```

---

## 🚨 TROUBLESHOOTING

### Issue: SQL script fails
**Cause**: Tables already exist or permissions issue  
**Fix**: Script is idempotent - safe to re-run. If permission denied, need DB owner access

### Issue: Wallet creation doesn't store in DB
**Cause**: Database insert failing  
**Check**: Supabase logs for error details  
**Fix**: Verify user.id is valid, check RLS policies

### Issue: Transaction logging fails
**Cause**: wallet_id not found or invalid  
**Check**: Verify wallet exists in user_wallets first  
**Fix**: Ensure wallet is created before logging operations

### Issue: Users can see other users' data
**Cause**: RLS not enabled or policies incorrect  
**Check**: Run RLS verification query  
**Fix**: Re-run SQL script to ensure policies are created

### Issue: Helper functions don't work
**Cause**: Function not created or permissions issue  
**Check**: Verify functions exist in pg_routines  
**Fix**: Re-run SQL script to create functions

---

## 📊 SUCCESS METRICS

**After completion, you should have:**

✅ **2 database tables** with proper schemas  
✅ **6 RLS policies** enforcing data isolation  
✅ **3 helper functions** for common operations  
✅ **Complete audit trail** of all wallet operations  
✅ **Ownership verification** on all operations  
✅ **Transaction logging** for all operations  
✅ **Auth flows** completely unaffected  
✅ **Production tested** and verified

---

## 🎯 FINAL VERIFICATION

Run this comprehensive check:

```sql
-- FINAL SYSTEM CHECK
SELECT 
  '1. Tables Created' as check_type,
  COUNT(*)::text as result
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_wallets', 'wallet_transactions')
HAVING COUNT(*) = 2

UNION ALL

SELECT 
  '2. RLS Policies Active',
  COUNT(*)::text
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('user_wallets', 'wallet_transactions')
HAVING COUNT(*) = 6

UNION ALL

SELECT 
  '3. Helper Functions',
  COUNT(*)::text
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('get_user_wallet', 'get_wallet_transactions', 'log_wallet_operation')
HAVING COUNT(*) = 3;
```

**Expected: 3 rows, all checks passing ✅**

---

## 🚀 ROLLBACK PROCEDURE

**If you need to rollback (DESTRUCTIVE):**

```sql
-- 1. BACKUP DATA FIRST!
COPY public.user_wallets TO '/tmp/user_wallets_backup.csv' CSV HEADER;
COPY public.wallet_transactions TO '/tmp/wallet_transactions_backup.csv' CSV HEADER;

-- 2. DROP ALL WALLET OBJECTS
DROP TABLE IF EXISTS public.wallet_transactions CASCADE;
DROP TABLE IF EXISTS public.user_wallets CASCADE;
DROP FUNCTION IF EXISTS public.get_user_wallet CASCADE;
DROP FUNCTION IF EXISTS public.get_wallet_transactions CASCADE;
DROP FUNCTION IF EXISTS public.log_wallet_operation CASCADE;
DROP FUNCTION IF EXISTS public.update_wallet_timestamp CASCADE;

-- 3. Verify cleanup
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%wallet%';
-- Should return 0 rows
```

**Code rollback:**
```bash
git revert HEAD
git push origin main
```

---

## 🎊 SUCCESS!

### What You've Achieved:

✅ **Secure Wallet System**
- Users can create authenticated wallets
- All wallets stored in Supabase
- Complete ownership tracking

✅ **Transaction Audit Trail**
- All operations logged
- Success and failure tracking
- Complete transaction history

✅ **Data Security**
- Row-level security enforced
- Users can only access own data
- Ownership verified on all operations

✅ **Production Ready**
- Fully tested and verified
- Auth flows unaffected
- Database integrated

### System Capabilities:

- 🔐 Authenticated wallet creation
- 💾 Persistent wallet storage
- 📊 Complete transaction logging
- 🔒 Row-level security
- 📈 Transaction history queries
- ✅ Ownership verification
- 🧪 Production tested

---

**Version**: 1.0  
**Date**: October 2, 2025  
**Status**: Complete  
**Total Time**: ~3 hours

