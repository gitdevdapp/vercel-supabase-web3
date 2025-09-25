'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export interface Web3AuthState {
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
}

export interface WalletInfo {
  name: string;
  isInstalled: boolean;
  isConnected: boolean;
  icon?: string;
}

export function useWeb3Auth() {
  const [state, setState] = useState<Web3AuthState>({
    isLoading: false,
    error: null,
    isConnected: false
  });
  
  const supabase = createClient();
  const router = useRouter();

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // Web3 authentication for Ethereum/Base
  const signInWithEthereum = useCallback(async (redirectTo: string = '/protected/profile') => {
    setLoading(true);
    setError(null);

    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask or another Ethereum wallet to continue.');
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const { data, error } = await supabase.auth.signInWithWeb3({
        chain: 'ethereum',
        statement: 'I accept the Terms of Service and Privacy Policy for this application.',
      });

      if (error) throw error;

      if (data) {
        router.push(redirectTo);
        return { success: true, data };
      }

      return { success: false, error: 'No data returned from authentication' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ethereum authentication failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [supabase, router, setLoading, setError]);

  // Web3 authentication for Solana
  const signInWithSolana = useCallback(async (redirectTo: string = '/protected/profile') => {
    setLoading(true);
    setError(null);

    try {
      if (typeof window.solana === 'undefined') {
        throw new Error('Please install Phantom or another Solana wallet to continue.');
      }

      if (!window.solana.isConnected) {
        await window.solana.connect();
      }

      const { data, error } = await supabase.auth.signInWithWeb3({
        chain: 'solana',
        statement: 'I accept the Terms of Service and Privacy Policy for this application.',
      });

      if (error) throw error;

      if (data) {
        router.push(redirectTo);
        return { success: true, data };
      }

      return { success: false, error: 'No data returned from authentication' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Solana authentication failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [supabase, router, setLoading, setError]);

  // Base Chain authentication (uses Ethereum signing with Base network)
  const signInWithBase = useCallback(async (redirectTo: string = '/protected/profile') => {
    setLoading(true);
    setError(null);

    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask or another Ethereum wallet to continue.');
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Switch to Base network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2105' }], // Base mainnet
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x2105',
              chainName: 'Base',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org'],
            }],
          });
        } else {
          throw switchError;
        }
      }

      const { data, error } = await supabase.auth.signInWithWeb3({
        chain: 'ethereum', // Base uses Ethereum-compatible signing
        statement: 'I accept the Terms of Service and Privacy Policy for this application.',
      });

      if (error) throw error;

      if (data) {
        router.push(redirectTo);
        return { success: true, data };
      }

      return { success: false, error: 'No data returned from authentication' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Base authentication failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [supabase, router, setLoading, setError]);

  // GitHub OAuth authentication
  const signInWithGitHub = useCallback(async (redirectTo: string = '/protected/profile') => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
        }
      });

      if (error) throw error;

      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'GitHub authentication failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
    // Note: Don't set loading to false here as OAuth will redirect
  }, [supabase, setLoading, setError]);

  // Wallet detection utilities
  const detectEthereumWallets = useCallback((): WalletInfo[] => {
    if (typeof window === 'undefined') return [];
    
    const wallets: WalletInfo[] = [];
    
    if (window.ethereum?.isMetaMask) {
      wallets.push({
        name: 'MetaMask',
        isInstalled: true,
        isConnected: window.ethereum.isConnected?.() || false
      });
    }
    
    if (window.ethereum?.isCoinbaseWallet) {
      wallets.push({
        name: 'Coinbase Wallet',
        isInstalled: true,
        isConnected: window.ethereum.isConnected?.() || false
      });
    }
    
    return wallets;
  }, []);

  const detectSolanaWallets = useCallback((): WalletInfo[] => {
    if (typeof window === 'undefined') return [];
    
    const wallets: WalletInfo[] = [];
    
    if (window.phantom?.solana) {
      wallets.push({
        name: 'Phantom',
        isInstalled: true,
        isConnected: window.phantom.solana.isConnected || false
      });
    }
    
    if (window.solflare) {
      wallets.push({
        name: 'Solflare',
        isInstalled: true,
        isConnected: window.solflare.isConnected || false
      });
    }
    
    return wallets;
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    ...state,
    signInWithEthereum,
    signInWithSolana,
    signInWithBase,
    signInWithGitHub,
    detectEthereumWallets,
    detectSolanaWallets,
    clearError
  };
}

// Type declarations for global window objects
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isConnected?: () => boolean;
      selectedAddress?: string;
    };
    solana?: {
      isPhantom?: boolean;
      isSolflare?: boolean;
      isConnected: boolean;
      connect: () => Promise<{ publicKey: string }>;
      disconnect: () => Promise<void>;
      signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
      publicKey?: {
        toString: () => string;
      };
    };
    phantom?: {
      solana?: Window['solana'];
    };
    solflare?: Window['solana'];
    braveSolana?: Window['solana'];
  }
}
