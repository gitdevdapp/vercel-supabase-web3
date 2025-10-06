"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, RefreshCw, Loader2 } from "lucide-react";

interface Transaction {
  id: string;
  operation_type: string;
  token_type: string;
  amount: number | null;
  from_address: string | null;
  to_address: string | null;
  tx_hash: string | null;
  status: string;
  created_at: string;
}

interface TransactionHistoryProps {
  walletId: string;
  walletAddress?: string;
}

export function TransactionHistory({ walletId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/wallet/transactions?walletId=${walletId}`);
      
      if (response.status === 401) {
        window.location.href = '/sign-in?redirectTo=/wallet';
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to load transactions: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletId]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTransactions();
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getOperationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "send":
        return <TrendingDown className="h-4 w-4" />;
      case "fund":
      case "receive":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getOperationBadgeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case "send":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "fund":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "receive":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatAmount = (amount: number | null, tokenType: string) => {
    if (amount === null) return "—";
    const decimals = tokenType.toLowerCase() === "eth" ? 6 : 4;
    return `${amount.toFixed(decimals)} ${tokenType.toUpperCase()}`;
  };

  const formatAddress = (address: string | null) => {
    if (!address) return "—";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`;
    
    return date.toLocaleDateString();
  };

  const openExplorer = (txHash: string) => {
    const explorerUrl = `https://sepolia.basescan.org/tx/${txHash}`;
    window.open(explorerUrl, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-card text-card-foreground rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span>Loading transactions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-card text-card-foreground rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Transaction History</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm mb-4">
          {error}
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-2">No transactions yet</p>
          <p className="text-sm">
            Fund your wallet or make a transfer to see transactions here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => tx.tx_hash && openExplorer(tx.tx_hash)}
              className={`
                p-4 rounded-lg border transition-colors
                ${tx.tx_hash ? 'cursor-pointer hover:bg-muted/50' : ''}
              `}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left side: Status, Operation, Details */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Status Icon */}
                  <div className="mt-1">
                    {getStatusIcon(tx.status)}
                  </div>
                  
                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    {/* Operation Type Badge */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`
                        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border
                        ${getOperationBadgeClass(tx.operation_type)}
                      `}>
                        {getOperationIcon(tx.operation_type)}
                        {tx.operation_type.charAt(0).toUpperCase() + tx.operation_type.slice(1)}
                      </span>
                      <span className="text-sm font-semibold">
                        {tx.amount !== null && (
                          <span className={
                            tx.operation_type === 'send' ? 'text-orange-600' : 'text-green-600'
                          }>
                            {tx.operation_type === 'send' ? '-' : '+'}
                            {formatAmount(tx.amount, tx.token_type)}
                          </span>
                        )}
                      </span>
                    </div>
                    
                    {/* Addresses (if applicable) */}
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      {tx.from_address && (
                        <div>From: <code className="font-mono">{formatAddress(tx.from_address)}</code></div>
                      )}
                      {tx.to_address && (
                        <div>To: <code className="font-mono">{formatAddress(tx.to_address)}</code></div>
                      )}
                      {tx.tx_hash && (
                        <div>
                          TX: <code className="font-mono">{formatAddress(tx.tx_hash)}</code>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Right side: Time and Explorer Link */}
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(tx.created_at)}
                  </span>
                  {tx.tx_hash && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        openExplorer(tx.tx_hash!);
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {transactions.length > 0 && (
        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
          <p>
            <strong>Tip:</strong> Click any transaction to view details on Base Sepolia Explorer
          </p>
        </div>
      )}
    </div>
  );
}

