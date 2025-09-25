'use client';

import { useState } from 'react';
// TODO: Uncomment when Web3 auth is implemented
// import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EthereumIcon } from './icons/ChainIcons';
// import { createClient } from '@/lib/supabase/client';

interface EthereumLoginButtonProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  // TODO: Uncomment when Web3 auth is implemented
  // redirectTo?: string;
}

export function EthereumLoginButton({ 
  className,
  size = 'default',
  variant = 'outline'
  // TODO: Uncomment when Web3 auth is implemented
  // redirectTo = '/protected/profile'
}: EthereumLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  // TODO: These will be used when Web3 auth is properly implemented
  // const router = useRouter();
  // const supabase = createClient();

  const handleEthereumLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if Ethereum wallet is available
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask or another Ethereum wallet to continue.');
      }

      // Request account access if needed
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // TODO: Implement Web3 authentication with proper Supabase integration
      // The signInWithWeb3 method doesn't exist in current Supabase version
      throw new Error('Web3 authentication not yet implemented. Please use email/password or GitHub sign-in.');

      // Note: Future implementation will handle successful authentication and redirect
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ethereum authentication failed';
      setError(errorMessage);
      console.error('Ethereum login error:', err);
      
      // Show error to user (you might want to use a toast notification instead)
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleEthereumLogin}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={`
        bg-[#627EEA] hover:bg-[#4E63D0] 
        text-white border-[#627EEA] 
        transition-all duration-200 
        shadow-sm hover:shadow-md
        ${className || ''}
      `}
    >
      <EthereumIcon className="mr-2 h-4 w-4" />
      {isLoading ? 'Connecting...' : 'Sign in with Ethereum'}
    </Button>
  );
}

// Type declarations for window.ethereum
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
