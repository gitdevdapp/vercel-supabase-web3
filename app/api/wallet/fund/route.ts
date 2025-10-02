import { NextRequest, NextResponse } from "next/server";
import { CdpClient } from "@coinbase/cdp-sdk";
import { createPublicClient, http } from "viem";
import { getChainSafe } from "@/lib/accounts";
import { z } from "zod";
import { isCDPConfigured, getNetworkSafe, FEATURE_ERRORS } from "@/lib/features";
import { createClient } from "@/lib/supabase/server";

function getCdpClient(): CdpClient {
  if (!isCDPConfigured()) {
    throw new Error(FEATURE_ERRORS.CDP_NOT_CONFIGURED);
  }
  return new CdpClient();
}

function getPublicClient() {
  return createPublicClient({
    chain: getChainSafe(),
    transport: http(),
  });
}

const fundWalletSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format"),
  token: z.enum(["usdc", "eth"], {
    errorMap: () => ({ message: "Token must be 'usdc' or 'eth'" })
  })
});

export async function POST(request: NextRequest) {
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
      return NextResponse.json(
        { error: FEATURE_ERRORS.CDP_NOT_CONFIGURED },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validation = fundWalletSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { address, token } = validation.data;
    const network = getNetworkSafe();

    // Only allow funding on testnet
    if (network !== "base-sepolia") {
      return NextResponse.json(
        { error: "Funding only available on testnet (base-sepolia)" },
        { status: 403 }
      );
    }

    const cdp = getCdpClient();
    const publicClient = getPublicClient();

    // Request funds from faucet
    const { transactionHash } = await cdp.evm.requestFaucet({
      address,
      network,
      token: token.toLowerCase() as "usdc" | "eth",
    });

    // Wait for transaction confirmation
    const tx = await publicClient.waitForTransactionReceipt({
      hash: transactionHash,
    });

    if (tx.status !== "success") {
      return NextResponse.json(
        { error: "Funding transaction failed", transactionHash },
        { status: 500 }
      );
    }

    return NextResponse.json({
      transactionHash,
      status: "success",
      token: token.toUpperCase(),
      address,
      explorerUrl: `https://sepolia.basescan.org/tx/${transactionHash}`
    });

  } catch (error) {
    console.error("Funding error:", error);
    
    // Handle specific faucet errors
    if (error instanceof Error && error.message.includes("rate limit")) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before requesting more funds." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fund wallet", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
