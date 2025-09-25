// Feature Flag Utilities
// Centralized feature flag management for progressive rollout

/**
 * Check if a feature flag is enabled
 */
export function getFeatureFlag(flagName: string): boolean {
  if (typeof window === 'undefined') {
    // Server-side: read from environment
    return process.env[flagName] === 'true';
  }
  
  // Client-side: read from window or environment
  return (
    (window as unknown as Record<string, unknown>)[flagName] === 'true' ||
    process.env[flagName] === 'true'
  );
}

/**
 * Check if Web3 authentication is enabled
 */
export function isWeb3AuthEnabled(): boolean {
  return getFeatureFlag('NEXT_PUBLIC_ENABLE_WEB3_AUTH');
}

/**
 * Check if CDP wallets are enabled
 */
export function isCDPWalletsEnabled(): boolean {
  return getFeatureFlag('NEXT_PUBLIC_ENABLE_CDP_WALLETS');
}

/**
 * Check if AI chat is enabled
 */
export function isAIChatEnabled(): boolean {
  return getFeatureFlag('NEXT_PUBLIC_ENABLE_AI_CHAT');
}
