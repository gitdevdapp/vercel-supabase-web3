import { NextRequest, NextResponse } from "next/server";
import { CdpClient } from "@coinbase/cdp-sdk";
import { env } from "@/lib/env";
import { createPublicClient, http } from "viem";
import { chain } from "@/lib/accounts";
import { z } from "zod";

const cdp = new CdpClient();

const publicClient = createPublicClient({
  chain,
  transport: http(),
});

const fundWalletSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format"),
  token: z.enum(["usdc", "eth"], {
    errorMap: () => ({ message: "Token must be 'usdc' or 'eth'" })
  })
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = fundWalletSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { address, token } = validation.data;

    // Only allow funding on testnet
    if (env.NETWORK !== "base-sepolia") {
      return NextResponse.json(
        { error: "Funding only available on testnet (base-sepolia)" },
        { status: 403 }
      );
    }

    // Request funds from faucet
    const { transactionHash } = await cdp.evm.requestFaucet({
      address,
      network: env.NETWORK,
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
