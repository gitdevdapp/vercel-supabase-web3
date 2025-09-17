# Supabase Database Schema Design

**Date**: September 17, 2025  
**Status**: 🏗️ **SCHEMA DESIGN** - Database Architecture for Admin-Controlled Wallet Archiving  
**Integration Phase**: Phase 1 Foundation

## 🎯 Schema Overview

This schema design enables the migration from localStorage-based wallet archiving to Supabase database-controlled archiving with admin authentication and global control capabilities.

## 📊 Database Tables

### 1. **User Management & Authentication**

#### `auth.users` (Supabase Built-in)
Supabase provides this table automatically for authentication.

#### `public.user_profiles`
```sql
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

### 2. **Wallet Archive System**

#### `public.archived_wallets`
```sql
CREATE TABLE public.archived_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  wallet_name TEXT NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_by UUID REFERENCES auth.users(id) NOT NULL,
  archived_reason TEXT,
  archive_type TEXT NOT NULL DEFAULT 'manual' CHECK (archive_type IN ('manual', 'auto_age', 'auto_limit', 'admin_global')),
  
  -- Original wallet metadata (preserved from CDP)
  original_wallet_data JSONB,
  last_balance_usdc DECIMAL(20, 6),
  last_balance_eth DECIMAL(20, 18),
  last_updated_at TIMESTAMP WITH TIME ZONE,
  
  -- Archive management
  is_permanently_archived BOOLEAN DEFAULT false,
  restore_requested_at TIMESTAMP WITH TIME ZONE,
  restore_requested_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.archived_wallets ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_archived_wallets_address ON public.archived_wallets(wallet_address);
CREATE INDEX idx_archived_wallets_archived_by ON public.archived_wallets(archived_by);
CREATE INDEX idx_archived_wallets_archived_at ON public.archived_wallets(archived_at);
CREATE INDEX idx_archived_wallets_type ON public.archived_wallets(archive_type);

-- Policies
CREATE POLICY "Anyone can view archived wallets" ON public.archived_wallets
  FOR SELECT USING (true);

CREATE POLICY "Admins can archive wallets" ON public.archived_wallets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update archived wallets" ON public.archived_wallets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

#### `public.archive_settings`
```sql
CREATE TABLE public.archive_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.archive_settings ENABLE ROW LEVEL SECURITY;

-- Default settings
INSERT INTO public.archive_settings (setting_key, setting_value, description, updated_by) VALUES
('auto_archive_after_days', '30', 'Number of days after which inactive wallets are auto-archived', (SELECT id FROM auth.users LIMIT 1)),
('max_active_wallets', '10', 'Maximum number of active wallets before auto-archiving oldest', (SELECT id FROM auth.users LIMIT 1)),
('archive_enabled', 'true', 'Global toggle for archive functionality', (SELECT id FROM auth.users LIMIT 1));

-- Policies
CREATE POLICY "Anyone can view archive settings" ON public.archive_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can update archive settings" ON public.archive_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

### 3. **Audit & Activity Logs**

#### `public.archive_activity_log`
```sql
CREATE TABLE public.archive_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('archived', 'restored', 'permanently_archived', 'settings_updated')),
  performed_by UUID REFERENCES auth.users(id) NOT NULL,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB,
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.archive_activity_log ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_archive_activity_wallet ON public.archive_activity_log(wallet_address);
CREATE INDEX idx_archive_activity_performed_by ON public.archive_activity_log(performed_by);
CREATE INDEX idx_archive_activity_performed_at ON public.archive_activity_log(performed_at);

-- Policies
CREATE POLICY "Admins can view activity logs" ON public.archive_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System can insert activity logs" ON public.archive_activity_log
  FOR INSERT WITH CHECK (true);
```

## 🔧 Database Functions

### 1. **Archive Wallet Function**
```sql
CREATE OR REPLACE FUNCTION archive_wallet(
  p_wallet_address TEXT,
  p_wallet_name TEXT,
  p_reason TEXT DEFAULT NULL,
  p_archive_type TEXT DEFAULT 'manual'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_archive_id UUID;
  v_user_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  -- Check if user has permission
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = v_user_id AND role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to archive wallets';
  END IF;
  
  -- Check if wallet is already archived
  IF EXISTS (
    SELECT 1 FROM public.archived_wallets 
    WHERE wallet_address = p_wallet_address
  ) THEN
    RAISE EXCEPTION 'Wallet is already archived';
  END IF;
  
  -- Archive the wallet
  INSERT INTO public.archived_wallets (
    wallet_address,
    wallet_name,
    archived_by,
    archived_reason,
    archive_type
  )
  VALUES (
    p_wallet_address,
    p_wallet_name,
    v_user_id,
    p_reason,
    p_archive_type
  )
  RETURNING id INTO v_archive_id;
  
  -- Log the activity
  INSERT INTO public.archive_activity_log (
    wallet_address,
    action,
    performed_by,
    details
  )
  VALUES (
    p_wallet_address,
    'archived',
    v_user_id,
    jsonb_build_object(
      'archive_type', p_archive_type,
      'reason', p_reason
    )
  );
  
  RETURN v_archive_id;
END;
$$;
```

### 2. **Restore Wallet Function**
```sql
CREATE OR REPLACE FUNCTION restore_wallet(p_wallet_address TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  -- Check if user has permission
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = v_user_id AND role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to restore wallets';
  END IF;
  
  -- Check if wallet is archived
  IF NOT EXISTS (
    SELECT 1 FROM public.archived_wallets 
    WHERE wallet_address = p_wallet_address
  ) THEN
    RAISE EXCEPTION 'Wallet is not archived';
  END IF;
  
  -- Delete from archived wallets
  DELETE FROM public.archived_wallets 
  WHERE wallet_address = p_wallet_address;
  
  -- Log the activity
  INSERT INTO public.archive_activity_log (
    wallet_address,
    action,
    performed_by
  )
  VALUES (
    p_wallet_address,
    'restored',
    v_user_id
  );
  
  RETURN true;
END;
$$;
```

### 3. **Get Archive Statistics Function**
```sql
CREATE OR REPLACE FUNCTION get_archive_statistics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_archived', COUNT(*),
    'archived_this_week', COUNT(*) FILTER (WHERE archived_at >= NOW() - INTERVAL '7 days'),
    'archived_this_month', COUNT(*) FILTER (WHERE archived_at >= NOW() - INTERVAL '30 days'),
    'by_type', jsonb_object_agg(archive_type, type_count)
  )
  INTO v_stats
  FROM (
    SELECT 
      archive_type,
      COUNT(*) as type_count
    FROM public.archived_wallets 
    GROUP BY archive_type
  ) type_stats,
  public.archived_wallets;
  
  RETURN v_stats;
END;
$$;
```

## 🔐 Row Level Security (RLS) Summary

### **Security Model**
- **Public Access**: Read-only access to archived wallet list (addresses only)
- **Admin Access**: Full CRUD operations on archived wallets and settings
- **User Access**: Can view own profile and update personal information
- **Audit Trail**: All archive operations are logged with user attribution

### **Permission Levels**
1. **user**: Can view archived wallets (read-only)
2. **admin**: Can archive/restore wallets, update settings, view logs
3. **super_admin**: Full access including user management

## 📊 Migration Strategy

### **Phase 1: Database Setup**
1. Create all tables and functions
2. Set up RLS policies
3. Create initial admin user
4. Import existing localStorage archive data

### **Phase 2: Dual System**
1. Run both localStorage and Supabase systems in parallel
2. Sync archive operations to both systems
3. Validate data consistency
4. Test admin controls

### **Phase 3: Full Migration**
1. Switch to Supabase as primary system
2. Remove localStorage dependencies
3. Enable admin-only controls
4. Deploy to production

## 🚀 Next Steps

1. **Create Supabase Project**: Set up new Supabase instance
2. **Run Schema**: Execute SQL schema in Supabase
3. **Environment Configuration**: Add Supabase variables
4. **Migration Scripts**: Create data migration utilities
5. **Testing**: Validate schema with sample data

---

**Status**: ✅ **SCHEMA DESIGN COMPLETE**  
**Next Phase**: Migration Planning and Implementation Strategy  
**Ready for**: Phase 1 Database Setup
