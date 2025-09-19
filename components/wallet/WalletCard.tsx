"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, ExternalLink, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface Wallet {
  name: string;
  address: string;
  balances?: {
    usdc?: number | null;
    eth?: number | null;
  } | null;
  lastUpdated: string;
  error?: string;
}

interface WalletCardProps {
  wallet: Wallet;
  isSelected: boolean;
  onSelect: () => void;
  onRefreshBalance: (address: string) => void;
  onArchive?: (address: string, name: string) => void;
}

export function WalletCard({ wallet, isSelected, onSelect, onRefreshBalance, onArchive }: WalletCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshBalance(wallet.address);
    setIsRefreshing(false);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: number | null | undefined) => {
    if (balance === null || balance === undefined || isNaN(balance)) {
      return "0.0000";
    }
    return Number(balance).toFixed(4);
  };

  const getTimestamp = () => {
    try {
      return new Date(wallet.lastUpdated).toLocaleTimeString();
    } catch {
      return "Unknown";
    }
  };

  return (
    <div
      className={cn(
        "p-4 border rounded-lg cursor-pointer transition-all",
        isSelected 
          ? "border-primary bg-primary/10" 
          : "border-border bg-card text-card-foreground hover:border-primary/50"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-foreground">{wallet.name}</h3>
            {wallet.error && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                Error
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <code className="text-sm text-muted-foreground font-mono">
              {formatAddress(wallet.address)}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyAddress();
              }}
              className="p-1 h-auto"
            >
              <Copy className="h-3 w-3" />
            </Button>
            {copySuccess && (
              <span className="text-xs text-green-600">Copied!</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
              <div className="text-xs text-muted-foreground">USDC</div>
              <div className="font-mono text-sm text-foreground">
                ${formatBalance(wallet.balances?.usdc)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">ETH</div>
              <div className="font-mono text-sm text-foreground">
                {formatBalance(wallet.balances?.eth)} ETH
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground/70">
            Updated: {getTimestamp()}
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-fit">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            disabled={isRefreshing}
            className="p-2"
            title="Refresh Balance"
          >
            <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://sepolia.basescan.org/address/${wallet.address}`, '_blank');
            }}
            className="p-2"
            title="View on Block Explorer"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>

          {onArchive && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onArchive(wallet.address, wallet.name);
              }}
              className="px-3 py-2 border-orange-200 text-orange-600 hover:bg-orange-50/70 hover:border-orange-300 hover:text-orange-700 whitespace-nowrap"
              title="Archive Wallet"
            >
              <Archive className="h-3 w-3 mr-1" />
              <span className="text-xs font-medium">Archive</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
