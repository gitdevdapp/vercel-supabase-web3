import { Account, toAccount } from "viem/accounts";
import { CdpClient } from "@coinbase/cdp-sdk";
import { base, baseSepolia } from "viem/chains";
import { createPublicClient, http } from "viem";
import { isCDPConfigured, getNetworkSafe, FEATURE_ERRORS } from "./features";

const chainMap = {
  "base-sepolia": baseSepolia,
  base: base,
} as const;

// Lazy initialization functions to avoid build-time failures
function getCdpClient(): CdpClient {
  if (!isCDPConfigured()) {
    throw new Error(FEATURE_ERRORS.CDP_NOT_CONFIGURED);
  }
  return new CdpClient();
}

function getChain() {
  const network = getNetworkSafe() as keyof typeof chainMap;
  return chainMap[network];
}

function getPublicClient() {
  return createPublicClient({
    chain: getChain(),
    transport: http(),
  });
}

// Export the chain getter instead of static chain
export const getChainSafe = getChain;

export async function getOrCreatePurchaserAccount(): Promise<Account> {
  const cdp = getCdpClient();
  const publicClient = getPublicClient();
  const network = getNetworkSafe();
  
  const account = await cdp.evm.getOrCreateAccount({
    name: "Purchaser",
  });
  const balances = await account.listTokenBalances({
    network: network as "base-sepolia" | "base",
  });

  const usdcBalance = balances.balances.find(
    (balance) => balance.token.symbol === "USDC"
  );

  // if under $0.50 while on testnet, request more
  if (
    network === "base-sepolia" &&
    (!usdcBalance || Number(usdcBalance.amount) < 500000)
  ) {
    const { transactionHash } = await cdp.evm.requestFaucet({
      address: account.address,
      network,
      token: "usdc",
    });
    const tx = await publicClient.waitForTransactionReceipt({
      hash: transactionHash,
    });
    if (tx.status !== "success") {
      throw new Error("Failed to recieve funds from faucet");
    }
  }

  return toAccount(account);
}

export async function getOrCreateSellerAccount(): Promise<Account> {
  const cdp = getCdpClient();
  
  const account = await cdp.evm.getOrCreateAccount({
    name: "Seller",
  });
  return toAccount(account);
}
