"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Search, 
  Undo2, 
  Archive, 
  Settings, 
  ExternalLink,
  Calendar,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import {
  getArchivedWallets,
  restoreWallet,
  getArchiveStats,
  getArchiveSettings,
  updateArchiveSettings,
  type ArchivedWallet,
  type ArchiveSettings
} from "@/lib/wallet-archive";

export default function WalletArchivePage() {
  const [archivedWallets, setArchivedWallets] = useState<ArchivedWallet[]>([]);
  const [filteredWallets, setFilteredWallets] = useState<ArchivedWallet[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ArchiveSettings>({});
  const [stats, setStats] = useState({ totalArchived: 0, archivedThisWeek: 0, archivedThisMonth: 0 });

  const loadArchivedWallets = () => {
    const archived = getArchivedWallets();
    setArchivedWallets(archived);
  };

  const loadStats = () => {
    const archiveStats = getArchiveStats();
    setStats(archiveStats);
  };

  const loadSettings = () => {
    const archiveSettings = getArchiveSettings();
    setSettings(archiveSettings);
  };

  const filterAndSortWallets = useCallback(() => {
    let filtered = archivedWallets;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(wallet => 
        wallet.name.toLowerCase().includes(term) ||
        wallet.address.toLowerCase().includes(term) ||
        wallet.archivedReason?.toLowerCase().includes(term)
      );
    }

    // Sort wallets
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else {
        return new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime();
      }
    });

    setFilteredWallets(filtered);
  }, [archivedWallets, searchTerm, sortBy]);

  useEffect(() => {
    loadArchivedWallets();
    loadStats();
    loadSettings();
  }, []);

  useEffect(() => {
    filterAndSortWallets();
  }, [filterAndSortWallets]);

  const handleRestoreWallet = (address: string) => {
    restoreWallet(address);
    loadArchivedWallets();
    loadStats();
  };

  const handleUpdateSettings = (newSettings: Partial<ArchiveSettings>) => {
    const updated = { ...settings, ...newSettings };
    updateArchiveSettings(updated);
    setSettings(updated);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Wallet Archive</h1>
                <p className="text-gray-600 mt-1">Manage your archived wallets</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Archive Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Archive className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalArchived}</div>
                <div className="text-sm text-gray-600">Total Archived</div>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.archivedThisWeek}</div>
                <div className="text-sm text-gray-600">This Week</div>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{stats.archivedThisMonth}</div>
                <div className="text-sm text-gray-600">This Month</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Archive Settings */}
        {showSettings && (
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Archive Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Auto-archive after (days)
                </label>
                <Input
                  type="number"
                  placeholder="30"
                  value={settings.autoArchiveAfterDays || ""}
                  onChange={(e) => handleUpdateSettings({ 
                    autoArchiveAfterDays: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Automatically archive wallets with no activity for this many days
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Maximum active wallets
                </label>
                <Input
                  type="number"
                  placeholder="10"
                  value={settings.maxActiveWallets || ""}
                  onChange={(e) => handleUpdateSettings({ 
                    maxActiveWallets: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Archive oldest wallets when this limit is exceeded
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Search and Filter Controls */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, address, or reason..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <Select value={sortBy} onValueChange={(value: "name" | "date") => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="name">Sort by Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Archived Wallets List */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">
            Archived Wallets ({filteredWallets.length})
          </h2>

          {filteredWallets.length === 0 ? (
            <div className="text-center py-12">
              {archivedWallets.length === 0 ? (
                <div>
                  <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Archived Wallets</h3>
                  <p className="text-gray-600">
                    Wallets you archive will appear here. This helps keep your main dashboard clean.
                  </p>
                </div>
              ) : (
                <div>
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
                  <p className="text-gray-600">
                    Try adjusting your search terms or filters.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWallets.map((wallet) => (
                <div
                  key={wallet.address}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{wallet.name}</h3>
                      <code className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                        {formatAddress(wallet.address)}
                      </code>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Archived: {formatDate(wallet.archivedAt)}</span>
                      {wallet.archivedReason && (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {wallet.archivedReason}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://sepolia.basescan.org/address/${wallet.address}`, '_blank')}
                      title="View on Block Explorer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreWallet(wallet.address)}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <Undo2 className="h-4 w-4 mr-1" />
                      Restore
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-600">
          <div className="max-w-2xl mx-auto">
            <p className="mb-2">
              <strong>Note:</strong> Archiving wallets only hides them from your main dashboard. 
              The wallets remain functional and accessible through the Coinbase Developer Platform.
            </p>
            <p>
              You can restore archived wallets at any time to bring them back to your main dashboard.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
