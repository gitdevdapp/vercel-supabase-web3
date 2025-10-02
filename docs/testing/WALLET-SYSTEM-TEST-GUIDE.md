# 🧪 Wallet System Testing Guide

**Last Updated**: October 2, 2025  
**Purpose**: Complete manual testing guide for CDP wallet system  
**Environment**: Production (mjr deployment)

---

## 📋 PRE-TEST CHECKLIST

### Environment Variables
Verify these are set in Vercel/Production:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key  
- [ ] `CDP_API_KEY_NAME` - Coinbase CDP API key name
- [ ] `CDP_API_KEY_PRIVATE_KEY` - Coinbase CDP private key

### Database Setup
Verify these exist in Supabase SQL Editor:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_wallets', 'wallet_transactions');
-- Should return: user_wallets, wallet_transactions

-- Check RLS policies
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('user_wallets', 'wallet_transactions');
-- Should return 6 policies total

-- Check helper functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%wallet%';
-- Should return: get_user_wallet, get_wallet_transactions, log_wallet_operation
```

---

## 🎯 TEST SCENARIO 1: NEW USER SIGNUP & EMAIL CONFIRMATION

### Steps:

1. **Create New User**
   - [ ] Go to production URL: `https://your-prod-url.com`
   - [ ] Click "Sign Up"
   - [ ] Enter email: `test-wallet-user-${timestamp}@example.com`
   - [ ] Enter password: `SecurePass123!`
   - [ ] Submit form

2. **Email Confirmation**
   - [ ] Check email inbox for confirmation link
   - [ ] Click confirmation link
   - [ ] Verify redirect to `/auth/callback`
   - [ ] Verify redirect to `/protected/profile`
   - [ ] Confirm user is logged in

3. **Verify in Database**
   ```sql
   -- Check user exists and is confirmed
   SELECT id, email, email_confirmed_at, created_at 
   FROM auth.users 
   WHERE email = 'test-wallet-user-${timestamp}@example.com';
   ```
   - [ ] User exists in `auth.users`
   - [ ] `email_confirmed_at` is NOT NULL
   - [ ] Profile created in `user_profiles`

**Expected Result**: ✅ User created, email confirmed, logged in

---

## 🎯 TEST SCENARIO 2: WALLET CREATION

### Steps:

1. **Access Profile Page**
   - [ ] Navigate to `/protected/profile`
   - [ ] Verify "My Wallet" card is visible
   - [ ] Verify "No Wallet Yet" message shown

2. **Create Wallet**
   - [ ] Enter wallet name: `My Test Wallet`
   - [ ] Click "Create Wallet" button
   - [ ] Wait for creation (2-5 seconds)
   - [ ] Verify success message appears

3. **Verify Wallet Display**
   - [ ] Wallet address shown (starts with `0x`)
   - [ ] Wallet name shown: "My Test Wallet"
   - [ ] ETH Balance: 0.0000 ETH
   - [ ] USDC Balance: 0.00 USDC
   - [ ] Status: "Connected to Base Sepolia Testnet"
   - [ ] Copy address button works

4. **Verify in Database**
   ```sql
   -- Check wallet created
   SELECT * FROM user_wallets 
   WHERE wallet_name = 'My Test Wallet' 
   ORDER BY created_at DESC LIMIT 1;
   
   -- Check creation logged
   SELECT * FROM wallet_transactions 
   WHERE operation_type = 'create' 
   ORDER BY created_at DESC LIMIT 1;
   ```
   - [ ] Wallet exists in `user_wallets`
   - [ ] `is_active = true`
   - [ ] Network is `base-sepolia`
   - [ ] Creation logged in `wallet_transactions`
   - [ ] Transaction status is `success`

**Expected Result**: ✅ Wallet created, stored in DB, visible in UI

---

## 🎯 TEST SCENARIO 3: REQUEST TESTNET ETH

### Steps:

1. **Request ETH**
   - [ ] Click "Request Testnet Funds" button
   - [ ] Select "ETH (0.001)" option
   - [ ] Click "Request ETH" button
   - [ ] Wait for confirmation (30-60 seconds)
   - [ ] Verify success message with TX hash

2. **Verify Balance Update**
   - [ ] ETH balance updates to ~0.001 ETH
   - [ ] Balance shows within 5 seconds
   - [ ] Explorer link is clickable

3. **Verify Transaction on BaseScan**
   - [ ] Click explorer URL
   - [ ] Verify transaction exists on BaseScan
   - [ ] Verify status: Success
   - [ ] Verify amount: 0.001 ETH

4. **Verify in Database**
   ```sql
   -- Check ETH funding logged
   SELECT * FROM wallet_transactions 
   WHERE operation_type = 'fund' 
   AND token_type = 'eth'
   ORDER BY created_at DESC LIMIT 1;
   ```
   - [ ] Transaction logged with `operation_type = 'fund'`
   - [ ] `token_type = 'eth'`
   - [ ] `amount = 0.001`
   - [ ] `status = 'success'`
   - [ ] `tx_hash` is present and valid

**Expected Result**: ✅ ETH received, balance updated, transaction logged

---

## 🎯 TEST SCENARIO 4: REQUEST TESTNET USDC

### Steps:

1. **Request USDC**
   - [ ] Click "Request Testnet Funds" button
   - [ ] Select "USDC (1.0)" option
   - [ ] Click "Request USDC" button
   - [ ] Wait for confirmation (30-60 seconds)
   - [ ] Verify success message with TX hash

2. **Verify Balance Update**
   - [ ] USDC balance updates to 1.00 USDC
   - [ ] Balance shows within 5 seconds
   - [ ] Explorer link is clickable

3. **Verify Transaction on BaseScan**
   - [ ] Click explorer URL
   - [ ] Verify transaction exists
   - [ ] Verify status: Success
   - [ ] Verify USDC transfer (1.0 USDC)

4. **Verify in Database**
   ```sql
   -- Check USDC funding logged
   SELECT * FROM wallet_transactions 
   WHERE operation_type = 'fund' 
   AND token_type = 'usdc'
   ORDER BY created_at DESC LIMIT 1;
   ```
   - [ ] Transaction logged correctly
   - [ ] `token_type = 'usdc'`
   - [ ] `amount = 1.0`
   - [ ] `status = 'success'`

**Expected Result**: ✅ USDC received, balance updated, transaction logged

---

## 🎯 TEST SCENARIO 5: CREATE SECOND USER & WALLET

### Steps:

1. **Logout Current User**
   - [ ] Click logout button
   - [ ] Verify redirect to home page

2. **Create Second User**
   - [ ] Sign up with: `test-wallet-user-2-${timestamp}@example.com`
   - [ ] Confirm email
   - [ ] Login successfully

3. **Create Second Wallet**
   - [ ] Go to `/protected/profile`
   - [ ] Create wallet: "User 2 Wallet"
   - [ ] Verify wallet created
   - [ ] Copy wallet address for later

4. **Fund Second Wallet** (for receiving test)
   - [ ] Request 0.001 ETH (for gas)
   - [ ] Wait for confirmation

**Expected Result**: ✅ Second user and wallet ready for transfer testing

---

## 🎯 TEST SCENARIO 6: USDC TRANSFER BETWEEN WALLETS

### Steps:

1. **Login as User 1**
   - [ ] Logout User 2
   - [ ] Login as original test user
   - [ ] Go to `/protected/profile`

2. **Initiate Transfer**
   - [ ] Click "Send Funds" button
   - [ ] Enter recipient address (User 2 wallet address)
   - [ ] Enter amount: `0.25`
   - [ ] Select "USDC" token
   - [ ] Click "Send USDC" button

3. **Verify Transaction**
   - [ ] Wait for confirmation (15-30 seconds)
   - [ ] Verify success message
   - [ ] Check TX hash in explorer
   - [ ] Verify User 1 balance decreased (~0.75 USDC)

4. **Verify Recipient Received**
   - [ ] Logout User 1
   - [ ] Login as User 2
   - [ ] Go to `/protected/profile`
   - [ ] Verify USDC balance increased (0.25 USDC)

5. **Verify in Database**
   ```sql
   -- Check transfer logged for sender
   SELECT * FROM wallet_transactions 
   WHERE operation_type = 'send'
   AND token_type = 'usdc'
   ORDER BY created_at DESC LIMIT 1;
   ```
   - [ ] Transfer logged with `operation_type = 'send'`
   - [ ] Correct `from_address` (User 1)
   - [ ] Correct `to_address` (User 2)
   - [ ] `amount = 0.25`
   - [ ] `status = 'success'`

**Expected Result**: ✅ USDC transferred successfully, both balances updated

---

## 🎯 TEST SCENARIO 7: SECURITY & RLS TESTING

### Steps:

1. **Test RLS Protection**
   ```sql
   -- Login as User 2, try to access User 1's wallet
   SELECT * FROM user_wallets; 
   -- Should ONLY show User 2's wallets
   
   -- Try to access User 1's transactions
   SELECT * FROM wallet_transactions;
   -- Should ONLY show User 2's transactions
   ```
   - [ ] RLS blocks cross-user access
   - [ ] Each user sees only their own data

2. **Test API Authorization**
   - [ ] Try to fund User 1 wallet while logged in as User 2
   - [ ] Expected: 403 Unauthorized error
   - [ ] Try to transfer from User 1 wallet as User 2
   - [ ] Expected: 403 Unauthorized error

3. **Test Unauthenticated Access**
   - [ ] Logout all users
   - [ ] Try to access `/api/wallet/list` directly
   - [ ] Expected: 401 Unauthorized

**Expected Result**: ✅ All security measures working correctly

---

## 🎯 TEST SCENARIO 8: ERROR HANDLING

### Steps:

1. **Test Insufficient Balance**
   - [ ] Try to send more USDC than available
   - [ ] Expected: "Insufficient USDC balance" error
   - [ ] Transaction NOT logged in database

2. **Test Invalid Address**
   - [ ] Enter invalid recipient: `0x123`
   - [ ] Expected: "Invalid to address format" error

3. **Test Rate Limiting**
   - [ ] Request ETH multiple times rapidly
   - [ ] Expected: Rate limit error after 2-3 requests

4. **Test Network Errors**
   - [ ] Disconnect internet briefly during transfer
   - [ ] Expected: Graceful error message
   - [ ] No partial transactions

**Expected Result**: ✅ All errors handled gracefully

---

## 📊 FINAL VERIFICATION QUERIES

### System Health Check
```sql
-- Overall system status
SELECT 
  'System Health' as check_type,
  (SELECT COUNT(*) FROM user_wallets) as total_wallets,
  (SELECT COUNT(*) FROM wallet_transactions) as total_transactions,
  (SELECT COUNT(*) FROM wallet_transactions WHERE status = 'success') as successful_tx,
  (SELECT COUNT(*) FROM wallet_transactions WHERE status = 'failed') as failed_tx;
```

### User Summary
```sql
-- Per-user statistics
SELECT 
  u.email,
  COUNT(DISTINCT uw.id) as wallet_count,
  COUNT(wt.id) as transaction_count,
  SUM(CASE WHEN wt.operation_type = 'send' THEN wt.amount ELSE 0 END) as total_sent,
  SUM(CASE WHEN wt.operation_type = 'fund' AND wt.token_type = 'usdc' THEN wt.amount ELSE 0 END) as total_funded
FROM auth.users u
LEFT JOIN user_wallets uw ON uw.user_id = u.id
LEFT JOIN wallet_transactions wt ON wt.user_id = u.id
WHERE u.email LIKE 'test-wallet-%'
GROUP BY u.id, u.email
ORDER BY u.created_at DESC;
```

### Transaction History
```sql
-- Recent transactions
SELECT 
  u.email,
  wt.operation_type,
  wt.token_type,
  wt.amount,
  wt.status,
  wt.tx_hash,
  wt.created_at
FROM wallet_transactions wt
JOIN auth.users u ON u.id = wt.user_id
ORDER BY wt.created_at DESC
LIMIT 20;
```

---

## ✅ TEST COMPLETION CHECKLIST

### Functionality
- [ ] User signup works
- [ ] Email confirmation works
- [ ] Wallet creation works
- [ ] ETH funding works
- [ ] USDC funding works
- [ ] USDC transfers work
- [ ] Balance updates correctly
- [ ] Transaction logging works

### Security
- [ ] RLS policies enforce user isolation
- [ ] API routes require authentication
- [ ] Cannot access other users' wallets
- [ ] Cannot perform operations on other users' wallets

### Database
- [ ] All tables exist
- [ ] All policies active
- [ ] All functions working
- [ ] Transactions logged correctly
- [ ] Foreign keys enforced
- [ ] Constraints validated

### UI/UX
- [ ] Responsive on mobile
- [ ] Loading states show correctly
- [ ] Error messages clear and helpful
- [ ] Success messages informative
- [ ] Copy address works
- [ ] Explorer links work

---

## 🚀 AUTOMATED TEST SCRIPT

For automated testing, use the provided script:

```bash
# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="your-url"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-key"

# Run automated tests
node scripts/test-wallet-system-e2e.js https://your-production-url.com
```

The script will:
1. ✅ Create two test users
2. ✅ Create wallets for both
3. ✅ Fund User 1 wallet
4. ✅ Transfer USDC to User 2
5. ✅ Verify all database records
6. ✅ Generate comprehensive report

---

## 📝 TEST RESULTS TEMPLATE

### Test Execution Summary

**Date**: _____________  
**Tester**: _____________  
**Environment**: _____________  
**Build Version**: _____________  

### Results:

| Test Scenario | Status | Notes |
|---------------|--------|-------|
| User Signup & Email | ⬜ Pass / ⬜ Fail | |
| Wallet Creation | ⬜ Pass / ⬜ Fail | |
| ETH Funding | ⬜ Pass / ⬜ Fail | |
| USDC Funding | ⬜ Pass / ⬜ Fail | |
| USDC Transfer | ⬜ Pass / ⬜ Fail | |
| Security & RLS | ⬜ Pass / ⬜ Fail | |
| Error Handling | ⬜ Pass / ⬜ Fail | |
| Database Integrity | ⬜ Pass / ⬜ Fail | |

### Issues Found:
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________

### Overall Status: ⬜ PASS / ⬜ FAIL

---

**Document Status**: ✅ Ready for Use  
**Last Tested**: _______________  
**Next Review**: _______________

