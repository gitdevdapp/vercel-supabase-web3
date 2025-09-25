'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EthereumIcon } from './icons/ChainIcons';
import { createClient } from '@/lib/supabase/client';

interface EthereumLoginButtonProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  redirectTo?: string;
}

export function EthereumLoginButton({ 
  className,
  size = 'default',
  variant = 'outline',
  redirectTo = '/protected/profile'
}: EthereumLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

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

      // Sign in with Web3 using Supabase
      const { data, error } = await supabase.auth.signInWithWeb3({
        chain: 'ethereum',
        statement: 'I accept the Terms of Service and Privacy Policy for this application.',
      });

      if (error) throw error;

      if (data) {
        // Successful authentication - redirect to profile
        router.push(redirectTo);
      }
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
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isConnected?: () => boolean;
      selectedAddress?: string;
    };
  }
}
