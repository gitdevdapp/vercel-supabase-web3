// CDP-specific types
export interface WalletConfig {
  networkId: string;
  name: string;
  address?: string;
}

export interface CDPUser {
  id: string;
  wallets: WalletConfig[];
  supabaseUserId: string; // Link to Supabase user
}

export interface WalletOperation {
  type: 'create' | 'transfer' | 'fund';
  walletAddress: string;
  amount?: string;
  recipient?: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  supabaseUserId: string;
}
