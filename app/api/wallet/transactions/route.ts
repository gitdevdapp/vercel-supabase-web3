import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const transactionsQuerySchema = z.object({
  walletId: z.string().uuid("Invalid wallet ID format"),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50)
});

export async function GET(request: NextRequest) {
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

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get("walletId");
    const limit = searchParams.get("limit");

    const validation = transactionsQuerySchema.safeParse({ 
      walletId, 
      limit: limit ? parseInt(limit) : undefined 
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { walletId: validWalletId, limit: validLimit } = validation.data;

    // 🔒 Verify wallet ownership
    const { data: wallet, error: walletError } = await supabase
      .from('user_wallets')
      .select('id, user_id')
      .eq('id', validWalletId)
      .eq('user_id', user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: 'Wallet not found or unauthorized' },
        { status: 403 }
      );
    }

    // Fetch transactions using existing database function
    const { data: transactions, error: txError } = await supabase
      .rpc('get_wallet_transactions', {
        p_wallet_id: validWalletId,
        p_limit: validLimit
      });

    if (txError) {
      console.error("Failed to fetch transactions:", txError);
      return NextResponse.json(
        { error: 'Failed to fetch transactions', details: txError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      transactions: transactions || [],
      count: transactions?.length || 0,
      walletId: validWalletId
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error("Transaction history error:", error);
    return NextResponse.json(
      { 
        error: "Failed to retrieve transaction history", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

