// Web3 Authentication Types
// Core types for Web3 wallet authentication flow

export interface Web3AuthFlow {
  // Authentication flow steps:
  // 1. Connect wallet
  // 2. Generate nonce  
  // 3. Sign message with wallet
  // 4. Verify signature on server
  // 5. Create/link Supabase user
  // 6. Return session token
  step: 'connect' | 'nonce' | 'sign' | 'verify' | 'create' | 'session';
}

export interface Web3AuthRequest {
  walletAddress: string;
  walletType: 'ethereum' | 'solana' | 'base';
  signature: string;
  message: string;
  nonce: string;
}

export interface Web3AuthResponse {
  success: boolean;
  session?: {
    access_token: string;
    refresh_token: string;
    user: {
      id: string;
      email?: string;
      wallet_address: string;
    };
  };
  error?: string;
}

export interface NonceRequest {
  walletAddress: string;
  walletType: 'ethereum' | 'solana' | 'base';
}

export interface NonceResponse {
  nonce: string;
  message: string;
  expiresAt: string;
}

export interface WalletLinkRequest {
  walletAddress: string;
  walletType: 'ethereum' | 'solana' | 'base';
  signature: string;
  message: string;
  nonce: string;
}

export interface SignatureVerificationResult {
  isValid: boolean;
  recoveredAddress?: string;
  error?: string;
}

export type WalletType = 'ethereum' | 'solana' | 'base';
export type WalletProvider = 'metamask' | 'phantom' | 'coinbase' | 'solflare' | 'unknown';

export interface WalletAuthRecord {
  id: string;
  user_id: string;
  wallet_address: string;
  wallet_type: WalletType;
  nonce?: string;
  nonce_expires_at?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}
