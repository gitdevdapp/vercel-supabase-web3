# Merged Architecture Documentation

**Date**: September 17, 2025  
**Status**: 🏗️ **ARCHITECTURE DESIGN** - Complete System Integration Blueprint  
**Goal**: Document how Supabase authentication and CDP wallet functionality coexist

## 🎯 Architecture Overview

This document defines the comprehensive architecture for merging Supabase authentication and homepage features with the existing CDP wallet functionality, creating a unified system that supports both authenticated admin control and unauthenticated user access.

## 🏛️ System Architecture Layers

### **1. Authentication Layer**
```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Layer                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  │  Unauthenticated│  │  Authenticated  │  │  Admin User     │
│  │  User           │  │  User           │  │                 │
│  │                 │  │                 │  │                 │
│  │ • Local Archive │  │ • Synced Archive│  │ • Global Control│
│  │ • Full CDP      │  │ • Enhanced UX   │  │ • User Mgmt     │
│  │ • localStorage  │  │ • Cross-device  │  │ • System Config │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘
└─────────────────────────────────────────────────────────────┘
```

### **2. Application Layer**
```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐
│  │                   Homepage Layout                       │
│  │  ┌─────────────────┐  ┌─────────────────┐              │
│  │  │  Wallet Manager │  │   AI Chat       │              │
│  │  │  (Enhanced)     │  │  (Unchanged)    │              │
│  │  │                 │  │                 │              │
│  │  │ • CDP Wallets   │  │ • GPT-4o        │              │
│  │  │ • Dual Archive  │  │ • Gemini 2.0    │              │
│  │  │ • Admin Control │  │ • x402 Payments │              │
│  │  │ • USDC Transfer │  │ • Tool Calls    │              │
│  │  └─────────────────┘  └─────────────────┘              │
│  └─────────────────────────────────────────────────────────┘
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐
│  │               Admin Dashboard (New)                     │
│  │                                                         │
│  │ • Global Archive Management • User Role Management     │
│  │ • System Analytics         • Archive Settings         │
│  │ • Audit Logs              • Bulk Operations           │
│  └─────────────────────────────────────────────────────────┘
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **3. Data Layer**
```
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐           ┌─────────────────┐          │
│  │  Coinbase CDP   │           │   Supabase      │          │
│  │                 │           │                 │          │
│  │ • Wallet Data   │◄─────────►│ • User Profiles │          │
│  │ • Balances      │           │ • Archive Data  │          │
│  │ • Transactions  │           │ • Settings      │          │
│  │ • Funding       │           │ • Audit Logs    │          │
│  └─────────────────┘           └─────────────────┘          │
│                                                             │
│  ┌─────────────────┐                                        │
│  │  localStorage   │                                        │
│  │                 │                                        │
│  │ • Fallback      │                                        │
│  │ • Unauthenticated│                                        │
│  │ • Backward Compat│                                        │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

### **1. Wallet Management Flow**
```
User Request
    │
    ▼
┌─────────────────┐
│ Authentication  │
│ Check           │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Unauthenticated │    │ Authenticated   │    │ Admin User      │
│ User Flow       │    │ User Flow       │    │ Flow            │
└─────┬───────────┘    └─────┬───────────┘    └─────┬───────────┘
      │                      │                      │
      ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ CDP + localStorage│    │ CDP + Supabase  │    │ CDP + Supabase  │
│                 │    │ (User Scoped)   │    │ (Global Admin)  │
│ • Create Wallet │    │ • Create Wallet │    │ • All Features  │
│ • Local Archive │    │ • Cloud Archive │    │ • Global Archive│
│ • USDC Transfer │    │ • USDC Transfer │    │ • User Mgmt     │
│ • Balance Check │    │ • Balance Check │    │ • System Config │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **2. Archive System Flow**
```
Archive Request
    │
    ▼
┌─────────────────┐
│ Feature Flag    │
│ Check           │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐         ┌─────────────────┐
│ Supabase        │   NO    │ localStorage    │
│ Enabled?        ├────────►│ Archive         │
└─────┬───────────┘         │ (Current)       │
      │ YES                 └─────────────────┘
      ▼
┌─────────────────┐
│ User            │
│ Authenticated?  │
└─────┬───────────┘
      │
   ┌──┴──┐
   │ YES │ NO
   ▼     ▼
┌─────────────────┐    ┌─────────────────┐
│ Admin User?     │    │ localStorage    │
└─────┬───────────┘    │ Fallback        │
      │                └─────────────────┘
   ┌──┴──┐
   │ YES │ NO
   ▼     ▼
┌─────────────────┐    ┌─────────────────┐
│ Global Archive  │    │ Personal Archive│
│ (Admin Control) │    │ (User Scoped)   │
└─────────────────┘    └─────────────────┘
```

## 🏗️ Component Architecture

### **1. Enhanced Wallet Manager Component**
```typescript
// src/components/wallet/WalletManager.tsx
interface WalletManagerProps {
  // No breaking changes to props interface
}

interface WalletManagerState {
  // Enhanced state for dual archive system
  wallets: Wallet[];
  activeWallets: Wallet[]; // Filtered based on archive system
  archiveStats: ArchiveStats;
  authState: AuthState; // New: authentication state
  archiveMode: 'localStorage' | 'supabase'; // New: determines archive system
}

// Component Flow:
// 1. Check authentication state
// 2. Determine archive system (localStorage vs Supabase)
// 3. Load appropriate archive data
// 4. Render conditional admin controls
// 5. Handle archive operations via selected system
```

### **2. Dual Archive System Architecture**
```typescript
// src/lib/archive/ArchiveManager.ts
interface ArchiveManager {
  // Unified interface for both systems
  archiveWallet(address: string, name: string, reason?: string): Promise<void>;
  restoreWallet(address: string): Promise<void>;
  getArchivedWallets(): Promise<ArchivedWallet[]>;
  getArchiveStats(): Promise<ArchiveStats>;
}

class LocalStorageArchiveManager implements ArchiveManager {
  // Current localStorage implementation
  // Synchronous operations wrapped in Promise for interface compatibility
}

class SupabaseArchiveManager implements ArchiveManager {
  // New Supabase implementation
  // Async database operations with RLS policies
}

// Factory function selects appropriate manager
export function createArchiveManager(authState: AuthState): ArchiveManager {
  const useSupabase = process.env.NEXT_PUBLIC_ENABLE_SUPABASE_AUTH === 'true';
  
  if (useSupabase && authState.user) {
    return new SupabaseArchiveManager(authState);
  } else {
    return new LocalStorageArchiveManager();
  }
}
```

### **3. Authentication Integration Points**
```typescript
// src/app/layout.tsx - Root layout with conditional auth
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const enableAuth = process.env.NEXT_PUBLIC_ENABLE_SUPABASE_AUTH === 'true';
  
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}>
        {enableAuth ? (
          <AuthProvider>
            <AppContent>{children}</AppContent>
          </AuthProvider>
        ) : (
          <AppContent>{children}</AppContent>
        )}
      </body>
    </html>
  );
}

// src/app/page.tsx - Enhanced homepage
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header /> {/* Enhanced with auth controls */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <WalletSection /> {/* Enhanced with admin controls */}
          <AISection />       {/* Unchanged */}
        </div>
        <Footer />
      </main>
    </div>
  );
}
```

## 🔐 Security Architecture

### **1. Row Level Security (RLS) Policies**
```sql
-- User can only access their own archives unless admin
CREATE POLICY "user_archive_access" ON public.archived_wallets
FOR SELECT USING (
  archived_by = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Only admins can create global archives
CREATE POLICY "admin_archive_control" ON public.archived_wallets
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);
```

### **2. API Route Protection**
```typescript
// src/app/api/admin/*/route.ts - Admin API protection pattern
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  // 1. Authenticate user
  const supabase = createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Check admin role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return new Response('Forbidden', { status: 403 });
  }

  // 3. Process admin request
  // ... admin logic
}
```

### **3. Frontend Route Protection**
```typescript
// src/components/auth/ProtectedRoute.tsx - Role-based route protection
export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  fallbackToLocal = false 
}: ProtectedRouteProps) {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  
  if (!user) {
    return fallbackToLocal ? children : <LoginPrompt />;
  }
  
  if (requireAdmin && !isAdmin) {
    return <AccessDenied />;
  }
  
  return <>{children}</>;
}
```

## 📊 Database Schema Integration

### **1. Enhanced Archive Tables**
```sql
-- Main archive table with user attribution
CREATE TABLE public.archived_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  wallet_name TEXT NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_by UUID REFERENCES auth.users(id) NOT NULL,
  archived_reason TEXT,
  archive_type TEXT NOT NULL DEFAULT 'manual',
  
  -- CDP integration fields
  cdp_wallet_id TEXT, -- Link to CDP wallet if available
  last_balance_usdc DECIMAL(20, 6),
  last_balance_eth DECIMAL(20, 18),
  last_activity_at TIMESTAMP WITH TIME ZONE,
  
  -- Admin control fields
  is_globally_archived BOOLEAN DEFAULT false,
  global_archive_reason TEXT,
  globally_archived_by UUID REFERENCES auth.users(id),
  globally_archived_at TIMESTAMP WITH TIME ZONE
);
```

### **2. CDP-Supabase Data Synchronization**
```typescript
// src/lib/integration/cdp-supabase-sync.ts
export async function syncWalletDataToSupabase(
  walletAddress: string,
  cdpWalletData: CDPWalletData
): Promise<void> {
  // Update archive record with latest CDP data
  await supabase
    .from('archived_wallets')
    .update({
      last_balance_usdc: cdpWalletData.balances.usdc,
      last_balance_eth: cdpWalletData.balances.eth,
      last_activity_at: new Date().toISOString(),
      cdp_wallet_id: cdpWalletData.id
    })
    .eq('wallet_address', walletAddress);
}
```

## 🔧 Configuration Architecture

### **1. Environment Configuration**
```typescript
// src/lib/env.ts - Enhanced environment validation
import { z } from 'zod';

const envSchema = z.object({
  // Existing CDP configuration
  CDP_API_KEY_ID: z.string(),
  CDP_API_KEY_SECRET: z.string(),
  CDP_WALLET_SECRET: z.string(),
  VERCEL_AI_GATEWAY_KEY: z.string(),
  NETWORK: z.string().default('base-sepolia'),
  
  // New Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  
  // Feature flags
  NEXT_PUBLIC_ENABLE_SUPABASE_AUTH: z.string().default('false'),
  NEXT_PUBLIC_ENABLE_ADMIN_CONTROLS: z.string().default('false'),
  NEXT_PUBLIC_REQUIRE_AUTH_FOR_ARCHIVE: z.string().default('false'),
});

export const env = envSchema.parse(process.env);

// Configuration validation functions
export function validateSupabaseConfig(): boolean {
  return !!(
    env.NEXT_PUBLIC_SUPABASE_URL &&
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function isSupabaseEnabled(): boolean {
  return env.NEXT_PUBLIC_ENABLE_SUPABASE_AUTH === 'true' && validateSupabaseConfig();
}
```

### **2. Feature Flag System**
```typescript
// src/lib/features/FeatureFlags.ts
interface FeatureFlags {
  supabaseAuth: boolean;
  adminControls: boolean;
  globalArchive: boolean;
  userManagement: boolean;
  advancedAnalytics: boolean;
}

export function getFeatureFlags(): FeatureFlags {
  return {
    supabaseAuth: env.NEXT_PUBLIC_ENABLE_SUPABASE_AUTH === 'true',
    adminControls: env.NEXT_PUBLIC_ENABLE_ADMIN_CONTROLS === 'true',
    globalArchive: isSupabaseEnabled(),
    userManagement: isSupabaseEnabled(),
    advancedAnalytics: isSupabaseEnabled(),
  };
}

// React hook for feature flags
export function useFeatureFlags(): FeatureFlags {
  return useMemo(() => getFeatureFlags(), []);
}
```

## 🚀 Deployment Architecture

### **1. Vercel + Supabase Integration**
```typescript
// vercel.json - Enhanced deployment configuration
{
  "functions": {
    "src/app/api/admin/*/route.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key"
  }
}
```

### **2. Database Migration Pipeline**
```typescript
// scripts/deploy-migration.js
async function deployMigration(phase) {
  console.log(`🚀 Starting Phase ${phase} Migration`);
  
  switch (phase) {
    case 1:
      await setupSupabaseSchema();
      await validateSupabaseConnection();
      break;
    case 2:
      await enableDualArchiveSystem();
      await migrateLocalStorageData();
      break;
    case 3:
      await enableAdvancedFeatures();
      await optimizePerformance();
      break;
  }
  
  console.log(`✅ Phase ${phase} Migration Complete`);
}
```

## 📊 Monitoring & Analytics

### **1. System Health Monitoring**
```typescript
// src/lib/monitoring/SystemHealth.ts
interface SystemHealthMetrics {
  cdpConnectionStatus: 'healthy' | 'degraded' | 'down';
  supabaseConnectionStatus: 'healthy' | 'degraded' | 'down';
  archiveSystemStatus: 'localStorage' | 'supabase' | 'dual';
  activeUsers: number;
  adminUsers: number;
  archiveOperations24h: number;
}

export async function getSystemHealth(): Promise<SystemHealthMetrics> {
  // Monitor both CDP and Supabase connections
  // Track archive system usage
  // Report health metrics
}
```

### **2. Performance Metrics**
```typescript
// src/lib/analytics/PerformanceTracker.ts
export function trackArchiveOperation(
  operation: 'archive' | 'restore' | 'bulk_archive',
  system: 'localStorage' | 'supabase',
  duration: number,
  userType: 'unauthenticated' | 'user' | 'admin'
): void {
  // Track performance metrics for optimization
}
```

## 🔮 Future Architecture Extensibility

### **1. Microservice Preparation**
```typescript
// src/lib/services/ArchiveService.ts - Service-oriented architecture
interface ArchiveService {
  provider: 'localStorage' | 'supabase' | 'external';
  capabilities: string[];
  healthCheck(): Promise<boolean>;
  migrate(toProvider: string): Promise<void>;
}
```

### **2. Plugin Architecture**
```typescript
// src/lib/plugins/PluginManager.ts - Future plugin system
interface ArchivePlugin {
  name: string;
  version: string;
  install(): Promise<void>;
  uninstall(): Promise<void>;
  getFeatures(): string[];
}
```

---

## 📋 Architecture Summary

### **Core Principles Achieved**
- ✅ **Zero Breaking Changes**: Existing functionality fully preserved
- ✅ **Progressive Enhancement**: Features added without disruption
- ✅ **Dual System Support**: localStorage and Supabase coexist seamlessly
- ✅ **Role-Based Access**: Secure admin controls with proper authorization
- ✅ **Scalable Foundation**: Architecture supports future enhancements

### **Integration Points**
- ✅ **Authentication Layer**: Optional Supabase auth with fallback
- ✅ **Data Layer**: CDP + Supabase + localStorage hybrid approach
- ✅ **Component Layer**: Enhanced components with conditional features
- ✅ **API Layer**: Protected admin routes with role validation
- ✅ **Security Layer**: RLS policies and comprehensive access control

### **Deployment Strategy**
- ✅ **Feature Flags**: Gradual rollout capability
- ✅ **Environment Validation**: Comprehensive configuration checks
- ✅ **Monitoring**: System health and performance tracking
- ✅ **Rollback**: Safe rollback procedures at each phase

---

**Status**: ✅ **MERGED ARCHITECTURE DOCUMENTATION COMPLETE**  
**Confidence Level**: Very High - Comprehensive integration strategy with zero-risk approach  
**Ready for**: Implementation Phase 1 Execution  
**Architecture Type**: Hybrid dual-system with progressive enhancement
