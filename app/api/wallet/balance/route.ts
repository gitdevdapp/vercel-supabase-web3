import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPublicClient, http } from "viem";
import { getChainSafe } from "@/lib/accounts";
import { getNetworkSafe } from "@/lib/features";

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

const balanceQuerySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    const validation = balanceQuerySchema.safeParse({ address });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid address format", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Fetching balances for address

    // Primary: Direct blockchain balance check (most reliable)
    let usdcAmount = 0;
    let ethAmount = 0;
    const balanceSource = 'blockchain';
    const network = getNetworkSafe();

    if (network === "base-sepolia") {
      const publicClient = getPublicClient();
      
      try {
        // Get USDC balance from contract
        const contractBalance = await publicClient.readContract({
          address: USDC_CONTRACT_ADDRESS as `0x${string}`,
          abi: USDC_ABI,
          functionName: 'balanceOf',
          args: [validation.data.address as `0x${string}`]
        });
        
        usdcAmount = Number(contractBalance) / 1000000; // USDC has 6 decimals
        // USDC balance retrieved
      } catch {
        // USDC balance fetch failed
      }

      try {
        // Get ETH balance directly from blockchain
        const ethBalanceWei = await publicClient.getBalance({
          address: validation.data.address as `0x${string}`
        });
        
        ethAmount = Number(ethBalanceWei) / 1000000000000000000; // Convert wei to ETH
        // ETH balance retrieved
      } catch {
        // ETH balance fetch failed
      }
    }

    return NextResponse.json({
      usdc: isNaN(usdcAmount) ? 0 : usdcAmount,
      eth: isNaN(ethAmount) ? 0 : ethAmount,
      lastUpdated: new Date().toISOString(),
      address: validation.data.address,
      balanceSource,
      debug: {
        usdcAmount,
        ethAmount,
        network
      }
    });

  } catch (error) {
    // Balance check error
    return NextResponse.json(
      { error: "Failed to check balance", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
