'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SolanaIcon } from './icons/ChainIcons';
import { createClient } from '@/lib/supabase/client';

interface SolanaLoginButtonProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  redirectTo?: string;
}

export function SolanaLoginButton({ 
  className,
  size = 'default',
  variant = 'outline',
  redirectTo = '/protected/profile'
}: SolanaLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSolanaLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if Solana wallet is available
      if (typeof window.solana === 'undefined') {
        throw new Error('Please install Phantom or another Solana wallet to continue.');
      }

      // Connect to the wallet if not already connected
      if (!window.solana.isConnected) {
        await window.solana.connect();
      }

      // Sign in with Web3 using Supabase
      const { data, error } = await supabase.auth.signInWithWeb3({
        chain: 'solana',
        statement: 'I accept the Terms of Service and Privacy Policy for this application.',
      });

      if (error) throw error;

      if (data) {
        // Successful authentication - redirect to profile
        router.push(redirectTo);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Solana authentication failed';
      setError(errorMessage);
      console.error('Solana login error:', err);
      
      // Show error to user (you might want to use a toast notification instead)
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSolanaLogin}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={`
        bg-gradient-to-r from-[#9945FF] to-[#14F195] 
        hover:from-[#8035E6] hover:to-[#12D187]
        text-white border-0
        transition-all duration-200 
        shadow-sm hover:shadow-md
        ${className || ''}
      `}
    >
      <SolanaIcon className="mr-2 h-4 w-4" />
      {isLoading ? 'Connecting...' : 'Sign in with Solana'}
    </Button>
  );
}

// Type declarations for window.solana
declare global {
  interface Window {
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
