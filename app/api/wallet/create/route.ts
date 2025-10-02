import { NextRequest, NextResponse } from "next/server";
import { getOrCreatePurchaserAccount, getOrCreateSellerAccount } from "@/lib/accounts";
import { CdpClient } from "@coinbase/cdp-sdk";
import { z } from "zod";
import { isCDPConfigured, FEATURE_ERRORS } from "@/lib/features";
import { createClient } from "@/lib/supabase/server";

function getCdpClient(): CdpClient {
  if (!isCDPConfigured()) {
    throw new Error(FEATURE_ERRORS.CDP_NOT_CONFIGURED);
  }
  return new CdpClient();
}

const createWalletSchema = z.object({
  name: z.string().min(1, "Wallet name is required").max(50, "Wallet name too long"),
  type: z.enum(["purchaser", "seller", "custom"], {
    errorMap: () => ({ message: "Type must be 'purchaser', 'seller', or 'custom'" })
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
    const validation = createWalletSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, type } = validation.data;

    let account;
    
    switch (type) {
      case "purchaser":
        account = await getOrCreatePurchaserAccount();
        break;
      case "seller":
        account = await getOrCreateSellerAccount();
        break;
      case "custom":
        // Create custom named account
        const cdp = getCdpClient();
        account = await cdp.evm.getOrCreateAccount({ name });
        break;
      default:
        return NextResponse.json(
          { error: "Invalid wallet type" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      address: account.address,
      name: type === "custom" ? name : type.charAt(0).toUpperCase() + type.slice(1),
      type
    }, { status: 201 });

  } catch (error) {
    console.error("Wallet creation error:", error);
    return NextResponse.json(
      { error: "Failed to create wallet", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
