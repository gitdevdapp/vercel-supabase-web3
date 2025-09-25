'use client';

import { EthereumLoginButton } from './EthereumLoginButton';
import { SolanaLoginButton } from './SolanaLoginButton';
import { BaseLoginButton } from './BaseLoginButton';
import { GitHubLoginButton } from './GitHubLoginButton';

interface Web3LoginButtonsProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  layout?: 'grid' | 'stack';
  redirectTo?: string;
  showGitHub?: boolean;
  showEthereum?: boolean;
  showSolana?: boolean;
  showBase?: boolean;
}

export function Web3LoginButtons({
  className = '',
  size = 'default',
  layout = 'grid',
  redirectTo = '/protected/profile',
  showGitHub = true,
  showEthereum = true,
  showSolana = true,
  showBase = true
}: Web3LoginButtonsProps) {
  const layoutClasses = layout === 'grid' 
    ? 'grid grid-cols-2 gap-3' 
    : 'flex flex-col gap-3';

  return (
    <div className={`${layoutClasses} ${className}`}>
      {showEthereum && (
        <EthereumLoginButton
          size={size}
          redirectTo={redirectTo}
          className={layout === 'stack' ? 'w-full' : ''}
        />
      )}
      
      {showSolana && (
        <SolanaLoginButton
          size={size}
          redirectTo={redirectTo}
          className={layout === 'stack' ? 'w-full' : ''}
        />
      )}
      
      {showBase && (
        <BaseLoginButton
          size={size}
          redirectTo={redirectTo}
          className={layout === 'stack' ? 'w-full' : ''}
        />
      )}
      
      {showGitHub && (
        <GitHubLoginButton
          size={size}
          redirectTo={redirectTo}
          className={layout === 'stack' ? 'w-full' : ''}
        />
      )}
    </div>
  );
}

// Alternative compact layout for smaller spaces
export function Web3LoginButtonsCompact({
  className = '',
  redirectTo = '/protected/profile'
}: {
  className?: string;
  redirectTo?: string;
}) {
  return (
    <div className={`flex gap-2 ${className}`}>
      <EthereumLoginButton
        size="sm"
        variant="outline"
        redirectTo={redirectTo}
        className="flex-1"
      />
      <SolanaLoginButton
        size="sm"
        variant="outline"
        redirectTo={redirectTo}
        className="flex-1"
      />
      <BaseLoginButton
        size="sm"
        variant="outline"
        redirectTo={redirectTo}
        className="flex-1"
      />
      <GitHubLoginButton
        size="sm"
        variant="outline"
        redirectTo={redirectTo}
        className="flex-1"
      />
    </div>
  );
}
