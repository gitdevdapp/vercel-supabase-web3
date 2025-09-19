"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CreateWalletForm } from "./CreateWalletForm";
import { WalletCard } from "./WalletCard";
import { FundingPanel } from "./FundingPanel";
import { USDCTransferPanel } from "./USDCTransferPanel";
import { Loader2 } from "lucide-react";
import { 
  filterActiveWallets, 
  archiveWallet, 
  autoArchiveOldWallets, 
  enforceMaxActiveWallets,
  getArchiveStats
} from "@/lib/wallet-archive";
import { Archive } from "lucide-react";
import Link from "next/link";

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

interface WalletListResponse {
  wallets: Wallet[];
  count: number;
  lastUpdated: string;
}

export function WalletManager() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [activeWallets, setActiveWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'fund' | 'transfer'>('fund');
  const [archiveStats, setArchiveStats] = useState({ totalArchived: 0, archivedThisWeek: 0, archivedThisMonth: 0 });

  // Load wallets on component mount
  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/wallet/list");
      if (!response.ok) {
        throw new Error(`Failed to load wallets: ${response.statusText}`);
      }
      
      const data: WalletListResponse = await response.json();
      setWallets(data.wallets);
      
      // Apply auto-archiving rules
      autoArchiveOldWallets(data.wallets);
      enforceMaxActiveWallets(data.wallets);
      
      // Filter out archived wallets for main display
      const active = filterActiveWallets(data.wallets);
      setActiveWallets(active);
      
      // Load archive statistics
      const stats = getArchiveStats();
      setArchiveStats(stats);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load wallets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWallet = async (name: string, type: "purchaser" | "seller" | "custom") => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await fetch("/api/wallet/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, type }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create wallet");
      }

      const newWallet = await response.json();
      
      // Reload wallets to get the updated list with balances
      await loadWallets();
      setShowCreateForm(false);
      
      // Select the newly created wallet
      setSelectedWallet(newWallet.address);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create wallet");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRefreshBalance = async (address: string) => {
    try {
      const response = await fetch(`/api/wallet/balance?address=${address}`);
      if (!response.ok) {
        throw new Error("Failed to refresh balance");
      }
      
      const balanceData = await response.json();
      
      // Update the specific wallet's balance in both lists
      const updateWallet = (wallet: Wallet) => 
        wallet.address === address
          ? {
              ...wallet,
              balances: {
                usdc: balanceData.usdc ?? 0,
                eth: balanceData.eth ?? 0,
              },
              lastUpdated: balanceData.lastUpdated,
              error: undefined
            }
          : wallet;
      
      setWallets(prevWallets => prevWallets.map(updateWallet));
      setActiveWallets(prevActive => prevActive.map(updateWallet));
    } catch (err) {
      console.error("Failed to refresh balance:", err);
    }
  };

  const handleArchiveWallet = (address: string, name: string) => {
    archiveWallet(address, name, "Manually archived from wallet manager");
    
    // Remove from active wallets and reload stats
    setActiveWallets(prev => prev.filter(w => w.address !== address));
    const stats = getArchiveStats();
    setArchiveStats(stats);
    
    // If the archived wallet was selected, clear selection
    if (selectedWallet === address) {
      setSelectedWallet(null);
    }
  };

  const handleWalletFunded = () => {
    // Reload all wallets after funding
    loadWallets();
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-card text-card-foreground rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Wallet Manager</h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2">Loading wallets...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-card text-card-foreground rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Wallet Manager</h2>
            {archiveStats.totalArchived > 0 && (
              <div className="flex items-center gap-2">
                <Link href="/wallets/archive">
                  <Button variant="outline" size="sm">
                    <Archive className="h-4 w-4 mr-2" />
                    Archive ({archiveStats.totalArchived})
                  </Button>
                </Link>
              </div>
            )}
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create Wallet"}
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </div>
        )}

        {showCreateForm && (
          <div className="mb-6">
            <CreateWalletForm
              onSubmit={handleCreateWallet}
              onCancel={() => setShowCreateForm(false)}
              isLoading={isCreating}
            />
          </div>
        )}

        <div className="space-y-4">
          {activeWallets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {wallets.length === 0 ? (
                <>
                  <p>No wallets found.</p>
                  <p className="text-sm">Create your first wallet to get started!</p>
                </>
              ) : (
                <>
                  <p>No active wallets.</p>
                  <p className="text-sm">All wallets have been archived.</p>
                  <Link href="/wallets/archive">
                    <Button variant="outline" className="mt-2">
                      <Archive className="h-4 w-4 mr-2" />
                      View Archived Wallets
                    </Button>
                  </Link>
                </>
              )}
            </div>
          ) : (
            activeWallets.map((wallet) => (
              <WalletCard
                key={wallet.address}
                wallet={wallet}
                isSelected={selectedWallet === wallet.address}
                onSelect={() => setSelectedWallet(wallet.address)}
                onRefreshBalance={handleRefreshBalance}
                onArchive={handleArchiveWallet}
              />
            ))
          )}
        </div>
      </div>

      {selectedWallet && (
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="bg-card text-card-foreground rounded-lg border">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('fund')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'fund'
                    ? 'border-b-2 border-primary text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Fund Wallet
              </button>
              <button
                onClick={() => setActiveTab('transfer')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'transfer'
                    ? 'border-b-2 border-primary text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Send USDC
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'fund' && (
            <FundingPanel
              walletAddress={selectedWallet}
              onFunded={handleWalletFunded}
            />
          )}
          
          {activeTab === 'transfer' && (
            <USDCTransferPanel
              fromWallet={selectedWallet}
              availableBalance={
                wallets.find(w => w.address === selectedWallet)?.balances?.usdc || 0
              }
              onTransferComplete={handleWalletFunded}
            />
          )}
        </div>
      )}
    </div>
  );
}
