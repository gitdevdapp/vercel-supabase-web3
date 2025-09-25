'use client';

import { useState } from 'react';
// TODO: Uncomment when Web3 auth is implemented
// import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BaseIcon } from './icons/ChainIcons';
// import { createClient } from '@/lib/supabase/client';

interface BaseLoginButtonProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  // TODO: Uncomment when Web3 auth is implemented
  // redirectTo?: string;
}

export function BaseLoginButton({ 
  className,
  size = 'default',
  variant = 'outline'
  // TODO: Uncomment when Web3 auth is implemented
  // redirectTo = '/protected/profile'
}: BaseLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  // TODO: These will be used when Web3 auth is properly implemented
  // const router = useRouter();
  // const supabase = createClient();

  const handleBaseLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if Ethereum wallet is available (Base is Ethereum-compatible)
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask or another Ethereum wallet to continue.');
      }

      // Request account access if needed
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Switch to Base network if not already connected
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2105' }], // Base mainnet chain ID
        });
      } catch (switchError: unknown) {
        // If the chain doesn't exist, add it
        if ((switchError as { code?: number })?.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x2105',
              chainName: 'Base',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org'],
            }],
          });
        } else {
          throw switchError;
        }
      }

      // TODO: Implement Web3 authentication with proper Supabase integration
      // The signInWithWeb3 method doesn't exist in current Supabase version
      throw new Error('Web3 authentication not yet implemented. Please use email/password or GitHub sign-in.');

      // Note: Future implementation will handle successful authentication and redirect
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Base authentication failed';
      setError(errorMessage);
      console.error('Base login error:', err);
      
      // Show error to user (you might want to use a toast notification instead)
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleBaseLogin}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={`
        bg-[#0052FF] hover:bg-[#0041CC] 
        text-white border-[#0052FF] 
        transition-all duration-200 
        shadow-sm hover:shadow-md
        ${className || ''}
      `}
    >
      <BaseIcon className="mr-2 h-4 w-4" />
      {isLoading ? 'Connecting...' : 'Sign in with Base'}
    </Button>
  );
}

// Type declarations for window.ethereum (if not already declared)
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      isConnected?: () => boolean;
      selectedAddress?: string;
    };
  }
}
