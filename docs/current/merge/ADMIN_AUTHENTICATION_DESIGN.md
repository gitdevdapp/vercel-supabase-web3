# Admin Authentication System Design

**Date**: September 17, 2025  
**Status**: 🔐 **AUTHENTICATION DESIGN** - Supabase Admin System Architecture  
**Target**: Global wallet archiving control for authenticated administrators

## 🎯 System Overview

Design a comprehensive Supabase-based authentication system that provides:
- **Zero disruption** to existing unauthenticated user experience
- **Admin-only controls** for global wallet archiving
- **Role-based permissions** with secure access patterns
- **Seamless integration** with existing CDP wallet functionality

## 🏗️ Authentication Architecture

### **1. User Roles & Permissions**

```typescript
type UserRole = 'user' | 'admin' | 'super_admin';

interface UserPermissions {
  user: {
    canView: ['wallets', 'archive_list'];
    canCreate: ['wallets', 'local_archives'];
    canUpdate: ['own_profile'];
    canDelete: ['own_wallets'];
  };
  admin: {
    canView: ['wallets', 'archive_list', 'archive_stats', 'activity_logs'];
    canCreate: ['wallets', 'global_archives'];
    canUpdate: ['archive_settings', 'wallet_archives'];
    canDelete: ['archived_wallets'];
    canManage: ['wallet_archives'];
  };
  super_admin: {
    inherits: 'admin';
    canManage: ['users', 'roles', 'system_settings'];
    canView: ['audit_logs', 'system_stats'];
  };
}
```

### **2. Access Control Patterns**

#### **Dual Access Mode**
```typescript
interface AccessPattern {
  unauthenticated: {
    // Current behavior - localStorage-based archive
    archiveScope: 'local';
    persistence: 'localStorage';
    access: 'full_client_side';
  };
  authenticated_user: {
    // Enhanced user experience
    archiveScope: 'personal';
    persistence: 'supabase_user_scoped';
    access: 'authenticated_features';
  };
  authenticated_admin: {
    // Global control capabilities
    archiveScope: 'global';
    persistence: 'supabase_admin_controlled';
    access: 'admin_features';
  };
}
```

## 🔐 Authentication Components

### **1. Auth Context Provider**

```typescript
// src/lib/auth/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin' | 'super_admin';
  created_at: string;
  last_login: string;
  is_active: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  const isSuperAdmin = profile?.role === 'super_admin';

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      setProfile(data);
      
      // Update last login
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (error) throw error;

    // Create user profile
    if (data.user) {
      await supabase.from('user_profiles').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: 'user' // Default role
      });
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;
    await loadUserProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isLoading,
      isAdmin,
      isSuperAdmin,
      signIn,
      signUp,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### **2. Authentication UI Components**

#### **Login Component**
```typescript
// src/components/auth/LoginForm.tsx
import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">Password</label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
```

#### **Admin Panel Component**
```typescript
// src/components/admin/AdminPanel.tsx
import { useAuth } from '@/lib/auth/AuthContext';
import { AdminArchiveControls } from './AdminArchiveControls';
import { AdminUserManagement } from './AdminUserManagement';
import { AdminSystemSettings } from './AdminSystemSettings';

export function AdminPanel() {
  const { isAdmin, isSuperAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Admin Controls</h2>
        
        {/* Archive Management - Available to all admins */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Wallet Archive Management</h3>
          <AdminArchiveControls />
        </div>

        {/* User Management - Super Admin only */}
        {isSuperAdmin && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">User Management</h3>
            <AdminUserManagement />
          </div>
        )}

        {/* System Settings - Super Admin only */}
        {isSuperAdmin && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">System Settings</h3>
            <AdminSystemSettings />
          </div>
        )}
      </div>
    </div>
  );
}
```

### **3. Protected Route Component**

```typescript
// src/components/auth/ProtectedRoute.tsx
import { useAuth } from '@/lib/auth/AuthContext';
import { LoginForm } from './LoginForm';
import { Loader } from '@/components/ai-elements/loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  requireSuperAdmin = false,
  fallback 
}: ProtectedRouteProps) {
  const { user, profile, isLoading, isAdmin, isSuperAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Sign In Required</h2>
        <LoginForm />
      </div>
    );
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Super admin privileges required.</p>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Admin privileges required.</p>
      </div>
    );
  }

  return <>{children}</>;
}
```

## 🔄 Integration with Existing Components

### **1. Enhanced Wallet Manager**

```typescript
// Updated WalletManager component
export function WalletManager() {
  const { user, isAdmin } = useAuth();
  // ... existing state and logic

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Wallet Manager</h2>
            
            {/* Archive access based on auth state */}
            {user ? (
              // Authenticated: Show Supabase-based archives
              <SupabaseArchiveButton />
            ) : (
              // Unauthenticated: Show localStorage archives
              <LocalArchiveButton />
            )}
          </div>
          
          {/* Admin controls only for admins */}
          {isAdmin && (
            <AdminArchiveControls />
          )}
        </div>
        
        {/* Rest of component remains unchanged */}
        {/* ... existing wallet management UI */}
      </div>
    </div>
  );
}
```

### **2. Conditional Archive System**

```typescript
// src/lib/archive/ArchiveManager.ts
import { useAuth } from '@/lib/auth/AuthContext';
import { supabaseArchive } from './supabase-archive';
import { localStorageArchive } from './localStorage-archive';

export function useArchiveSystem() {
  const { user, isAdmin } = useAuth();

  // Return appropriate archive system based on auth state
  if (user) {
    return {
      ...supabaseArchive,
      canArchiveGlobally: isAdmin,
      scope: isAdmin ? 'global' : 'user'
    };
  } else {
    return {
      ...localStorageArchive,
      canArchiveGlobally: false,
      scope: 'local'
    };
  }
}
```

## 🛡️ Security Implementation

### **1. Row Level Security Policies**

```sql
-- Ensure users can only see their own archives unless admin
CREATE POLICY "Users see own archives, admins see all" ON public.archived_wallets
  FOR SELECT USING (
    archived_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

### **2. API Route Protection**

```typescript
// src/app/api/admin/archive/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return new Response('Forbidden', { status: 403 });
  }

  // Process admin archive request
  // ... admin archive logic
}
```

## 📱 User Experience Flow

### **1. Unauthenticated User Journey**
1. **Access Homepage** → Full wallet functionality (current experience)
2. **Create/Archive Wallets** → localStorage-based archive (current behavior)
3. **View Archives** → Local archive page (current functionality)
4. **Optional Sign Up** → Enhanced features available

### **2. Authenticated User Journey**
1. **Sign In** → Enhanced archive persistence in Supabase
2. **Create/Archive Wallets** → Database-backed personal archives
3. **Cross-Device Access** → Archives sync across devices
4. **Profile Management** → Update personal settings

### **3. Admin User Journey**
1. **Admin Sign In** → Access admin dashboard
2. **Global Archive Control** → Archive any wallet system-wide
3. **Archive Analytics** → View system-wide archive statistics
4. **User Management** → Manage user roles and permissions (super admin)

## 🔧 Configuration & Setup

### **1. Environment Variables**
```bash
# Add to existing .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Feature flags
NEXT_PUBLIC_ENABLE_AUTH=true
NEXT_PUBLIC_REQUIRE_ADMIN_FOR_GLOBAL_ARCHIVE=true
```

### **2. Initial Admin Setup**
```sql
-- Create first super admin user (run manually in Supabase)
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('admin@example.com', crypt('secure-password', gen_salt('bf')), NOW());

INSERT INTO public.user_profiles (id, email, full_name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@example.com'),
  'admin@example.com',
  'System Administrator',
  'super_admin'
);
```

## 🚀 Implementation Phases

### **Phase 1: Foundation**
- ✅ Add Supabase configuration
- ✅ Create authentication components
- ✅ Implement dual archive system
- ✅ Add optional admin routes

### **Phase 2: Integration**
- ✅ Update existing components for conditional auth
- ✅ Migrate localStorage data to Supabase
- ✅ Enable admin controls
- ✅ Test dual-mode operation

### **Phase 3: Enhancement**
- ✅ Add advanced admin features
- ✅ Implement user management
- ✅ Add audit logging
- ✅ Performance optimization

---

**Status**: ✅ **ADMIN AUTHENTICATION DESIGN COMPLETE**  
**Next Phase**: Comprehensive Migration Planning  
**Ready for**: Implementation Phase 1 - Foundation Setup
