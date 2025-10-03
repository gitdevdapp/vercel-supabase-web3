# 🏗️ Supabase-First CDP Wallet Architecture

**Version**: 3.0  
**Status**: ✅ Production Ready  
**Last Updated**: October 3, 2025

---

## 📋 Overview

This system implements a **Supabase-first** architecture where Supabase is the single source of truth for all wallet data, and CDP (Coinbase Developer Platform) is used purely as a blockchain execution layer.

### Key Principle

> **Supabase controls CDP, not the other way around.**

All wallet operations:
1. **Start** with Supabase (authentication, authorization, data validation)
2. **Execute** via CDP (blockchain operations)
3. **End** with Supabase (audit logging, state updates)

---

## 🎯 Architecture Goals

### ✅ What This Architecture Provides

- **Single Source of Truth**: All wallet data lives in Supabase
- **Proper Authorization**: Row-Level Security (RLS) ensures users only access their own data
- **Complete Audit Trail**: Every operation logged in `wallet_transactions`
- **Data Consistency**: No sync issues between CDP and database
- **Scalability**: Can add more blockchain providers without changing data model
- **Security**: CDP credentials stay server-side, never exposed to clients

### ❌ What We DON'T Do

- ❌ Query CDP for wallet lists
- ❌ Use CDP as primary data store
- ❌ Trust client-side wallet addresses without database verification
- ❌ Allow operations on wallets not registered in Supabase

---

## 🔄 Data Flow

### Wallet Creation Flow

```
User clicks "Create Wallet"
  ↓
Next.js API Route: /api/wallet/create
  ↓
1. Authenticate user via Supabase
  ↓
2. Call CDP SDK to create blockchain wallet
  ↓
3. Store wallet in Supabase user_wallets table
  ↓
4. Log operation in wallet_transactions
  ↓
5. Return wallet details to client
```

### Wallet List Flow

```
User loads profile page
  ↓
Next.js API Route: /api/wallet/list
  ↓
1. Authenticate user via Supabase
  ↓
2. Query Supabase user_wallets table (NOT CDP!)
  ↓
3. For each wallet, fetch live balances from blockchain
  ↓
4. Return wallets with balances to client
```

### Funding Flow

```
User requests testnet funds
  ↓
Next.js API Route: /api/wallet/fund
  ↓
1. Authenticate user via Supabase
  ↓
2. Verify wallet exists in Supabase AND belongs to user
  ↓
3. Call CDP SDK to request faucet funds
  ↓
4. Wait for blockchain confirmation
  ↓
5. Log transaction in wallet_transactions
  ↓
6. Return transaction details to client
```

---

## 📊 Database Schema

### Table: `user_wallets`

**Purpose**: Links Supabase users to their CDP-generated wallet addresses

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `user_id` | UUID | Foreign key to `auth.users` |
| `wallet_address` | TEXT | Ethereum address (from CDP) |
| `wallet_name` | TEXT | User-friendly name |
| `network` | TEXT | Network: base-sepolia, base, ethereum-sepolia |
| `is_active` | BOOLEAN | Soft delete flag |
| `created_at` | TIMESTAMPTZ | When wallet was created |
| `updated_at` | TIMESTAMPTZ | Last modification time |

**Key Constraints**:
- `wallet_address` must be unique
- `wallet_address` must match pattern `^0x[a-fA-F0-9]{40}$`
- `network` must be whitelisted

### Table: `wallet_transactions`

**Purpose**: Complete audit trail of all wallet operations

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `user_id` | UUID | User who initiated operation |
| `wallet_id` | UUID | Foreign key to `user_wallets` |
| `operation_type` | TEXT | create, fund, send, receive |
| `token_type` | TEXT | eth, usdc |
| `amount` | DECIMAL | Transaction amount |
| `from_address` | TEXT | Source address |
| `to_address` | TEXT | Destination address |
| `tx_hash` | TEXT | Blockchain transaction hash |
| `status` | TEXT | pending, success, failed |
| `error_message` | TEXT | Error details if failed |
| `metadata` | JSONB | Additional data |
| `created_at` | TIMESTAMPTZ | When operation occurred |

**Key Constraints**:
- `operation_type` must be: create, fund, send, receive
- `token_type` must be: eth, usdc
- `status` must be: pending, success, failed
- `tx_hash` must match pattern `^0x[a-fA-F0-9]{64}$` if present

---

## 🔒 Security Model

### Row-Level Security (RLS)

**Enabled on both tables**. Every query automatically filtered by `auth.uid()`.

#### user_wallets Policies

1. **SELECT**: Users can view their own wallets
2. **INSERT**: Users can create wallets for themselves
3. **UPDATE**: Users can modify their own wallets
4. **DELETE**: Users can delete their own wallets

#### wallet_transactions Policies

1. **SELECT**: Users can view their own transactions
2. **INSERT**: Users can log transactions for their own wallets

### Authorization Flow

```typescript
// Every API route starts with this
const supabase = await createClient();
const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Now verify wallet belongs to this user
const { data: wallet } = await supabase
  .from('user_wallets')
  .select('*')
  .eq('wallet_address', address)
  .eq('user_id', user.id)  // RLS automatically enforces this
  .single();
```

---

## 🔌 API Routes

### POST `/api/wallet/create`

**Purpose**: Create new CDP wallet and register in Supabase

**Request**:
```json
{
  "name": "My Wallet",
  "type": "custom"
}
```

**Process**:
1. Authenticate user
2. Call `cdp.evm.getOrCreateAccount({ name })`
3. Insert into `user_wallets`
4. Log to `wallet_transactions`

**Response**:
```json
{
  "address": "0x...",
  "name": "My Wallet",
  "wallet_id": "uuid-here",
  "type": "custom"
}
```

### GET `/api/wallet/list`

**Purpose**: List user's wallets from Supabase (with live balances)

**Process**:
1. Authenticate user
2. Query `user_wallets` table (NOT CDP!)
3. For each wallet, fetch balances from blockchain
4. Return enriched wallet data

**Response**:
```json
{
  "wallets": [
    {
      "id": "uuid-here",
      "name": "My Wallet",
      "address": "0x...",
      "network": "base-sepolia",
      "balances": {
        "eth": 0.001,
        "usdc": 10.5
      },
      "created_at": "2025-10-03T..."
    }
  ],
  "count": 1
}
```

### POST `/api/wallet/fund`

**Purpose**: Request testnet funds for a wallet

**Request**:
```json
{
  "address": "0x...",
  "token": "eth"
}
```

**Process**:
1. Authenticate user
2. **Verify wallet in Supabase** (critical security check)
3. Call `cdp.evm.requestFaucet()`
4. Wait for blockchain confirmation
5. Log to `wallet_transactions`

**Response**:
```json
{
  "transactionHash": "0x...",
  "status": "success",
  "token": "ETH",
  "explorerUrl": "https://sepolia.basescan.org/tx/..."
}
```

### POST `/api/wallet/transfer`

**Purpose**: Send tokens to another address

**Request**:
```json
{
  "fromAddress": "0x...",
  "toAddress": "0x...",
  "amount": 1.5,
  "token": "usdc"
}
```

**Process**:
1. Authenticate user
2. **Verify source wallet in Supabase**
3. Call CDP transfer function
4. Wait for confirmation
5. Log to `wallet_transactions`

---

## 🚀 Setup Instructions

### 1. Database Setup (One-Time)

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor**
3. Click **"+ New query"** (NOT saved snippets)
4. Copy contents of `SUPABASE-CDP-SETUP.sql`
5. Paste and click **"Run"**
6. Verify output shows:
   - `tables_created: 2`
   - `rls_policies: 6`
   - `helper_functions: 4`

### 2. Environment Variables

**Required in Vercel**:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# CDP (Coinbase Developer Platform)
CDP_API_KEY_ID=organizations/xxx/apiKeys/xxx
CDP_API_KEY_SECRET=-----BEGIN EC PRIVATE KEY-----\nMHc...
CDP_WALLET_SECRET=your-wallet-secret-here
NETWORK=base-sepolia

# Feature Flags
NEXT_PUBLIC_ENABLE_CDP_WALLETS=true
```

### 3. Verify Setup

**Test wallet creation**:
```bash
curl -X POST https://your-app.vercel.app/api/wallet/create \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Wallet", "type": "custom"}'
```

**Check database**:
```sql
-- Should see your new wallet
SELECT * FROM user_wallets ORDER BY created_at DESC LIMIT 5;

-- Should see creation logged
SELECT * FROM wallet_transactions ORDER BY created_at DESC LIMIT 5;
```

---

## 🧪 Testing Checklist

### New User Flow

- [ ] User signs up
- [ ] Navigate to `/protected/profile`
- [ ] Click "Create Wallet"
- [ ] Wallet appears immediately
- [ ] Wallet is in `user_wallets` table
- [ ] Creation logged in `wallet_transactions`

### Funding Flow

- [ ] Click "Request ETH"
- [ ] Transaction confirmed on blockchain
- [ ] Balance updates in UI
- [ ] Transaction logged in database
- [ ] Can see transaction on BaseScan

### Transfer Flow

- [ ] Enter recipient address
- [ ] Enter amount
- [ ] Click "Send"
- [ ] Transaction confirmed
- [ ] Balance decreases
- [ ] Transaction logged

### Security Tests

- [ ] Cannot request funds for wallet you don't own
- [ ] Cannot see other users' wallets
- [ ] Cannot see other users' transactions
- [ ] RLS policies enforced on all queries

---

## 🐛 Troubleshooting

### "Wallet not found or unauthorized"

**Cause**: Wallet address is not in Supabase database or doesn't belong to user

**Fix**:
```sql
-- Check if wallet exists
SELECT * FROM user_wallets WHERE wallet_address = '0x...';

-- Check wallet owner
SELECT user_id, wallet_address FROM user_wallets WHERE wallet_address = '0x...';
```

### "Failed to fund wallet" / "Rate limit exceeded"

**Cause**: CDP faucet rate limits (1 request per 60 seconds per address)

**Fix**: Wait 60 seconds and try again

### Empty wallet list

**Cause**: No wallets in Supabase database

**Fix**: Create a wallet via UI or API

---

## 📈 Monitoring

### Key Metrics to Track

```sql
-- Total wallets created
SELECT COUNT(*) FROM user_wallets;

-- Wallets created today
SELECT COUNT(*) FROM user_wallets 
WHERE created_at > CURRENT_DATE;

-- Total transactions
SELECT COUNT(*) FROM wallet_transactions;

-- Successful vs failed transactions
SELECT status, COUNT(*) 
FROM wallet_transactions 
GROUP BY status;

-- Most active users
SELECT user_id, COUNT(*) as tx_count
FROM wallet_transactions
GROUP BY user_id
ORDER BY tx_count DESC
LIMIT 10;
```

---

## 🔮 Future Enhancements

### Potential Features

1. **Multi-wallet support**: Allow users to create multiple wallets
2. **Transaction history UI**: Display `wallet_transactions` in user interface
3. **Webhook notifications**: Alert users of incoming transactions
4. **Export functionality**: Download transaction history as CSV
5. **Mainnet support**: Add production networks (with safety checks!)
6. **Gas estimation**: Show estimated fees before transactions
7. **Address book**: Save frequently used addresses

### Architecture Improvements

1. **Caching layer**: Cache balances for 30 seconds to reduce blockchain queries
2. **Background jobs**: Process transactions asynchronously
3. **Webhook handling**: Listen to CDP webhooks for transaction updates
4. **Analytics dashboard**: Visualize wallet usage and transaction patterns

---

## 📚 Related Documentation

- **SQL Setup Script**: [SUPABASE-CDP-SETUP.sql](./SUPABASE-CDP-SETUP.sql)
- **Quick Start Guide**: [QUICK-START.md](./QUICK-START.md)
- **API Reference**: See individual route files in `/app/api/wallet/`
- **CDP Documentation**: https://docs.cdp.coinbase.com/
- **Supabase RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security

---

## ✅ Summary

### What Makes This Architecture "Supabase-First"?

1. **All queries start with Supabase authentication**
2. **Database is the source of truth for wallet ownership**
3. **CDP is used ONLY for blockchain operations**
4. **Every operation logged in Supabase for audit trail**
5. **RLS ensures proper data isolation**
6. **No data sync issues - single source of truth**

### Critical Rules

1. ✅ **ALWAYS** query `user_wallets` table, not CDP, for wallet lists
2. ✅ **ALWAYS** verify wallet ownership in Supabase before operations
3. ✅ **ALWAYS** log operations to `wallet_transactions`
4. ✅ **NEVER** trust client-provided addresses without database verification
5. ✅ **NEVER** expose CDP credentials to client

---

**Version**: 3.0  
**Last Updated**: October 3, 2025  
**Status**: Production Ready ✅

