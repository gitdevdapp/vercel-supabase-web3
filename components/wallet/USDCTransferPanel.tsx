"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, CheckCircle, XCircle, AlertCircle, Send } from "lucide-react";

interface USDCTransferPanelProps {
  fromWallet: string;
  availableBalance: number;
  onTransferComplete: () => void;
}

interface TransferResult {
  transactionHash: string;
  status: string;
  explorerUrl?: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
}

export function USDCTransferPanel({ fromWallet, availableBalance, onTransferComplete }: USDCTransferPanelProps) {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferResult, setTransferResult] = useState<TransferResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const isValidAmount = (amountStr: string) => {
    const num = parseFloat(amountStr);
    return !isNaN(num) && num > 0 && num <= availableBalance;
  };

  const canTransfer = () => {
    return (
      isValidAddress(toAddress) &&
      isValidAmount(amount) &&
      toAddress.toLowerCase() !== fromWallet.toLowerCase() &&
      !isTransferring
    );
  };

  const handleTransfer = async () => {
    if (!canTransfer()) return;

    try {
      setIsTransferring(true);
      setError(null);
      setTransferResult(null);

      const response = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAddress: fromWallet,
          toAddress,
          amount: parseFloat(amount),
          token: 'usdc'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transfer failed');
      }
      
      const result = await response.json();
      setTransferResult(result);
      
      // Clear form
      setToAddress('');
      setAmount('');
      
      // Refresh balances
      setTimeout(() => {
        onTransferComplete();
      }, 2000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transfer failed';
      setError(errorMessage);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleMaxAmount = () => {
    // Leave small amount for gas fees
    const maxTransfer = Math.max(0, availableBalance - 0.01);
    setAmount(maxTransfer.toFixed(2));
  };

  return (
    <div className="p-6 bg-white rounded-lg border">
      <div className="flex items-center gap-2 mb-4">
        <Send className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Send USDC</h3>
      </div>
      
      <div className="space-y-4">
        {/* From Wallet Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From Wallet</label>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <code className="text-sm font-mono text-gray-800">
              {formatAddress(fromWallet)}
            </code>
            <div className="text-sm text-gray-600">
              <strong>{availableBalance.toFixed(4)} USDC</strong> available
            </div>
          </div>
        </div>

        {/* To Address Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Address
          </label>
          <Input
            type="text"
            placeholder="0x..."
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            className={`font-mono ${
              toAddress && !isValidAddress(toAddress) 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : ''
            }`}
          />
          {toAddress && !isValidAddress(toAddress) && (
            <p className="text-sm text-red-600 mt-1">Please enter a valid Ethereum address</p>
          )}
          {toAddress.toLowerCase() === fromWallet.toLowerCase() && (
            <p className="text-sm text-yellow-600 mt-1">Cannot send to the same wallet</p>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Amount (USDC)
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMaxAmount}
              className="text-xs h-auto p-1 text-blue-600 hover:text-blue-800"
            >
              Max
            </Button>
          </div>
          <Input
            type="number"
            step="0.01"
            min="0"
            max={availableBalance}
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`${
              amount && !isValidAmount(amount)
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : ''
            }`}
          />
          {amount && parseFloat(amount) > availableBalance && (
            <p className="text-sm text-red-600 mt-1">
              Insufficient balance. Available: {availableBalance.toFixed(4)} USDC
            </p>
          )}
          {amount && parseFloat(amount) <= 0 && (
            <p className="text-sm text-red-600 mt-1">Amount must be greater than 0</p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <XCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Success Display */}
        {transferResult && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Transfer Submitted!</span>
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <p>Sent <strong>{transferResult.amount} USDC</strong> to {formatAddress(transferResult.toAddress)}</p>
              <p className="font-mono text-xs">TX: {transferResult.transactionHash.slice(0, 16)}...</p>
            </div>
            {transferResult.explorerUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(transferResult.explorerUrl, '_blank')}
                className="mt-3 w-full text-green-700 hover:text-green-800 hover:bg-green-100"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Transaction on Base Sepolia Explorer
              </Button>
            )}
          </div>
        )}

        {/* Transfer Button */}
        <Button
          onClick={handleTransfer}
          disabled={!canTransfer()}
          className="w-full"
          size="lg"
        >
          {isTransferring ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send {amount || '0'} USDC
            </>
          )}
        </Button>

        {/* Info */}
        <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span><strong>Gas Fees:</strong> Small ETH amount required for transaction</span>
          </div>
          <p><strong>Network:</strong> Base Sepolia Testnet</p>
          <p><strong>Confirmation:</strong> Usually takes 10-30 seconds</p>
          <p><strong>Irreversible:</strong> Double-check recipient address</p>
        </div>
      </div>
    </div>
  );
}
