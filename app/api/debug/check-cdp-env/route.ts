import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { isCDPConfigured } from "@/lib/features";

/**
 * Debug endpoint to verify CDP environment variables are loaded in production
 * Remove this file after verification
 */
export async function GET() {
  return NextResponse.json({
    cdp_configured: isCDPConfigured(),
    has_api_key_id: !!env.CDP_API_KEY_ID,
    has_api_key_secret: !!env.CDP_API_KEY_SECRET,
    has_wallet_secret: !!env.CDP_WALLET_SECRET,
    api_key_id_length: env.CDP_API_KEY_ID?.length || 0,
    api_key_id_preview: env.CDP_API_KEY_ID?.substring(0, 8) || 'missing',
    network: env.NETWORK,
    wallet_enabled: env.NEXT_PUBLIC_ENABLE_CDP_WALLETS,
    supabase_configured: !!(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY),
  });
}

