/**
 * Client-side wallet archival system using localStorage
 * Allows hiding wallets from main view without affecting CDP storage
 */

export interface ArchivedWallet {
  address: string;
  name: string;
  archivedAt: string;
  archivedReason?: string;
}

const ARCHIVE_STORAGE_KEY = 'x402-archived-wallets';
const ARCHIVE_SETTINGS_KEY = 'x402-archive-settings';

export interface ArchiveSettings {
  autoArchiveAfterDays?: number;
  maxActiveWallets?: number;
}

/**
 * Get list of archived wallet addresses
 */
export function getArchivedWalletAddresses(): string[] {
  try {
    const stored = localStorage.getItem(ARCHIVE_STORAGE_KEY);
    if (!stored) return [];
    
    const archived: ArchivedWallet[] = JSON.parse(stored);
    return archived.map(w => w.address);
  } catch (error) {
    console.warn('Failed to load archived wallets:', error);
    return [];
  }
}

/**
 * Get full list of archived wallets
 */
export function getArchivedWallets(): ArchivedWallet[] {
  try {
    const stored = localStorage.getItem(ARCHIVE_STORAGE_KEY);
    if (!stored) return [];
    
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Failed to load archived wallets:', error);
    return [];
  }
}

/**
 * Archive a wallet (hide from main view)
 */
export function archiveWallet(address: string, name: string, reason?: string): void {
  try {
    const archived = getArchivedWallets();
    
    // Don't archive if already archived
    if (archived.some(w => w.address === address)) {
      return;
    }
    
    const newArchived: ArchivedWallet = {
      address,
      name,
      archivedAt: new Date().toISOString(),
      archivedReason: reason
    };
    
    const updated = [newArchived, ...archived];
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to archive wallet:', error);
  }
}

/**
 * Restore a wallet from archive (show in main view)
 */
export function restoreWallet(address: string): void {
  try {
    const archived = getArchivedWallets();
    const updated = archived.filter(w => w.address !== address);
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to restore wallet:', error);
  }
}

/**
 * Check if a wallet is archived
 */
export function isWalletArchived(address: string): boolean {
  const archivedAddresses = getArchivedWalletAddresses();
  return archivedAddresses.includes(address);
}

/**
 * Filter out archived wallets from a wallet list
 */
export function filterActiveWallets<T extends { address: string }>(wallets: T[]): T[] {
  const archivedAddresses = getArchivedWalletAddresses();
  return wallets.filter(wallet => !archivedAddresses.includes(wallet.address));
}

/**
 * Get archive settings
 */
export function getArchiveSettings(): ArchiveSettings {
  try {
    const stored = localStorage.getItem(ARCHIVE_SETTINGS_KEY);
    if (!stored) return {};
    
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Failed to load archive settings:', error);
    return {};
  }
}

/**
 * Update archive settings
 */
export function updateArchiveSettings(settings: Partial<ArchiveSettings>): void {
  try {
    const current = getArchiveSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(ARCHIVE_SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to update archive settings:', error);
  }
}

/**
 * Auto-archive old wallets based on settings
 */
export function autoArchiveOldWallets(wallets: Array<{ address: string; name: string; lastUpdated: string }>): void {
  const settings = getArchiveSettings();
  
  if (!settings.autoArchiveAfterDays) return;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - settings.autoArchiveAfterDays);
  
  wallets.forEach(wallet => {
    const lastUpdate = new Date(wallet.lastUpdated);
    if (lastUpdate < cutoffDate && !isWalletArchived(wallet.address)) {
      archiveWallet(wallet.address, wallet.name, `Auto-archived after ${settings.autoArchiveAfterDays} days of inactivity`);
    }
  });
}

/**
 * Enforce maximum active wallets limit
 */
export function enforceMaxActiveWallets(wallets: Array<{ address: string; name: string; lastUpdated: string }>): void {
  const settings = getArchiveSettings();
  
  if (!settings.maxActiveWallets) return;
  
  const activeWallets = filterActiveWallets(wallets);
  
  if (activeWallets.length > settings.maxActiveWallets) {
    // Archive oldest wallets first
    const sortedByAge = activeWallets.sort((a, b) => 
      new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
    );
    
    const walletsToArchive = sortedByAge.slice(0, activeWallets.length - settings.maxActiveWallets);
    
    walletsToArchive.forEach(wallet => {
      archiveWallet(wallet.address, wallet.name, `Auto-archived to maintain maximum of ${settings.maxActiveWallets} active wallets`);
    });
  }
}

/**
 * Get archive statistics
 */
export function getArchiveStats(): {
  totalArchived: number;
  archivedThisWeek: number;
  archivedThisMonth: number;
} {
  const archived = getArchivedWallets();
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  return {
    totalArchived: archived.length,
    archivedThisWeek: archived.filter(w => new Date(w.archivedAt) > oneWeekAgo).length,
    archivedThisMonth: archived.filter(w => new Date(w.archivedAt) > oneMonthAgo).length
  };
}
