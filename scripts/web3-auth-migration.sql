-- Web3 Authentication Migration
-- Execute this in your Supabase SQL Editor after the main setup
-- This adds Web3 wallet support to the existing authentication system

-- Add Web3 columns to existing profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wallet_address TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wallet_type TEXT; -- 'ethereum', 'solana', 'base'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wallet_provider TEXT; -- 'metamask', 'phantom', 'coinbase', etc.

-- Create wallet authentication table for nonce management and verification
CREATE TABLE IF NOT EXISTS wallet_auth (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  wallet_type TEXT NOT NULL,
  nonce TEXT,
  nonce_expires_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, wallet_address)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallet_auth_wallet_address ON wallet_auth(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_auth_user_id ON wallet_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_auth_nonce_expires ON wallet_auth(nonce_expires_at);
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON profiles(wallet_address);

-- Enable Row Level Security for wallet_auth table
ALTER TABLE wallet_auth ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Users can view own wallet auth" ON wallet_auth;
DROP POLICY IF EXISTS "Users can update own wallet auth" ON wallet_auth;
DROP POLICY IF EXISTS "Users can insert own wallet auth" ON wallet_auth;

-- Create policies for wallet auth access
CREATE POLICY "Users can view own wallet auth" ON wallet_auth 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet auth" ON wallet_auth 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet auth" ON wallet_auth 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to clean up expired nonces (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_nonces()
RETURNS void AS $$
BEGIN
  DELETE FROM wallet_auth 
  WHERE nonce_expires_at < NOW() 
  AND nonce IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify migration
SELECT 
  'Web3 authentication migration completed successfully!' as message,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'wallet_address') as wallet_columns_added,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'wallet_auth') as wallet_auth_table_created;
