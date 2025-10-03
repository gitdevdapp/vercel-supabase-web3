# 🏦 CDP Wallet System Documentation

**Version**: 1.0  
**Last Updated**: October 3, 2025  
**Status**: ✅ Production Ready

---

## 🚀 Quick Start

### New to the System?

**👉 Start Here**: [MASTER-SETUP-GUIDE.md](./MASTER-SETUP-GUIDE.md)

The Master Setup Guide contains everything you need:
- Complete setup instructions (10 minutes)
- Database schema and SQL setup
- Environment variable configuration
- API endpoint documentation
- Testing and verification steps
- Troubleshooting guide
- Security best practices

---

## 📚 Documentation Structure

### 1. **MASTER-SETUP-GUIDE.md** ⭐ PRIMARY GUIDE

Complete end-to-end documentation covering:
- Prerequisites and requirements
- Step-by-step setup instructions
- Database architecture overview
- API reference
- Testing procedures
- Troubleshooting common issues
- Security guidelines

**→ Use this for all new deployments and reference**

### 2. **SUPABASE-FIRST-ARCHITECTURE.md**

Deep technical documentation:
- Architectural principles and design decisions
- Data flow diagrams for all operations
- Detailed database schema
- RLS policy explanations
- API implementation details
- Advanced testing strategies
- Future enhancement roadmap

**→ Use this to understand the system deeply**

### 3. **Master SQL Script**

Location: `scripts/database/MASTER-SUPABASE-SETUP.sql`

Single SQL file that creates:
- ✅ Profiles table with auto-creation
- ✅ Profile image storage bucket
- ✅ CDP wallet tables (`user_wallets`, `wallet_transactions`)
- ✅ 14 RLS policies for security
- ✅ 5 helper functions
- ✅ All indexes and constraints

**→ Run once in Supabase SQL Editor to set up database**

---

## ⚡ Quick Reference

### For Setup

```bash
# 1. Run master SQL script in Supabase
scripts/database/MASTER-SUPABASE-SETUP.sql

# 2. Set environment variables in Vercel
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
CDP_API_KEY_ID=...
CDP_API_KEY_SECRET=...
CDP_WALLET_SECRET=...
NETWORK=base-sepolia
NEXT_PUBLIC_ENABLE_CDP_WALLETS=true

# 3. Test the system
node scripts/testing/test-cdp-wallet-operations.js
```

### For Testing

```sql
-- Check wallet exists in database
SELECT * FROM user_wallets WHERE user_id = auth.uid();

-- Check transaction history
SELECT * FROM wallet_transactions 
WHERE user_id = auth.uid() 
ORDER BY created_at DESC;

-- System health check
SELECT 
  (SELECT COUNT(*) FROM user_wallets) as total_wallets,
  (SELECT COUNT(*) FROM wallet_transactions) as total_transactions;
```

### For Troubleshooting

Common issues and solutions in [MASTER-SETUP-GUIDE.md](./MASTER-SETUP-GUIDE.md#troubleshooting)

---

## 🏗️ Architecture Overview

### The Supabase-First Principle

> **Supabase controls CDP, not the other way around.**

### Data Flow

```
User Action → Authenticate → Verify Ownership → Execute CDP → Log Transaction → Return Result
```

### Key Components

1. **Database (Supabase)**
   - `user_wallets`: Wallet ownership records
   - `wallet_transactions`: Complete audit trail
   - RLS policies: User data isolation

2. **Blockchain (CDP)**
   - Wallet creation
   - Fund requests (testnet)
   - Token transfers
   - Balance queries

3. **API Routes** (`app/api/wallet/`)
   - `create/`: Create new wallet
   - `fund/`: Request testnet funds
   - `transfer/`: Send USDC
   - `list/`: Get wallets with balances

4. **UI Component**
   - `components/profile-wallet-card.tsx`
   - Displays wallet info and balances
   - Handles fund requests and transfers

---

## 🎯 Features

### Implemented ✅

- Create wallets with custom names
- Request testnet ETH (Base Sepolia)
- Request testnet USDC (Base Sepolia)
- Transfer USDC to any address
- View live balances (ETH + USDC)
- Complete transaction history in database
- Row-level security for all data
- Automatic transaction logging
- User-friendly error messages

### Network Support

- **base-sepolia** (testnet) - Recommended for development
- **base** (mainnet) - Production use only
- **ethereum-sepolia** (testnet) - Alternative testnet

### Token Support

- **ETH** - Native token for gas fees
- **USDC** - Stablecoin for transfers

---

## 📂 File Structure

### Documentation
```
docs/wallet/
├── README.md                         # This file - quick reference
├── MASTER-SETUP-GUIDE.md            # Complete setup guide ⭐
└── SUPABASE-FIRST-ARCHITECTURE.md   # Technical deep dive
```

### SQL Scripts
```
scripts/
└── MASTER-SUPABASE-SETUP.sql        # All-in-one database setup
```

### Test Scripts
```
scripts/
├── test-cdp-wallet-operations.js    # E2E wallet flow test
└── test-supabase-first-flow.js      # Architecture compliance test
```

### Application Code
```
app/api/wallet/
├── create/route.ts                  # POST: Create wallet
├── fund/route.ts                    # POST: Request testnet funds
├── transfer/route.ts                # POST: Transfer USDC
└── list/route.ts                    # GET: List wallets + balances

components/
└── profile-wallet-card.tsx          # Wallet UI component

app/protected/profile/page.tsx       # Profile page with wallet
```

---

## 🔐 Security

### Row-Level Security (RLS)

All tables protected:
- ✅ Users can only see their own wallets
- ✅ Users can only see their own transactions
- ✅ All operations verified against auth.users

### Authentication

- ✅ All API routes require authentication
- ✅ Wallet ownership verified before operations
- ✅ Service role key never exposed to client

### Best Practices

- Never commit secrets to git
- Rotate API keys regularly
- Use testnet for development
- Monitor transaction logs
- Set up alerts for failed transactions

---

## 🧪 Testing

### Database Verification

```sql
-- Verify setup complete
SELECT 
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_name IN ('user_wallets', 'wallet_transactions')) as tables_created,
  (SELECT COUNT(*) FROM pg_policies 
   WHERE tablename IN ('user_wallets', 'wallet_transactions')) as rls_policies;
-- Expected: tables_created = 2, rls_policies = 6
```

### End-to-End Test

```bash
# Run complete wallet flow test
node scripts/testing/test-cdp-wallet-operations.js

# Expected output:
# ✅ User created
# ✅ Profile auto-created
# ✅ User authenticated
# ✅ Wallet created
# ✅ Wallet stored in database
# ✅ Transactions logged
# ✅ Wallet balances retrieved
```

### Manual Testing

1. Sign up new user
2. Navigate to `/protected/profile`
3. Create wallet
4. Request ETH → Verify balance updates
5. Request USDC → Verify balance updates
6. Check database for wallet and transactions

---

## 📞 Support

### Documentation
- **Setup**: [MASTER-SETUP-GUIDE.md](./MASTER-SETUP-GUIDE.md)
- **Architecture**: [SUPABASE-FIRST-ARCHITECTURE.md](./SUPABASE-FIRST-ARCHITECTURE.md)
- **Deployment**: `docs/deployment/README.md`

### Debugging

Check these in order:
1. Environment variables in Vercel
2. Database tables exist (`user_wallets`, `wallet_transactions`)
3. RLS policies enabled
4. CDP credentials valid
5. Vercel function logs for errors
6. Supabase database logs

### Common Issues

- **"CDP not configured"**: Check environment variables
- **"Wallet not found"**: Verify wallet in database
- **"Rate limit exceeded"**: Wait 60 seconds between faucet requests
- **"Insufficient funds"**: Request more testnet tokens

See full troubleshooting guide in [MASTER-SETUP-GUIDE.md](./MASTER-SETUP-GUIDE.md#troubleshooting)

---

## 🎯 Success Checklist

- [ ] Master SQL script executed successfully
- [ ] Environment variables configured in Vercel
- [ ] Test user can create wallet
- [ ] Wallet appears on profile page
- [ ] ETH funding works
- [ ] USDC funding works
- [ ] Balances display correctly
- [ ] Wallet exists in `user_wallets` table
- [ ] Transactions logged in `wallet_transactions` table

---

## 📈 Monitoring

### Health Check Queries

```sql
-- Wallets created today
SELECT COUNT(*) FROM user_wallets 
WHERE created_at > CURRENT_DATE;

-- Transaction success rate
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM wallet_transactions
GROUP BY status;

-- Most active users
SELECT user_id, COUNT(*) as operations
FROM wallet_transactions
GROUP BY user_id
ORDER BY operations DESC
LIMIT 10;
```

---

## 🔗 External Resources

- [Coinbase CDP Documentation](https://docs.cdp.coinbase.com/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Base Sepolia Testnet Info](https://docs.base.org/docs/network-information#base-testnet-sepolia)
- [BaseScan Explorer](https://sepolia.basescan.org/)

---

## 🚀 What's Next?

### For New Users
1. Read [MASTER-SETUP-GUIDE.md](./MASTER-SETUP-GUIDE.md)
2. Run master SQL script
3. Configure environment variables
4. Test with new user account

### For Existing Deployments
1. Verify current setup against master guide
2. Run database verification queries
3. Test wallet operations
4. Monitor transaction logs

### For Development
1. Review [SUPABASE-FIRST-ARCHITECTURE.md](./SUPABASE-FIRST-ARCHITECTURE.md)
2. Understand data flow
3. Check API implementation in `app/api/wallet/`
4. Run tests with `test-cdp-wallet-operations.js`

---

**Version**: 1.0  
**Status**: ✅ Production Ready  
**Last Updated**: October 3, 2025

**Ready to get started?** → [MASTER-SETUP-GUIDE.md](./MASTER-SETUP-GUIDE.md) 🚀
