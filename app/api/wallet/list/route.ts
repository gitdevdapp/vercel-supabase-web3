import { NextResponse } from "next/server";
import { CdpClient } from "@coinbase/cdp-sdk";
import { createPublicClient, http } from "viem";
import { getChainSafe } from "@/lib/accounts";
import { isCDPConfigured, getNetworkSafe, FEATURE_ERRORS } from "@/lib/features";

function getCdpClient(): CdpClient {
  if (!isCDPConfigured()) {
    throw new Error(FEATURE_ERRORS.CDP_NOT_CONFIGURED);
  }
  return new CdpClient();
}

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
    // Check if CDP is configured
    if (!isCDPConfigured()) {
      return NextResponse.json({
        error: FEATURE_ERRORS.CDP_NOT_CONFIGURED,
        wallets: [],
        count: 0,
        lastUpdated: new Date().toISOString()
      }, { status: 503 });
    }

    const cdp = getCdpClient();
    const publicClient = getPublicClient();
    
    // Get all accounts from CDP
    const accountsResponse = await cdp.evm.listAccounts();
    
    // Handle both array and object responses
    const accounts = Array.isArray(accountsResponse) 
      ? accountsResponse 
      : accountsResponse.accounts || [];

    // If no accounts, return empty list
    if (!accounts || accounts.length === 0) {
      return NextResponse.json({
        wallets: [],
        count: 0,
        lastUpdated: new Date().toISOString()
      });
    }

    // Get balances for each account using direct blockchain queries
    const walletsWithBalances = await Promise.all(
      accounts.map(async (account) => {
        try {
          console.log(`Fetching balances for ${account.name} (${account.address})`);

          let usdcAmount = 0;
          let ethAmount = 0;
          const network = getNetworkSafe();

          if (network === "base-sepolia") {
            try {
              // Get USDC balance from contract
              const contractBalance = await publicClient.readContract({
                address: USDC_CONTRACT_ADDRESS as `0x${string}`,
                abi: USDC_ABI,
                functionName: 'balanceOf',
                args: [account.address as `0x${string}`]
              });
              
              usdcAmount = Number(contractBalance) / 1000000; // USDC has 6 decimals
            } catch (usdcError) {
              console.warn(`USDC balance fetch failed for ${account.address}:`, usdcError);
            }

            try {
              // Get ETH balance directly from blockchain
              const ethBalanceWei = await publicClient.getBalance({
                address: account.address as `0x${string}`
              });
              
              ethAmount = Number(ethBalanceWei) / 1000000000000000000; // Convert wei to ETH
            } catch (ethError) {
              console.warn(`ETH balance fetch failed for ${account.address}:`, ethError);
            }
          }

          return {
            name: account.name || "Unnamed Wallet",
            address: account.address,
            balances: {
              usdc: isNaN(usdcAmount) ? 0 : usdcAmount,
              eth: isNaN(ethAmount) ? 0 : ethAmount,
            },
            lastUpdated: new Date().toISOString()
          };
        } catch (error) {
          console.error(`Error getting balances for ${account.address}:`, error);
          return {
            name: account.name || "Unnamed Wallet",
            address: account.address,
            balances: {
              usdc: 0,
              eth: 0,
            },
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
    console.error("List wallets error:", error);
    return NextResponse.json(
      { error: "Failed to list wallets", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
