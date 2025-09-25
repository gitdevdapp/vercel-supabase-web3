'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { NonceResponse, Web3AuthResponse } from '@/lib/web3/types';

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

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      const walletAddress = accounts[0];

      if (!walletAddress) {
        throw new Error('No wallet address found');
      }

      // Step 1: Get nonce from server
      const nonceResponse = await fetch('/api/auth/web3/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          walletType: 'ethereum'
        })
      });

      if (!nonceResponse.ok) {
        const error = await nonceResponse.json();
        throw new Error(error.error || 'Failed to get nonce');
      }

      const nonceData: NonceResponse = await nonceResponse.json();

      // Step 2: Sign message with wallet
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [nonceData.message, walletAddress]
      });

      // Step 3: Verify signature and authenticate
      const verifyResponse = await fetch('/api/auth/web3/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          walletType: 'ethereum',
          signature,
          message: nonceData.message,
          nonce: nonceData.nonce
        })
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        throw new Error(error.error || 'Authentication failed');
      }

      const authData: Web3AuthResponse = await verifyResponse.json();

      if (!authData.success) {
        throw new Error(authData.error || 'Authentication failed');
      }

      // Step 4: Handle session - if it's a magic link, redirect to it for auto-login
      if (authData.session && authData.session.access_token.startsWith('http')) {
        // It's a magic link - redirect to auto-login
        window.location.href = authData.session.access_token;
        return { success: true, data: authData };
      }

      // Step 5: Fallback redirect (shouldn't reach here with current implementation)
      router.push(redirectTo);
      return { success: true, data: authData };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ethereum authentication failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, router]);

  // Web3 authentication for Solana
  const signInWithSolana = useCallback(async (redirectTo: string = '/protected/profile') => {
    setLoading(true);
    setError(null);

    try {
      if (typeof window.solana === 'undefined') {
        throw new Error('Please install Phantom or another Solana wallet to continue.');
      }

      // Connect wallet if not connected
      if (!window.solana.isConnected) {
        await window.solana.connect();
      }

      const walletAddress = window.solana.publicKey?.toString();
      
      if (!walletAddress) {
        throw new Error('No wallet address found');
      }

      // Step 1: Get nonce from server
      const nonceResponse = await fetch('/api/auth/web3/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          walletType: 'solana'
        })
      });

      if (!nonceResponse.ok) {
        const error = await nonceResponse.json();
        throw new Error(error.error || 'Failed to get nonce');
      }

      const nonceData: NonceResponse = await nonceResponse.json();

      // Step 2: Sign message with wallet
      const messageBytes = new TextEncoder().encode(nonceData.message);
      const signedMessage = await window.solana.signMessage(messageBytes);
      
      if (!signedMessage.signature) {
        throw new Error('Failed to sign message');
      }

      // Convert signature to hex string
      const signature = Array.from(signedMessage.signature, byte => byte.toString(16).padStart(2, '0')).join('');

      // Step 3: Verify signature and authenticate
      const verifyResponse = await fetch('/api/auth/web3/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          walletType: 'solana',
          signature,
          message: nonceData.message,
          nonce: nonceData.nonce
        })
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        throw new Error(error.error || 'Authentication failed');
      }

      const authData: Web3AuthResponse = await verifyResponse.json();

      if (!authData.success) {
        throw new Error(authData.error || 'Authentication failed');
      }

      // Step 4: Handle session - if it's a magic link, redirect to it for auto-login
      if (authData.session && authData.session.access_token.startsWith('http')) {
        // It's a magic link - redirect to auto-login
        window.location.href = authData.session.access_token;
        return { success: true, data: authData };
      }

      // Step 5: Fallback redirect (shouldn't reach here with current implementation)
      router.push(redirectTo);
      return { success: true, data: authData };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Solana authentication failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, router]);

  // Base Chain authentication (uses Ethereum signing with Base network)
  const signInWithBase = useCallback(async (redirectTo: string = '/protected/profile') => {
    setLoading(true);
    setError(null);

    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask or another Ethereum wallet to continue.');
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      const walletAddress = accounts[0];

      if (!walletAddress) {
        throw new Error('No wallet address found');
      }

      // Switch to Base network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2105' }], // Base mainnet
        });
      } catch (switchError: unknown) {
        if ((switchError as { code?: number })?.code === 4902) {
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

      // Step 1: Get nonce from server
      const nonceResponse = await fetch('/api/auth/web3/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          walletType: 'base'
        })
      });

      if (!nonceResponse.ok) {
        const error = await nonceResponse.json();
        throw new Error(error.error || 'Failed to get nonce');
      }

      const nonceData: NonceResponse = await nonceResponse.json();

      // Step 2: Sign message with wallet
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [nonceData.message, walletAddress]
      });

      // Step 3: Verify signature and authenticate
      const verifyResponse = await fetch('/api/auth/web3/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          walletType: 'base',
          signature,
          message: nonceData.message,
          nonce: nonceData.nonce
        })
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        throw new Error(error.error || 'Authentication failed');
      }

      const authData: Web3AuthResponse = await verifyResponse.json();

      if (!authData.success) {
        throw new Error(authData.error || 'Authentication failed');
      }

      // Step 4: Handle session - if it's a magic link, redirect to it for auto-login
      if (authData.session && authData.session.access_token.startsWith('http')) {
        // It's a magic link - redirect to auto-login
        window.location.href = authData.session.access_token;
        return { success: true, data: authData };
      }

      // Step 5: Fallback redirect (shouldn't reach here with current implementation)
      router.push(redirectTo);
      return { success: true, data: authData };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Base authentication failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, router]);

  // GitHub OAuth authentication
  const signInWithGitHub = useCallback(async (redirectTo: string = '/protected/profile') => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
        }
      });

      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'GitHub authentication failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
    // Note: Don't set loading to false here as OAuth will redirect
  }, [supabase.auth, setLoading, setError]);

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
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
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
