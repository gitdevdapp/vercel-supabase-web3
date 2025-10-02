# 🏦 CDP Wallet Integration - Quick Reference

**Status**: ✅ Production Ready  
**Last Updated**: October 2, 2025  
**Current Version**: 2.0

---

## 📖 Overview

The CDP wallet system integrates Coinbase Developer Platform wallets with Supabase authentication, providing secure blockchain wallet functionality for authenticated users.

### Features
- ✅ Wallet creation with custom naming
- ✅ Testnet funding (ETH & USDC on Base Sepolia)
- ✅ USDC transfers to any address
- ✅ Database persistence with full audit trail
- ✅ Row-level security (RLS)
- ✅ Responsive UI on profile page

---

## 📚 Documentation

### 📍 **Main Reference: [Current System State](/docs/current/WALLET-SYSTEM-STATE.md)**

**Complete technical documentation including:**
- Database schema (tables, policies, functions)
- API endpoints and behavior
- UI components and user flows
- Security implementation
- Testing procedures
- Troubleshooting guide
- Production deployment status

### 📄 **Database Schema: [CDP-WALLET-SETUP.sql](./CDP-WALLET-SETUP.sql)**

**Production-ready SQL script that creates:**
- `user_wallets` table - wallet ownership tracking
- `wallet_transactions` table - complete transaction history
- Row-level security policies (6 total)
- Helper functions (3 total)
- Indexes and constraints

---

## 🚀 Quick Setup

### Prerequisites
- Supabase project with authentication configured
- Coinbase CDP API credentials
- Environment variables configured in Vercel

### Database Setup (5 minutes)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor
2. Click **"+ New query"** (NOT saved snippets)
3. Copy all contents of `CDP-WALLET-SETUP.sql`
4. Paste and click **"Run"**
5. Verify success:
   ```sql
   SELECT 
     'Setup Complete' as status,
     (SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user_wallets', 'wallet_transactions')) as tables_created,
     (SELECT COUNT(*) FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename IN ('user_wallets', 'wallet_transactions')) as rls_policies;
   ```
   Expected: `tables_created: 2, rls_policies: 6`

### System Already Deployed ✅

The wallet system is **already implemented** in the codebase:

- **API Routes**: `/app/api/wallet/*` (create, fund, transfer, list)
- **UI Component**: `/components/profile-wallet-card.tsx`
- **Integration**: `/app/protected/profile/page.tsx`
- **Database**: Schema deployed via `CDP-WALLET-SETUP.sql`

---

## 🗄️ Database Schema Summary

### Tables

**`user_wallets`** - Links users to their wallet addresses
- Primary key: `id` (UUID)
- Foreign key: `user_id` → `auth.users`
- Unique: `wallet_address`
- RLS: 4 policies (SELECT, INSERT, UPDATE, DELETE)

**`wallet_transactions`** - Audit trail of all operations
- Primary key: `id` (UUID)
- Foreign keys: `user_id`, `wallet_id`
- Operation types: `create`, `fund`, `send`, `receive`
- Token types: `eth`, `usdc`
- RLS: 2 policies (SELECT, INSERT)

### Helper Functions

```sql
-- Get user's active wallet
SELECT * FROM get_user_wallet(user_id);

-- Get wallet transaction history
SELECT * FROM get_wallet_transactions(wallet_id, limit);

-- Log wallet operation (used by API routes)
SELECT log_wallet_operation(
  p_user_id, p_wallet_id, p_operation_type, 
  p_token_type, p_amount, p_from_address, 
  p_to_address, p_tx_hash, p_status, p_error_message
);
```

---

## 🔌 API Endpoints

### `POST /api/wallet/create`
Creates wallet via CDP and stores in database.

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
  "address": "0x...",
  "name": "My Wallet",
  "wallet_id": "uuid",
  "type": "custom"
}
```

### `POST /api/wallet/fund`
Requests testnet funds from CDP faucet.

**Request:**
```json
{
  "address": "0x...",
  "token": "eth" // or "usdc"
}
```

**Response:**
```json
{
  "transactionHash": "0x...",
  "status": "success",
  "token": "ETH",
  "explorerUrl": "https://sepolia.basescan.org/tx/..."
}
```

### `POST /api/wallet/transfer`
Transfers USDC to another address.

**Request:**
```json
{
  "fromAddress": "0x...",
  "toAddress": "0x...",
  "amount": 1.5,
  "token": "usdc"
}
```

**Response:**
```json
{
  "transactionHash": "0x...",
  "status": "submitted",
  "explorerUrl": "https://sepolia.basescan.org/tx/..."
}
```

### `GET /api/wallet/list`
Lists user's wallets with live balances.

**Response:**
```json
{
  "wallets": [
    {
      "address": "0x...",
      "name": "My Wallet",
      "type": "custom",
      "balances": {
        "eth": 0.001,
        "usdc": 10.5
      },
      "created_at": "2025-10-02T..."
    }
  ]
}
```

---

## 🔒 Security Features

### Authentication & Authorization
- All API routes require Supabase authentication
- Returns 401 if user not logged in
- Database RLS enforces user-wallet ownership
- Users can only access their own data

### Data Validation
- Ethereum address format: `^0x[a-fA-F0-9]{40}$`
- Network whitelist: `base-sepolia`, `base`, `ethereum-sepolia`
- Operation types: `create`, `fund`, `send`, `receive`
- Token types: `eth`, `usdc`
- Transaction hash format: `^0x[a-fA-F0-9]{64}$`

### Audit Trail
All operations logged to `wallet_transactions` with:
- User ID, wallet ID, operation type
- Token type, amount, addresses
- Transaction hash, status, error messages
- Timestamps

---

## 🧪 Testing

### Quick Verification

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_wallets', 'wallet_transactions');

-- Check RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_wallets', 'wallet_transactions');

-- Check policies active
SELECT tablename, COUNT(*) FROM pg_policies 
WHERE schemaname = 'public' 
GROUP BY tablename;

-- View user wallets
SELECT * FROM user_wallets ORDER BY created_at DESC;

-- View transactions
SELECT * FROM wallet_transactions ORDER BY created_at DESC LIMIT 10;
```

### User Flow Test

1. Navigate to `/protected/profile`
2. Create wallet with custom name
3. Request testnet ETH
4. Request testnet USDC
5. Send USDC to another address
6. Verify all operations logged in database

---

## 🚨 Troubleshooting

### Common Issues

**"Wallet not found or unauthorized"**
→ Wallet doesn't belong to logged-in user (RLS working correctly)

**"Failed to fund wallet"**
→ Check CDP rate limits, verify API keys, try again in 60 seconds

**"Insufficient funds"**
→ Request more testnet funds, ensure ETH balance for gas fees

**Database errors**
→ Verify SQL schema is deployed, check RLS policies are enabled

### Debug Queries

```sql
-- Check user's wallets
SELECT * FROM user_wallets WHERE user_id = auth.uid();

-- Check recent transactions
SELECT * FROM wallet_transactions 
WHERE user_id = auth.uid() 
ORDER BY created_at DESC;

-- Verify RLS policies
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## 📂 File Structure

### Implementation Files
```
app/api/wallet/
├── create/route.ts      # Wallet creation + DB storage
├── fund/route.ts         # Testnet funding + logging
├── transfer/route.ts     # USDC transfers + logging
└── list/route.ts         # List wallets + balances

app/protected/profile/page.tsx  # Profile page integration

components/profile-wallet-card.tsx  # Wallet UI component

docs/
├── current/
│   └── WALLET-SYSTEM-STATE.md  # Complete technical reference
└── wallet/
    ├── README.md               # This file
    └── CDP-WALLET-SETUP.sql    # Database schema
```

---

## 🎯 Additional Resources

### Documentation
- **Complete Reference**: [/docs/current/WALLET-SYSTEM-STATE.md](/docs/current/WALLET-SYSTEM-STATE.md)
- **Database Schema**: [CDP-WALLET-SETUP.sql](./CDP-WALLET-SETUP.sql)

### External Links
- [Coinbase CDP Docs](https://docs.cdp.coinbase.com/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Base Sepolia Testnet](https://docs.base.org/docs/network-information#base-testnet-sepolia)
- [BaseScan Explorer](https://sepolia.basescan.org/)

---

## ✅ System Status

**Current Deployment:**
- ✅ Database schema deployed
- ✅ RLS policies active
- ✅ API routes implemented
- ✅ UI component integrated
- ✅ Authentication working
- ✅ Transaction logging active
- ✅ Production ready

**Capabilities:**
- ✅ Wallet creation
- ✅ Testnet funding (ETH/USDC)
- ✅ USDC transfers
- ✅ Balance queries
- ✅ Transaction history
- ✅ Mobile responsive

**Limitations:**
- Testnet only (Base Sepolia)
- USDC transfers only (no ETH sends)
- One wallet per user displayed
- No transaction history UI (data exists in DB)

---

**Version**: 2.0  
**Status**: Production Ready ✅  
**Last Updated**: October 2, 2025  

For detailed technical documentation, see: [/docs/current/WALLET-SYSTEM-STATE.md](/docs/current/WALLET-SYSTEM-STATE.md)
