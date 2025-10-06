import { NextResponse } from "next/server";
import { CdpClient } from "@coinbase/cdp-sdk";
import { env } from "@/lib/env";

/**
 * DIAGNOSTIC ENDPOINT - Testing CDP client initialization strategies
 * This endpoint tests different ways to initialize the CDP client
 */
export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    environment: {
      hasApiKeyId: !!env.CDP_API_KEY_ID,
      hasApiKeySecret: !!env.CDP_API_KEY_SECRET,
      hasWalletSecret: !!env.CDP_WALLET_SECRET,
      apiKeyIdLength: env.CDP_API_KEY_ID?.length,
      apiKeyIdPreview: env.CDP_API_KEY_ID?.substring(0, 8),
    },
    tests: []
  };

  // Test 1: Constructor with explicit parameters
  try {
    results.tests.push({
      test: "1_constructor_explicit",
      status: "attempting",
      method: "new CdpClient({ apiKeyId, apiKeySecret, walletSecret })"
    });

    const cdp1 = new CdpClient({
      apiKeyId: env.CDP_API_KEY_ID!,
      apiKeySecret: env.CDP_API_KEY_SECRET!,
      walletSecret: env.CDP_WALLET_SECRET!,
    });

    const accountName1 = `test-constructor-${Date.now()}`;
    const account1 = await cdp1.evm.getOrCreateAccount({ name: accountName1 });

    results.tests[results.tests.length - 1].status = "success";
    results.tests[results.tests.length - 1].address = account1.address;
    results.tests[results.tests.length - 1].accountName = accountName1;

  } catch (error: any) {
    results.tests[results.tests.length - 1].status = "failed";
    results.tests[results.tests.length - 1].error = error.message;
    results.tests[results.tests.length - 1].statusCode = error.statusCode;
    results.tests[results.tests.length - 1].errorType = error.errorType;
    results.tests[results.tests.length - 1].correlationId = error.correlationId;
  }

  // Test 2: Constructor with no parameters (rely on env vars)
  try {
    results.tests.push({
      test: "2_constructor_empty",
      status: "attempting",
      method: "new CdpClient() - relies on process.env"
    });

    // Ensure process.env has the values
    if (typeof process !== 'undefined') {
      process.env.CDP_API_KEY_ID = env.CDP_API_KEY_ID!;
      process.env.CDP_API_KEY_SECRET = env.CDP_API_KEY_SECRET!;
      process.env.CDP_WALLET_SECRET = env.CDP_WALLET_SECRET!;
    }

    const cdp2 = new CdpClient();
    const accountName2 = `test-envvars-${Date.now()}`;
    const account2 = await cdp2.evm.getOrCreateAccount({ name: accountName2 });

    results.tests[results.tests.length - 1].status = "success";
    results.tests[results.tests.length - 1].address = account2.address;
    results.tests[results.tests.length - 1].accountName = accountName2;

  } catch (error: any) {
    results.tests[results.tests.length - 1].status = "failed";
    results.tests[results.tests.length - 1].error = error.message;
    results.tests[results.tests.length - 1].statusCode = error.statusCode;
    results.tests[results.tests.length - 1].errorType = error.errorType;
    results.tests[results.tests.length - 1].correlationId = error.correlationId;
  }

  // Summary
  results.summary = {
    total: results.tests.length,
    passed: results.tests.filter((t: any) => t.status === "success").length,
    failed: results.tests.filter((t: any) => t.status === "failed").length,
  };

  return NextResponse.json(results, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  });
}

