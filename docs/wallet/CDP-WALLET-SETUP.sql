-- ============================================================================
-- CDP WALLET INTEGRATION - PRODUCTION READY (v2.0)
-- Safe to run multiple times (fully idempotent)
-- Creates: user_wallets + wallet_transactions tables
-- 
-- EXECUTION INSTRUCTIONS:
-- 1. Open Supabase Dashboard > SQL Editor
-- 2. Click "+ New query" (NOT saved snippets)
-- 3. Delete any placeholder text
-- 4. Copy this ENTIRE file (Cmd/Ctrl+A, Cmd/Ctrl+C)
-- 5. Paste into the NEW query editor
-- 6. Click "Run" or press Cmd/Ctrl+Enter
-- 
-- DO NOT save as snippet - run directly!
-- ============================================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE 1: user_wallets
-- Links CDP wallet addresses to authenticated Supabase users
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_address TEXT NOT NULL,
  wallet_name TEXT NOT NULL DEFAULT 'My Wallet',
  network TEXT NOT NULL DEFAULT 'base-sepolia',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add foreign key constraint (safe if already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_wallets_user_id_fkey' 
    AND table_name = 'user_wallets'
  ) THEN
    ALTER TABLE public.user_wallets 
    ADD CONSTRAINT user_wallets_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add unique constraint on wallet_address (safe if already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_wallets_wallet_address_key' 
    AND table_name = 'user_wallets'
  ) THEN
    ALTER TABLE public.user_wallets 
    ADD CONSTRAINT user_wallets_wallet_address_key 
    UNIQUE (wallet_address);
  END IF;
END $$;

-- Add validation constraints (safe if already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'valid_ethereum_address'
  ) THEN
    ALTER TABLE public.user_wallets 
    ADD CONSTRAINT valid_ethereum_address 
    CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$');
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'valid_network'
  ) THEN
    ALTER TABLE public.user_wallets 
    ADD CONSTRAINT valid_network 
    CHECK (network IN ('base-sepolia', 'base', 'ethereum-sepolia'));
  END IF;
END $$;

-- Create indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON public.user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_address ON public.user_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_wallets_active ON public.user_wallets(is_active) WHERE is_active = true;

-- ============================================================================
-- TABLE 2: wallet_transactions
-- Logs all wallet operations for audit trail and transaction history
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_id UUID NOT NULL,
  operation_type TEXT NOT NULL,
  token_type TEXT NOT NULL,
  amount DECIMAL(20, 8),
  from_address TEXT,
  to_address TEXT,
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add foreign key constraints (safe if already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'wallet_transactions_user_id_fkey' 
    AND table_name = 'wallet_transactions'
  ) THEN
    ALTER TABLE public.wallet_transactions 
    ADD CONSTRAINT wallet_transactions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'wallet_transactions_wallet_id_fkey' 
    AND table_name = 'wallet_transactions'
  ) THEN
    ALTER TABLE public.wallet_transactions 
    ADD CONSTRAINT wallet_transactions_wallet_id_fkey 
    FOREIGN KEY (wallet_id) REFERENCES public.user_wallets(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add validation constraints (safe if already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'valid_operation'
  ) THEN
    ALTER TABLE public.wallet_transactions 
    ADD CONSTRAINT valid_operation 
    CHECK (operation_type IN ('create', 'fund', 'send', 'receive'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'valid_token'
  ) THEN
    ALTER TABLE public.wallet_transactions 
    ADD CONSTRAINT valid_token 
    CHECK (token_type IN ('eth', 'usdc'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'valid_status'
  ) THEN
    ALTER TABLE public.wallet_transactions 
    ADD CONSTRAINT valid_status 
    CHECK (status IN ('pending', 'success', 'failed'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'valid_tx_hash'
  ) THEN
    ALTER TABLE public.wallet_transactions 
    ADD CONSTRAINT valid_tx_hash 
    CHECK (tx_hash IS NULL OR tx_hash ~ '^0x[a-fA-F0-9]{64}$');
  END IF;
END $$;

-- Create indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_wallet_tx_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet_id ON public.wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_status ON public.wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_created ON public.wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_hash ON public.wallet_transactions(tx_hash) WHERE tx_hash IS NOT NULL;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Ensures users can ONLY access their own wallet data
-- ============================================================================

-- Enable RLS (idempotent)
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (safe if don't exist)
DROP POLICY IF EXISTS "Users can view own wallets" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can insert own wallets" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can update own wallets" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can delete own wallets" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.wallet_transactions;

-- Create RLS policies
CREATE POLICY "Users can view own wallets"
  ON public.user_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallets"
  ON public.user_wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallets"
  ON public.user_wallets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wallets"
  ON public.user_wallets FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions"
  ON public.wallet_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.wallet_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- Utility functions for common wallet operations
-- ============================================================================

-- Function 1: Get user's active wallet
CREATE OR REPLACE FUNCTION public.get_user_wallet(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  wallet_address TEXT,
  wallet_name TEXT,
  network TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uw.id,
    uw.wallet_address,
    uw.wallet_name,
    uw.network,
    uw.is_active,
    uw.created_at
  FROM public.user_wallets uw
  WHERE uw.user_id = p_user_id
    AND uw.is_active = true
  LIMIT 1;
END;
$$;

-- Function 2: Get wallet transaction history
CREATE OR REPLACE FUNCTION public.get_wallet_transactions(
  p_wallet_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  operation_type TEXT,
  token_type TEXT,
  amount DECIMAL,
  from_address TEXT,
  to_address TEXT,
  tx_hash TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wt.id,
    wt.operation_type,
    wt.token_type,
    wt.amount,
    wt.from_address,
    wt.to_address,
    wt.tx_hash,
    wt.status,
    wt.created_at
  FROM public.wallet_transactions wt
  WHERE wt.wallet_id = p_wallet_id
  ORDER BY wt.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Function 3: Log wallet operation
CREATE OR REPLACE FUNCTION public.log_wallet_operation(
  p_user_id UUID,
  p_wallet_id UUID,
  p_operation_type TEXT,
  p_token_type TEXT,
  p_amount DECIMAL DEFAULT NULL,
  p_from_address TEXT DEFAULT NULL,
  p_to_address TEXT DEFAULT NULL,
  p_tx_hash TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'pending',
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction_id UUID;
BEGIN
  INSERT INTO public.wallet_transactions (
    user_id,
    wallet_id,
    operation_type,
    token_type,
    amount,
    from_address,
    to_address,
    tx_hash,
    status,
    error_message
  ) VALUES (
    p_user_id,
    p_wallet_id,
    p_operation_type,
    p_token_type,
    p_amount,
    p_from_address,
    p_to_address,
    p_tx_hash,
    p_status,
    p_error_message
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$;

-- ============================================================================
-- AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_wallet_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_user_wallets_timestamp ON public.user_wallets;
CREATE TRIGGER update_user_wallets_timestamp
  BEFORE UPDATE ON public.user_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_wallet_timestamp();

-- ============================================================================
-- VERIFICATION QUERY
-- Returns setup status - you should see "Setup Complete" with 2 tables, 6 policies
-- ============================================================================

SELECT 
  'Setup Complete' as status,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('user_wallets', 'wallet_transactions')) as tables_created,
  (SELECT COUNT(*) FROM pg_policies 
   WHERE schemaname = 'public' 
   AND tablename IN ('user_wallets', 'wallet_transactions')) as rls_policies,
  (SELECT COUNT(*) FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name LIKE '%wallet%') as helper_functions;

