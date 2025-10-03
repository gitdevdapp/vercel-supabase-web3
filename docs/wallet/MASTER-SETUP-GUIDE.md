# 🚀 Supabase CDP Wallet System - Master Setup Guide

**Version**: 1.0  
**Last Updated**: October 3, 2025  
**Status**: ✅ Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start (10 Minutes)](#quick-start-10-minutes)
3. [Prerequisites](#prerequisites)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [Testing & Verification](#testing--verification)
6. [Architecture Overview](#architecture-overview)
7. [API Reference](#api-reference)
8. [Troubleshooting](#troubleshooting)
9. [Security & Best Practices](#security--best-practices)

---

## Overview

### What Is This?

A **Supabase-first CDP wallet system** where:
- **Supabase** is the single source of truth for all wallet data
- **CDP (Coinbase Developer Platform)** executes blockchain operations
- All authentication and authorization handled by Supabase RLS
- Complete audit trail of every transaction

### Key Principle

> **Supabase controls CDP, not the other way around.**

### Features

- ✅ Create wallets with custom names
- ✅ Request testnet funds (ETH & USDC on Base Sepolia)
- ✅ Transfer USDC to any address
- ✅ Live balance queries
- ✅ Complete transaction history
- ✅ Row-level security (users only see their own data)
- ✅ No data sync issues

---

## Quick Start (10 Minutes)

### 1️⃣ Run SQL Setup (5 minutes)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**
2. Click **"+ New query"** (NOT saved snippets)
3. Copy **ALL** of `scripts/database/MASTER-SUPABASE-SETUP.sql`
4. Paste and click **"Run"**
5. Verify success:

```
status: 🚀 MASTER DATABASE SETUP COMPLETED SUCCESSFULLY!
profiles_table: 1
profiles_rls_policies: 4
storage_bucket: 1
storage_rls_policies: 4
wallet_tables: 2
wallet_rls_policies: 6
wallet_functions: 4
```

### 2️⃣ Verify Environment Variables (2 minutes)

Go to Vercel → **Settings** → **Environment Variables** and confirm:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# CDP
CDP_API_KEY_ID=organizations/xxx/apiKeys/xxx
CDP_API_KEY_SECRET=-----BEGIN EC PRIVATE KEY-----\nMHc...
CDP_WALLET_SECRET=your-wallet-secret-here
NETWORK=base-sepolia

# Feature Flags
NEXT_PUBLIC_ENABLE_CDP_WALLETS=true
```

### 3️⃣ Test the System (3 minutes)

1. Sign up new user
2. Navigate to `/protected/profile`
3. Click **"Create Wallet"** → Enter name
4. Click **"Request Testnet ETH"** → Wait 10-20 seconds
5. Click **"Request Testnet USDC"** → Wait 10-20 seconds
6. Verify balances appear

**✅ Done!** Your wallet system is live.

---

## Prerequisites

### Required Services

- [ ] **Supabase Account** - [supabase.com](https://supabase.com)
- [ ] **Coinbase Developer Platform Account** - [developers.coinbase.com](https://developers.coinbase.com)
- [ ] **Vercel Account** - [vercel.com](https://vercel.com)
- [ ] **Next.js App Deployed** - Your app running on Vercel

### Required Credentials

#### Supabase
- Project URL
- Anonymous/Public key
- Service role key (for server-side operations)

#### CDP (Coinbase Developer Platform)
- API Key ID
- API Key Secret (private key)
- Wallet Secret (encryption key for wallet data)

### Development Tools

- Node.js 18+ installed
- Git for version control
- Code editor (VS Code recommended)

---

## Step-by-Step Setup

### Step 1: Database Setup

#### 1.1 Open Supabase SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in left sidebar
4. Click **"+ New query"** button

⚠️ **Important**: Use "New query", NOT saved snippets. Saved snippets have execution limitations.

#### 1.2 Execute Master Script

1. Open `scripts/database/MASTER-SUPABASE-SETUP.sql` from your project
2. Copy **entire file** (Cmd/Ctrl+A, then Cmd/Ctrl+C)
3. Paste into Supabase SQL Editor
4. Click **"Run"** or press Cmd/Ctrl+Enter

#### 1.3 Verify Success

You should see output like:

```
┌────────────────────────────────────────────────┬───────┐
│ status                                         │ ...   │
├────────────────────────────────────────────────┼───────┤
│ 🚀 MASTER DATABASE SETUP COMPLETED SUCCESSFULLY│ ...   │
└────────────────────────────────────────────────┴───────┘

profiles_table: 1
profiles_rls_policies: 4
storage_bucket: 1
storage_rls_policies: 4
wallet_tables: 2
wallet_rls_policies: 6
wallet_functions: 4
```

**If you see errors**: 
- Ensure you copied the entire file
- Check you're using "+ New query"
- Verify your Supabase project is active

### Step 2: Environment Variables

#### 2.1 Supabase Credentials

Find in Supabase Dashboard → **Settings** → **API**:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2.2 CDP Credentials

Get from [Coinbase Developer Platform](https://portal.cdp.coinbase.com):

1. Create API key → Download JSON file
2. Extract credentials:

```bash
CDP_API_KEY_ID=organizations/xxx/apiKeys/xxx
CDP_API_KEY_SECRET=-----BEGIN EC PRIVATE KEY-----\nMHcCAQE...
CDP_WALLET_SECRET=generate-random-32-char-string
```

⚠️ **Critical**: 
- `CDP_API_KEY_SECRET` must use `\n` for newlines (NOT actual line breaks)
- `CDP_WALLET_SECRET` should be a random 32+ character string
- Never commit these to git!

#### 2.3 Network Configuration

```bash
NETWORK=base-sepolia
```

Available networks:
- `base-sepolia` (testnet - recommended for development)
- `base` (mainnet - production only)
- `ethereum-sepolia` (Ethereum testnet)

#### 2.4 Feature Flags

```bash
NEXT_PUBLIC_ENABLE_CDP_WALLETS=true
```

#### 2.5 Add to Vercel

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add each variable above
3. Set for: **Production**, **Preview**, and **Development**
4. Click **Save**
5. **Redeploy** your app (Environment variables require redeployment)

### Step 3: Authentication Configuration

#### 3.1 Configure Site URL

In Supabase Dashboard → **Authentication** → **URL Configuration**:

```
Site URL: https://your-app.vercel.app
```

#### 3.2 Add Redirect URLs

Add these to **Redirect URLs**:

```
https://your-app.vercel.app/auth/callback
https://your-app.vercel.app/auth/confirm
http://localhost:3000/auth/callback
http://localhost:3000/auth/confirm
```

#### 3.3 Email Templates (Optional)

Configure in **Authentication** → **Email Templates**:

- **Confirm signup**: Customize confirmation email
- **Reset password**: Customize password reset email

Templates are in `working-email-templates/` directory.

### Step 4: Test User Flow

#### 4.1 Create Test User

1. Go to your deployed app
2. Click **Sign Up**
3. Enter email and password
4. Confirm email (check inbox)
5. Sign in

#### 4.2 Create Wallet

1. Navigate to `/protected/profile`
2. Find "CDP Wallet" section
3. Enter wallet name (e.g., "My Test Wallet")
4. Click **"Create Wallet"**
5. Wait for success message
6. **Wallet address should appear**

#### 4.3 Request Testnet Funds

**Request ETH:**
1. Click **"Request Testnet ETH"**
2. Wait 10-20 seconds
3. Balance should update to `0.001 ETH`

**Request USDC:**
1. Click **"Request Testnet USDC"**
2. Wait 10-20 seconds
3. Balance should update to `1.0 USDC`

⚠️ **Rate Limit**: CDP allows 1 faucet request per 60 seconds per address

#### 4.4 Verify in Database

Go back to Supabase → **SQL Editor** → Run:

```sql
-- Check wallet created
SELECT * FROM user_wallets ORDER BY created_at DESC LIMIT 1;

-- Check transactions logged
SELECT * FROM wallet_transactions ORDER BY created_at DESC LIMIT 5;
```

**Expected Results**:
- 1 wallet in `user_wallets`
- 3 transactions in `wallet_transactions`:
  - 1 "create" operation
  - 1 "fund" operation (ETH)
  - 1 "fund" operation (USDC)

---

## Testing & Verification

### Database Verification

Run these queries in Supabase SQL Editor:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'user_wallets', 'wallet_transactions');
-- Should return 3 rows

-- Check RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
-- All should show rowsecurity = true

-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
-- Should see 14 policies total

-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
  'handle_new_user',
  'get_user_wallet',
  'get_wallet_transactions',
  'log_wallet_operation',
  'update_wallet_timestamp'
);
-- Should return 5 rows
```

### Application Verification

#### Test Checklist

- [ ] User can sign up
- [ ] Profile auto-created on signup
- [ ] User can sign in
- [ ] Profile page loads
- [ ] User can create wallet
- [ ] Wallet appears on profile
- [ ] User can request ETH
- [ ] ETH balance updates
- [ ] User can request USDC
- [ ] USDC balance updates
- [ ] Wallet exists in `user_wallets` table
- [ ] Transactions logged in `wallet_transactions` table

#### Manual Testing Script

```bash
# Test complete flow
node scripts/testing/test-supabase-first-flow.js
```

Expected output:
```
✅ Database tables exist
✅ RLS policies configured
✅ Helper functions available
✅ Architecture compliance verified
```

---

## Architecture Overview

### The Supabase-First Principle

```
┌─────────────────────────────────────────────────────────┐
│                    USER ACTION                          │
│              (Create/Fund/Transfer)                     │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 1: Authenticate via Supabase                      │
│  - Verify user is logged in                             │
│  - Get user ID from session                             │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 2: Verify Wallet Ownership in Database            │
│  - Query user_wallets table                             │
│  - Check wallet belongs to user (RLS enforced)          │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 3: Execute Blockchain Operation via CDP           │
│  - Create wallet / Request funds / Send transfer        │
│  - Get transaction hash from blockchain                 │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 4: Log Transaction in Database                    │
│  - Insert into wallet_transactions table                │
│  - Record: operation, amount, addresses, tx hash        │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 5: Return Result to User                          │
│  - Success: Show balance/confirmation                   │
│  - Error: Show error message                            │
└─────────────────────────────────────────────────────────┘
```

### Database Schema

#### `user_wallets` Table

```sql
CREATE TABLE user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  wallet_address TEXT NOT NULL UNIQUE,
  wallet_name TEXT NOT NULL DEFAULT 'My Wallet',
  network TEXT NOT NULL DEFAULT 'base-sepolia',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose**: Links users to their wallet addresses

**RLS Policies**:
- SELECT: Users can view their own wallets
- INSERT: Users can create wallets for themselves
- UPDATE: Users can modify their own wallets
- DELETE: Users can delete their own wallets

#### `wallet_transactions` Table

```sql
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  wallet_id UUID NOT NULL REFERENCES user_wallets(id),
  operation_type TEXT NOT NULL, -- 'create', 'fund', 'send', 'receive'
  token_type TEXT NOT NULL,     -- 'eth', 'usdc'
  amount DECIMAL(20, 8),
  from_address TEXT,
  to_address TEXT,
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed'
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose**: Complete audit trail of all wallet operations

**RLS Policies**:
- SELECT: Users can view their own transactions
- INSERT: Users can log their own transactions

### Helper Functions

```sql
-- Get user's active wallet
SELECT * FROM get_user_wallet('[user-id]');

-- Get wallet transaction history
SELECT * FROM get_wallet_transactions('[wallet-id]', 50);

-- Log wallet operation (used by API routes)
SELECT log_wallet_operation(
  '[user-id]',
  '[wallet-id]',
  'fund',
  'eth',
  0.001,
  NULL,
  '[wallet-address]',
  '[tx-hash]',
  'success',
  NULL
);
```

---

## API Reference

### POST `/api/wallet/create`

Creates a new wallet via CDP and stores in database.

**Request:**
```json
{
  "name": "My Wallet",
  "type": "custom"
}
```

**Response:**
```json
{
  "address": "0x1234567890abcdef...",
  "name": "My Wallet",
  "wallet_id": "uuid-here",
  "type": "custom"
}
```

**Errors:**
- `401`: Not authenticated
- `503`: CDP not configured
- `400`: Invalid input

### POST `/api/wallet/fund`

Requests testnet funds from CDP faucet.

**Request:**
```json
{
  "address": "0x1234567890abcdef...",
  "token": "eth"
}
```

**Response:**
```json
{
  "transactionHash": "0xabc123...",
  "status": "success",
  "token": "ETH",
  "explorerUrl": "https://sepolia.basescan.org/tx/0xabc123..."
}
```

**Rate Limits:**
- 1 request per 60 seconds per address (CDP limitation)

### POST `/api/wallet/transfer`

Transfers USDC to another address.

**Request:**
```json
{
  "fromAddress": "0x1234...",
  "toAddress": "0x5678...",
  "amount": 1.5,
  "token": "usdc"
}
```

**Response:**
```json
{
  "transactionHash": "0xabc123...",
  "status": "submitted",
  "explorerUrl": "https://sepolia.basescan.org/tx/0xabc123..."
}
```

**Notes:**
- Only USDC transfers supported
- Requires sufficient balance + ETH for gas

### GET `/api/wallet/list`

Lists user's wallets with live balances.

**Response:**
```json
{
  "wallets": [
    {
      "id": "uuid-here",
      "address": "0x1234...",
      "name": "My Wallet",
      "network": "base-sepolia",
      "balances": {
        "eth": 0.001,
        "usdc": 10.5
      },
      "created_at": "2025-10-03T12:00:00Z"
    }
  ],
  "count": 1
}
```

---

## Troubleshooting

### Common Issues

#### "CDP not configured"

**Symptoms**: Error message when trying to create wallet or request funds

**Causes**:
- Missing environment variables
- Invalid CDP credentials
- Feature flag not enabled

**Solutions**:
1. Check all `CDP_*` variables are set in Vercel
2. Verify `NEXT_PUBLIC_ENABLE_CDP_WALLETS=true`
3. Ensure `CDP_API_KEY_SECRET` uses `\n` for newlines
4. Redeploy app after changing variables

#### "Wallet not found or unauthorized"

**Symptoms**: Cannot access wallet you just created

**Causes**:
- Wallet not in database
- RLS policy blocking access
- User not logged in

**Solutions**:
```sql
-- Check if wallet exists
SELECT * FROM user_wallets WHERE user_id = auth.uid();

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'user_wallets';

-- Verify user is logged in (run in app console)
const { data: { user } } = await supabase.auth.getUser();
console.log(user);
```

#### "Insufficient funds" on transfer

**Symptoms**: Transfer fails with balance error

**Causes**:
- Not enough USDC
- Not enough ETH for gas fees

**Solutions**:
1. Request more testnet funds
2. Ensure you have at least 0.0001 ETH for gas
3. Check balances: `/api/wallet/list`

#### "Rate limit exceeded"

**Symptoms**: Faucet request fails after recent request

**Cause**: CDP allows 1 faucet request per 60 seconds per address

**Solution**: Wait 60 seconds and retry

#### Database errors

**Symptoms**: SQL errors, constraint violations

**Solutions**:
```sql
-- Verify all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';

-- Re-run master script (it's idempotent)
-- Copy and paste entire scripts/database/MASTER-SUPABASE-SETUP.sql
```

### Debug Queries

```sql
-- Check user's wallets
SELECT * FROM user_wallets WHERE user_id = auth.uid();

-- Check recent transactions
SELECT * FROM wallet_transactions 
WHERE user_id = auth.uid() 
ORDER BY created_at DESC 
LIMIT 10;

-- Check wallet transaction count
SELECT 
  w.wallet_name,
  COUNT(wt.id) as transaction_count
FROM user_wallets w
LEFT JOIN wallet_transactions wt ON w.id = wt.wallet_id
WHERE w.user_id = auth.uid()
GROUP BY w.id, w.wallet_name;

-- Check system health
SELECT 
  (SELECT COUNT(*) FROM user_wallets) as total_wallets,
  (SELECT COUNT(*) FROM wallet_transactions) as total_transactions,
  (SELECT COUNT(*) FROM wallet_transactions WHERE status = 'success') as successful_transactions,
  (SELECT COUNT(*) FROM wallet_transactions WHERE status = 'failed') as failed_transactions;
```

---

## Security & Best Practices

### Environment Variables

✅ **DO**:
- Store all secrets in Vercel environment variables
- Use `SUPABASE_SERVICE_ROLE_KEY` only on server-side
- Rotate API keys regularly
- Use different keys for production and development

❌ **DON'T**:
- Commit secrets to git
- Expose service role key in client code
- Share API keys in screenshots/docs
- Reuse the same keys across projects

### Row-Level Security (RLS)

✅ **Enabled** on all tables:
- `profiles`: Users see only their own profile + public profiles
- `user_wallets`: Users see only their own wallets
- `wallet_transactions`: Users see only their own transactions

❌ **Never**:
- Disable RLS in production
- Use service role key in client-side code
- Bypass RLS policies with custom functions

### Wallet Operations

✅ **Always**:
- Verify wallet ownership before operations
- Log every transaction
- Check balances before transfers
- Validate addresses and amounts

❌ **Never**:
- Trust client-provided wallet IDs without verification
- Skip transaction logging
- Allow unlimited transfer amounts
- Expose private keys or wallet secrets

### Monitoring

Set up alerts for:
- Failed transactions (check `wallet_transactions.status = 'failed'`)
- Unusual activity (multiple rapid requests)
- Database errors
- API rate limits

Query for monitoring:
```sql
-- Failed transactions today
SELECT COUNT(*) 
FROM wallet_transactions 
WHERE status = 'failed' 
AND created_at > CURRENT_DATE;

-- Most active users
SELECT user_id, COUNT(*) as operations
FROM wallet_transactions
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id
ORDER BY operations DESC
LIMIT 10;
```

---

## Success Checklist

### Initial Setup

- [ ] Master SQL script executed successfully
- [ ] Verification query shows all components created
- [ ] Environment variables set in Vercel
- [ ] App redeployed after setting variables
- [ ] Authentication URLs configured in Supabase
- [ ] Test user can sign up and sign in

### Wallet System

- [ ] User can create wallet
- [ ] Wallet appears on profile page
- [ ] User can request ETH (balance updates)
- [ ] User can request USDC (balance updates)
- [ ] Wallet exists in `user_wallets` table
- [ ] All operations logged in `wallet_transactions` table
- [ ] No "Wallet not found" errors
- [ ] RLS policies enforce proper access

### Production Readiness

- [ ] All tests passing
- [ ] Error handling working correctly
- [ ] Rate limiting respected
- [ ] Monitoring queries set up
- [ ] Backup plan documented
- [ ] Team trained on system

---

## Additional Resources

### Documentation
- **Master SQL Script**: `scripts/database/MASTER-SUPABASE-SETUP.sql`
- **Architecture Details**: `docs/wallet/SUPABASE-FIRST-ARCHITECTURE.md`
- **API Implementation**: See files in `app/api/wallet/`
- **UI Component**: `components/profile-wallet-card.tsx`

### External Links
- [Coinbase CDP Docs](https://docs.cdp.coinbase.com/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Base Sepolia Testnet](https://docs.base.org/docs/network-information#base-testnet-sepolia)
- [BaseScan Explorer](https://sepolia.basescan.org/)

### Support
- Review troubleshooting section above
- Check Vercel function logs for errors
- Inspect Supabase database logs
- Review transaction on BaseScan

---

**Version**: 1.0  
**Status**: ✅ Production Ready  
**Last Updated**: October 3, 2025

**Ready to deploy?** Follow the Quick Start guide and you'll be up and running in 10 minutes! 🚀

