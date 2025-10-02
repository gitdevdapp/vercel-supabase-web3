'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Plus, Send, Droplet, Copy, Loader2 } from "lucide-react";

interface WalletData {
  id: string;
  wallet_address: string;
  wallet_name: string;
  network: string;
  balances?: {
    eth: number;
    usdc: number;
  };
}

export function ProfileWalletCard() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showFund, setShowFund] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Wallet creation state
  const [walletName, setWalletName] = useState("");

  // Funding state
  const [fundToken, setFundToken] = useState<'eth' | 'usdc'>('eth');

  // Send state
  const [sendToAddress, setSendToAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendToken, setSendToken] = useState<'eth' | 'usdc'>('usdc');

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      setIsLoading(true);
      
      // First, try to get wallet from database
      const response = await fetch('/api/wallet/list');
      if (!response.ok) throw new Error('Failed to load wallet');
      
      const data = await response.json();
      
      if (data.wallets && data.wallets.length > 0) {
        const firstWallet = data.wallets[0];
        
        // Get balances
        const balanceResponse = await fetch(`/api/wallet/balance?address=${firstWallet.address}`);
        const balanceData = await balanceResponse.json();
        
        setWallet({
          id: firstWallet.address, // Use address as temp ID
          wallet_address: firstWallet.address,
          wallet_name: firstWallet.name,
          network: 'base-sepolia',
          balances: {
            eth: balanceData.eth || 0,
            usdc: balanceData.usdc || 0
          }
        });
      }
    } catch (err) {
      console.error('Error loading wallet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWallet = async () => {
    if (!walletName.trim()) {
      setError('Please enter a wallet name');
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/wallet/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: walletName,
          type: 'custom'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create wallet');
      }

      const data = await response.json();
      setSuccess(`Wallet "${data.name}" created successfully!`);
      setWalletName("");
      
      // Reload wallet
      await loadWallet();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create wallet');
    } finally {
      setIsCreating(false);
    }
  };

  const handleFundWallet = async () => {
    if (!wallet) return;

    setIsFunding(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/wallet/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: wallet.wallet_address,
          token: fundToken
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fund wallet');
      }

      const data = await response.json();
      setSuccess(`Successfully funded with ${data.token}! TX: ${data.transactionHash.slice(0, 10)}...`);
      setShowFund(false);
      
      // Reload wallet to refresh balances
      setTimeout(() => loadWallet(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fund wallet');
    } finally {
      setIsFunding(false);
    }
  };

  const handleSendFunds = async () => {
    if (!wallet || !sendToAddress || !sendAmount) {
      setError('Please fill in all send fields');
      return;
    }

    setIsSending(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAddress: wallet.wallet_address,
          toAddress: sendToAddress,
          amount: parseFloat(sendAmount),
          token: sendToken
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send funds');
      }

      const data = await response.json();
      setSuccess(`Successfully sent ${sendAmount} ${sendToken.toUpperCase()}! TX: ${data.transactionHash.slice(0, 10)}...`);
      setSendToAddress("");
      setSendAmount("");
      setShowSend(false);
      
      // Reload wallet to refresh balances
      setTimeout(() => loadWallet(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send funds');
    } finally {
      setIsSending(false);
    }
  };

  const copyAddress = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet.wallet_address);
      setSuccess('Address copied to clipboard!');
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader className="space-y-1 pb-6">
        <div className="flex items-center gap-3">
          <Wallet className="w-6 h-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">My Wallet</CardTitle>
            <CardDescription className="text-base mt-1">
              Manage your testnet funds (Base Sepolia)
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!wallet ? (
          // Create Wallet Section
          <div className="space-y-4 p-6 rounded-lg border bg-card">
            <div className="text-center space-y-2">
              <Wallet className="w-12 h-12 mx-auto text-muted-foreground" />
              <h3 className="font-semibold text-lg">No Wallet Yet</h3>
              <p className="text-sm text-muted-foreground">
                Create your first wallet to get started with Web3
              </p>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="wallet-name">Wallet Name</Label>
              <Input
                id="wallet-name"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                placeholder="My Wallet"
                maxLength={50}
              />
            </div>

            <Button 
              onClick={handleCreateWallet}
              disabled={!walletName.trim() || isCreating}
              className="w-full h-11"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Wallet
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Wallet Info Section */}
            <div className="space-y-4 p-4 rounded-lg border bg-card">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Wallet Address</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="h-8"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-md border bg-muted font-mono text-sm break-all">
                  {wallet.wallet_address}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">ETH Balance</Label>
                  <div className="p-3 rounded-md border bg-muted text-sm font-semibold">
                    {wallet.balances?.eth.toFixed(4) || '0.0000'} ETH
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">USDC Balance</Label>
                  <div className="p-3 rounded-md border bg-muted text-sm font-semibold">
                    {wallet.balances?.usdc.toFixed(2) || '0.00'} USDC
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                Connected to Base Sepolia Testnet
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => { setShowFund(!showFund); setShowSend(false); }}
                variant="outline"
                className="flex-1 h-11"
              >
                <Droplet className="w-4 h-4 mr-2" />
                Request Testnet Funds
              </Button>
              <Button
                onClick={() => { setShowSend(!showSend); setShowFund(false); }}
                variant="outline"
                className="flex-1 h-11"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Funds
              </Button>
            </div>

            {/* Fund Wallet Section */}
            {showFund && (
              <div className="space-y-4 p-4 rounded-lg border bg-muted">
                <h4 className="font-medium">Request Testnet Funds</h4>
                
                <div className="flex gap-2">
                  <Button
                    variant={fundToken === 'eth' ? 'default' : 'outline'}
                    onClick={() => setFundToken('eth')}
                    className="flex-1"
                  >
                    ETH (0.001)
                  </Button>
                  <Button
                    variant={fundToken === 'usdc' ? 'default' : 'outline'}
                    onClick={() => setFundToken('usdc')}
                    className="flex-1"
                  >
                    USDC (1.0)
                  </Button>
                </div>

                <Button 
                  onClick={handleFundWallet}
                  disabled={isFunding}
                  className="w-full h-11"
                >
                  {isFunding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Requesting...
                    </>
                  ) : (
                    `Request ${fundToken.toUpperCase()}`
                  )}
                </Button>
              </div>
            )}

            {/* Send Funds Section */}
            {showSend && (
              <div className="space-y-4 p-4 rounded-lg border bg-muted">
                <h4 className="font-medium">Send Funds</h4>
                
                <div className="space-y-3">
                  <div>
                    <Label>Recipient Address</Label>
                    <Input
                      value={sendToAddress}
                      onChange={(e) => setSendToAddress(e.target.value)}
                      placeholder="0x..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      placeholder="0.01"
                      step="0.01"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={sendToken === 'usdc' ? 'default' : 'outline'}
                      onClick={() => setSendToken('usdc')}
                      className="flex-1"
                    >
                      USDC
                    </Button>
                    <Button
                      variant={sendToken === 'eth' ? 'default' : 'outline'}
                      onClick={() => setSendToken('eth')}
                      className="flex-1"
                    >
                      ETH
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={handleSendFunds}
                  disabled={!sendToAddress || !sendAmount || isSending}
                  className="w-full h-11"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    `Send ${sendToken.toUpperCase()}`
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Error and Success Messages */}
        {error && (
          <div className="p-4 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="p-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md dark:text-green-400 dark:bg-green-950 dark:border-green-800 flex items-start gap-2">
            <span className="text-lg">✓</span>
            <span>{success}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

