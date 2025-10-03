import { NextRequest, NextResponse } from "next/server";
import { CdpClient } from "@coinbase/cdp-sdk";
import { createPublicClient, http } from "viem";
import { getChainSafe } from "@/lib/accounts";
import { z } from "zod";
import { isCDPConfigured, getNetworkSafe, FEATURE_ERRORS } from "@/lib/features";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

function getCdpClient(): CdpClient {
  if (!isCDPConfigured()) {
    throw new Error(FEATURE_ERRORS.CDP_NOT_CONFIGURED);
  }
  
  return new CdpClient({
    apiKeyId: env.CDP_API_KEY_ID!,
    apiKeySecret: env.CDP_API_KEY_SECRET!,
    walletSecret: env.CDP_WALLET_SECRET!,
  });
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

    // 🔒 Verify wallet ownership
    const { data: wallet, error: walletError } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('wallet_address', address)
      .eq('user_id', user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: 'Wallet not found or unauthorized' },
        { status: 404 }
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
      // Log failed transaction
      await supabase.rpc('log_wallet_operation', {
        p_user_id: user.id,
        p_wallet_id: wallet.id,
        p_operation_type: 'fund',
        p_token_type: token,
        p_amount: token === 'eth' ? 0.001 : 1.0,
        p_to_address: address,
        p_tx_hash: transactionHash,
        p_status: 'failed'
      });

      return NextResponse.json(
        { error: "Funding transaction failed", transactionHash },
        { status: 500 }
      );
    }

    // 📝 Log successful funding
    await supabase.rpc('log_wallet_operation', {
      p_user_id: user.id,
      p_wallet_id: wallet.id,
      p_operation_type: 'fund',
      p_token_type: token,
      p_amount: token === 'eth' ? 0.001 : 1.0,
      p_to_address: address,
      p_tx_hash: transactionHash,
      p_status: 'success'
    });

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
