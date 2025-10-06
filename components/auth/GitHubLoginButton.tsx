'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GitHubIcon } from './icons/ChainIcons';
import { createClient } from '@/lib/supabase/client';
import { getRedirectURL } from '@/lib/auth-helpers';

interface GitHubLoginButtonProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  redirectTo?: string;
}

export function GitHubLoginButton({ 
  className,
  size = 'default',
  variant = 'outline',
  redirectTo = '/protected/profile'
}: GitHubLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use getRedirectURL for consistency across environments
      const callbackUrl = getRedirectURL(`/auth/callback?next=${encodeURIComponent(redirectTo)}`);
      
      console.log('GitHub OAuth initiated:', {
        callbackUrl,
        finalDestination: redirectTo,
        timestamp: new Date().toISOString()
      });

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: callbackUrl
        }
      });

      if (error) throw error;

      // OAuth will redirect the user, so we don't need to handle the response here
      // The callback will handle the final redirect
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'GitHub authentication failed';
      setError(errorMessage);
      console.error('GitHub login error:', err);
      
      // Show error to user (you might want to use a toast notification instead)
      alert(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGitHubLogin}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={`
        bg-gray-900 hover:bg-gray-800 
        text-white border-gray-900 
        transition-all duration-200 
        shadow-sm hover:shadow-md
        dark:bg-gray-100 dark:hover:bg-gray-200 
        dark:text-gray-900 dark:border-gray-100
        ${className || ''}
      `}
    >
      <GitHubIcon className="mr-2 h-4 w-4" />
      {isLoading ? 'Connecting...' : 'Sign in with GitHub'}
    </Button>
  );
}
