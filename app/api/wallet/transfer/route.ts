import { NextRequest, NextResponse } from "next/server";
import { CdpClient } from "@coinbase/cdp-sdk";
import { env } from "@/lib/env";
import { z } from "zod";

const cdp = new CdpClient();

// USDC contract details for Base Sepolia
const USDC_CONTRACT_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

const transferSchema = z.object({
  fromAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid from address format"),
  toAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid to address format"),
  amount: z.number().positive("Amount must be positive"),
  token: z.enum(["usdc"], { errorMap: () => ({ message: "Only USDC transfers supported" }) })
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = transferSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { fromAddress, toAddress, amount, token } = validation.data;

    // Only allow transfers on testnet
    if (env.NETWORK !== "base-sepolia") {
      return NextResponse.json(
        { error: "Transfers only available on testnet (base-sepolia)" },
        { status: 403 }
      );
    }

    // Get sender account from CDP
    const accounts = await cdp.evm.listAccounts();
    const accountsArray = Array.isArray(accounts) ? accounts : accounts.accounts || [];
    
    const senderAccount = accountsArray.find(acc => 
      acc.address.toLowerCase() === fromAddress.toLowerCase()
    );
    
    if (!senderAccount) {
      return NextResponse.json(
        { error: "Sender wallet not found in your account list" },
        { status: 404 }
      );
    }

    // Check sender balance first
    try {
      const balances = await senderAccount.listTokenBalances({
        network: env.NETWORK,
      });

      const usdcBalance = balances?.balances?.find(
        (balance: { token?: { symbol?: string }; amount?: string }) => balance?.token?.symbol === "USDC"
      );

      const currentBalance = usdcBalance?.amount ? Number(usdcBalance.amount) / 1000000 : 0;
      
      if (currentBalance < amount) {
        return NextResponse.json(
          { 
            error: "Insufficient USDC balance", 
            available: currentBalance,
            requested: amount 
          },
          { status: 400 }
        );
      }
    } catch (balanceError) {
      console.warn("Could not check balance before transfer:", balanceError);
      // Continue with transfer attempt
    }

    // Execute USDC transfer using CDP's native transfer method
    try {
      // Convert amount to microUSDC (6 decimals)
      const transferAmountMicro = Math.floor(amount * 1000000).toString();
      
      // Use CDP's built-in token transfer
      const transaction = await senderAccount.createTransaction({
        to: toAddress,
        value: "0", // No ETH value
        data: `0xa9059cbb${toAddress.slice(2).padStart(64, '0')}${BigInt(transferAmountMicro).toString(16).padStart(64, '0')}`,
        contractAddress: USDC_CONTRACT_ADDRESS,
        network: env.NETWORK
      });

      const result = await transaction.submit();
      
      return NextResponse.json({
        transactionHash: result.transactionHash,
        status: 'submitted',
        fromAddress,
        toAddress,
        amount,
        token: token.toUpperCase(),
        explorerUrl: `https://sepolia.basescan.org/tx/${result.transactionHash}`,
        timestamp: new Date().toISOString()
      });

    } catch (transferError) {
      console.error("Transfer execution failed:", transferError);
      
      // Try alternative method using raw transaction
      try {
        const transferAmountMicro = Math.floor(amount * 1000000);
        
        // ERC20 transfer function signature: transfer(address,uint256)
        const transferData = `0xa9059cbb${toAddress.slice(2).padStart(64, '0')}${transferAmountMicro.toString(16).padStart(64, '0')}`;
        
        const transaction = await senderAccount.createTransaction({
          to: USDC_CONTRACT_ADDRESS,
          value: "0",
          data: transferData,
          network: env.NETWORK
        });

        const result = await transaction.submit();
        
        return NextResponse.json({
          transactionHash: result.transactionHash,
          status: 'submitted',
          fromAddress,
          toAddress,
          amount,
          token: token.toUpperCase(),
          explorerUrl: `https://sepolia.basescan.org/tx/${result.transactionHash}`,
          timestamp: new Date().toISOString(),
          method: 'raw_transaction'
        });

      } catch (alternativeError) {
        console.error("Alternative transfer method also failed:", alternativeError);
        throw transferError; // Throw original error
      }
    }

  } catch (error) {
    console.error("Transfer error:", error);
    
    let errorMessage = "Transfer failed";
    const errorDetails = error instanceof Error ? error.message : "Unknown error";
    
    // Provide user-friendly error messages
    if (errorDetails.includes("insufficient funds") || errorDetails.includes("insufficient balance")) {
      errorMessage = "Insufficient funds for transfer (including gas fees)";
    } else if (errorDetails.includes("nonce")) {
      errorMessage = "Transaction nonce error - please try again";
    } else if (errorDetails.includes("gas")) {
      errorMessage = "Gas estimation failed - please ensure wallet has ETH for gas";
    } else if (errorDetails.includes("rate limit") || errorDetails.includes("429")) {
      errorMessage = "Rate limit exceeded - please wait before trying again";
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: errorDetails,
        suggestion: "Ensure sender wallet has sufficient USDC and ETH for gas fees"
      },
      { status: 500 }
    );
  }
}
