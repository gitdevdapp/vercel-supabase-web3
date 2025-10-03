import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { getChainSafe } from "@/lib/accounts";
import { isCDPConfigured, getNetworkSafe, FEATURE_ERRORS } from "@/lib/features";
import { createClient } from "@/lib/supabase/server";

// USDC contract details for Base Sepolia
const USDC_CONTRACT_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
const USDC_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
] as const;

function getPublicClient() {
  return createPublicClient({
    chain: getChainSafe(),
    transport: http(),
  });
}

export async function GET() {
  try {
    // 🔒 AUTHENTICATION CHECK
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Check if CDP is configured
    if (!isCDPConfigured()) {
      return NextResponse.json({
        error: FEATURE_ERRORS.CDP_NOT_CONFIGURED,
        wallets: [],
        count: 0,
        lastUpdated: new Date().toISOString()
      }, { status: 503 });
    }

    // 🎯 SUPABASE-FIRST: Query database for user's wallets
    const { data: wallets, error: walletsError } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (walletsError) {
      console.error('Error fetching wallets from database:', walletsError);
      return NextResponse.json(
        { error: 'Failed to fetch wallets', details: walletsError.message },
        { status: 500 }
      );
    }

    // If no wallets, return empty list
    if (!wallets || wallets.length === 0) {
      return NextResponse.json({
        wallets: [],
        count: 0,
        lastUpdated: new Date().toISOString()
      });
    }

    const publicClient = getPublicClient();
    const network = getNetworkSafe();

    // Get balances for each wallet using direct blockchain queries
    const walletsWithBalances = await Promise.all(
      wallets.map(async (wallet) => {
        try {
          let usdcAmount = 0;
          let ethAmount = 0;

          if (network === "base-sepolia") {
            try {
              // Get USDC balance from contract
              const contractBalance = await publicClient.readContract({
                address: USDC_CONTRACT_ADDRESS as `0x${string}`,
                abi: USDC_ABI,
                functionName: 'balanceOf',
                args: [wallet.wallet_address as `0x${string}`]
              });
              
              usdcAmount = Number(contractBalance) / 1000000; // USDC has 6 decimals
            } catch {
              // USDC balance fetch failed, default to 0
            }

            try {
              // Get ETH balance directly from blockchain
              const ethBalanceWei = await publicClient.getBalance({
                address: wallet.wallet_address as `0x${string}`
              });
              
              ethAmount = Number(ethBalanceWei) / 1000000000000000000; // Convert wei to ETH
            } catch {
              // ETH balance fetch failed, default to 0
            }
          }

          return {
            id: wallet.id,                          // ✅ Database UUID (critical for operations)
            name: wallet.wallet_name,
            address: wallet.wallet_address,
            network: wallet.network,
            balances: {
              usdc: isNaN(usdcAmount) ? 0 : usdcAmount,
              eth: isNaN(ethAmount) ? 0 : ethAmount,
            },
            created_at: wallet.created_at,
            lastUpdated: new Date().toISOString()
          };
        } catch (error) {
          // Error getting balances for wallet
          console.error(`Error loading balances for ${wallet.wallet_address}:`, error);
          return {
            id: wallet.id,
            name: wallet.wallet_name,
            address: wallet.wallet_address,
            network: wallet.network,
            balances: {
              usdc: 0,
              eth: 0,
            },
            created_at: wallet.created_at,
            lastUpdated: new Date().toISOString(),
            error: "Failed to load balances"
          };
        }
      })
    );

    return NextResponse.json({
      wallets: walletsWithBalances,
      count: walletsWithBalances.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('List wallets error:', error);
    return NextResponse.json(
      { error: "Failed to list wallets", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
