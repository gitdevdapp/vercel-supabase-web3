import { env } from "./env";

/**
 * Runtime feature detection based on environment configuration
 * These functions safely check if services are properly configured
 */

export function isSupabaseConfigured(): boolean {
  try {
    return !!(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY);
  } catch {
    return false;
  }
}

export function isCDPConfigured(): boolean {
  try {
    return !!(env.CDP_API_KEY_ID && env.CDP_API_KEY_SECRET);
  } catch {
    return false;
  }
}

export function isAIConfigured(): boolean {
  try {
    return !!(env.OPENAI_API_KEY || env.VERCEL_AI_GATEWAY_KEY);
  } catch {
    return false;
  }
}

export function isWalletFeaturesEnabled(): boolean {
  try {
    return env.NEXT_PUBLIC_ENABLE_CDP_WALLETS === "true" && isCDPConfigured();
  } catch {
    return false;
  }
}

export function getNetworkSafe(): string {
  try {
    return env.NETWORK || "base-sepolia";
  } catch {
    return "base-sepolia";
  }
}

/**
 * Error messages for when features are not configured
 */
export const FEATURE_ERRORS = {
  SUPABASE_NOT_CONFIGURED: "Supabase is not properly configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY environment variables.",
  CDP_NOT_CONFIGURED: "CDP wallet service is not configured. Please set CDP_API_KEY_ID and CDP_API_KEY_SECRET environment variables.",
  AI_NOT_CONFIGURED: "AI features are not configured. Please set OPENAI_API_KEY or VERCEL_AI_GATEWAY_KEY environment variables.",
  WALLET_FEATURES_DISABLED: "Wallet features are disabled. Set NEXT_PUBLIC_ENABLE_CDP_WALLETS=true and configure CDP credentials to enable.",
} as const;
