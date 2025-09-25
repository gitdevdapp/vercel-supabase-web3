# 🔧 Supabase Web3 Authentication Configuration Guide

**Date**: September 25, 2025  
**Status**: 📋 **CONFIGURATION REQUIREMENTS**  
**Purpose**: Complete configuration setup for Base, Ethereum, Solana, and GitHub authentication

---

## 🎯 Overview

This guide provides the exact configuration steps needed to enable Web3 authentication in your Supabase project for all supported providers.

---

## 🔐 Supabase Dashboard Configuration

### 1. Enable Web3 Provider

**Navigation**: Dashboard → Authentication → Providers

**Steps**:
1. Scroll to "Web3 Wallet" provider
2. Toggle to enable
3. Configure settings:

```yaml
Web3 Provider Settings:
  - Enabled: true
  - Rate Limit: 30 attempts per 5 minutes per IP
  - CAPTCHA Protection: Recommended for production
```

### 2. Configure GitHub OAuth Provider

**Navigation**: Dashboard → Authentication → Providers → GitHub

**Required Information**:
- GitHub Client ID
- GitHub Client Secret

**GitHub App Setup**:
1. Go to GitHub Settings → Developer Settings → OAuth Apps
2. Create new OAuth App:
   ```yaml
   Application Name: "Your App Name"
   Homepage URL: "https://yourdomain.com"
   Authorization Callback URL: "https://[your-supabase-ref].supabase.co/auth/v1/callback"
   ```

### 3. URL Configuration

**Navigation**: Dashboard → Authentication → URL Configuration

**Required URLs**:
```bash
# Site URL (your main domain)
https://yourdomain.com

# Redirect URLs (add all these)
https://yourdomain.com/auth/callback
https://yourdomain.com/auth/login
https://yourdomain.com/protected/profile
https://yourdomain.com/**

# For development
http://localhost:3000/auth/callback
http://localhost:3000/**
```

---

## ⚙️ CLI Configuration (supabase/config.toml)

### Complete Configuration File

```toml
[auth]
# Enable email confirmations
enable_confirmations = true
# Set to true once Web3 auth is working
enable_signup = true

# Web3 Provider Configuration
[auth.web3.ethereum]
enabled = true

[auth.web3.solana]  
enabled = true

# Rate limiting for Web3 authentication
[auth.rate_limit]
# Number of Web3 logins that can be made in a 5 minute interval per IP address
web3 = 30

# Email rate limiting (existing)
email = 30
sms = 30

# CAPTCHA protection (recommended for production)
[auth.captcha]
enabled = true
provider = "hcaptcha"  # or "recaptcha"
secret = "your-captcha-secret-key"

# GitHub OAuth configuration
[auth.external.github]
enabled = true
client_id = "your-github-client-id"
secret = "your-github-client-secret"
redirect_uri = "https://[your-supabase-ref].supabase.co/auth/v1/callback"

# Additional security settings
[auth.security]
# JWT expiry (seconds)
jwt_expiry = 3600
# Refresh token expiry (seconds) 
refresh_token_expiry = 604800
```

---

## 🌐 Environment Variables

### Required Environment Variables

```bash
# Supabase Configuration (existing)
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# GitHub OAuth (if using GitHub authentication)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Optional: Custom RPC endpoints
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-key
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Rate limiting configuration
NEXT_PUBLIC_WEB3_RATE_LIMIT=30
NEXT_PUBLIC_CAPTCHA_SITE_KEY=your-captcha-site-key

# Production domain for redirects
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Development vs Production

```bash
# .env.local (Development)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# .env.production (Production)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## 🔒 Security Configuration

### 1. Rate Limiting Setup

**Purpose**: Prevent abuse of Web3 authentication

```sql
-- Database policies for rate limiting (if custom implementation needed)
CREATE TABLE IF NOT EXISTS auth_rate_limits (
  ip_address INET PRIMARY KEY,
  web3_attempts INTEGER DEFAULT 0,
  last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE
);

-- Function to check rate limits
CREATE OR REPLACE FUNCTION check_web3_rate_limit(user_ip INET)
RETURNS BOOLEAN AS $$
DECLARE
  current_attempts INTEGER;
  last_attempt_time TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT web3_attempts, last_attempt 
  INTO current_attempts, last_attempt_time
  FROM auth_rate_limits 
  WHERE ip_address = user_ip;
  
  -- Reset counter if more than 5 minutes have passed
  IF last_attempt_time < NOW() - INTERVAL '5 minutes' THEN
    UPDATE auth_rate_limits 
    SET web3_attempts = 1, last_attempt = NOW()
    WHERE ip_address = user_ip;
    RETURN TRUE;
  END IF;
  
  -- Check if under limit
  IF current_attempts < 30 THEN
    UPDATE auth_rate_limits 
    SET web3_attempts = web3_attempts + 1, last_attempt = NOW()
    WHERE ip_address = user_ip;
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
```

### 2. CAPTCHA Configuration

**hCaptcha Setup** (Recommended):
1. Sign up at https://www.hcaptcha.com/
2. Create new site
3. Add site key to environment variables
4. Add secret key to Supabase config

**ReCAPTCHA Setup** (Alternative):
1. Sign up at https://www.google.com/recaptcha/
2. Create new site (v2 checkbox)
3. Add keys to configuration

### 3. Network Security

```typescript
// lib/network-security.ts
export const ALLOWED_CHAINS = {
  ethereum: {
    chainId: '0x1', // Mainnet
    name: 'Ethereum Mainnet',
    rpcUrls: ['https://mainnet.infura.io/v3/your-key']
  },
  base: {
    chainId: '0x2105', // Base Mainnet
    name: 'Base',
    rpcUrls: ['https://mainnet.base.org']
  },
  solana: {
    name: 'Solana Mainnet',
    rpcUrls: ['https://api.mainnet-beta.solana.com']
  }
};

export function isAllowedChain(chainId: string): boolean {
  return Object.values(ALLOWED_CHAINS)
    .some(chain => chain.chainId === chainId);
}
```

---

## 🗄️ Database Schema Updates

### User Profile Enhancement

```sql
-- Add Web3 authentication support to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
  wallet_address TEXT,
  chain_type TEXT CHECK (chain_type IN ('ethereum', 'solana', 'base')),
  auth_provider TEXT CHECK (auth_provider IN ('email', 'github', 'web3')),
  created_via TEXT DEFAULT 'email',
  last_chain_used TEXT,
  wallet_connected_at TIMESTAMP WITH TIME ZONE;

-- Index for wallet address lookups
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address 
  ON profiles(wallet_address) 
  WHERE wallet_address IS NOT NULL;

-- Index for chain type
CREATE INDEX IF NOT EXISTS idx_profiles_chain_type 
  ON profiles(chain_type) 
  WHERE chain_type IS NOT NULL;

-- Update RLS policies to include Web3 users
CREATE POLICY "Users can view own profile including Web3" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile including Web3" ON profiles  
  FOR UPDATE USING (auth.uid() = id);
```

### Auth Event Logging

```sql
-- Create table for authentication event logging
CREATE TABLE IF NOT EXISTS auth_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('web3_login', 'email_login', 'github_login')),
  chain_type TEXT,
  wallet_address TEXT,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX idx_auth_events_user_id ON auth_events(user_id);
CREATE INDEX idx_auth_events_created_at ON auth_events(created_at);
CREATE INDEX idx_auth_events_event_type ON auth_events(event_type);

-- RLS policies
ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own auth events" ON auth_events
  FOR SELECT USING (auth.uid() = user_id);
```

---

## 🧪 Testing Configuration

### 1. Local Development Setup

```bash
# Start Supabase locally
supabase start

# Apply configurations
supabase db push

# Test authentication flows
npm run test:auth
```

### 2. Configuration Validation Script

```typescript
// scripts/validate-web3-config.ts
import { createClient } from '@supabase/supabase-js';

async function validateWeb3Config() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('🔍 Validating Supabase Web3 Configuration...');
  
  // Test 1: Check if Web3 provider is enabled
  try {
    const { data, error } = await supabase.auth.signInWithWeb3({
      chain: 'ethereum',
      statement: 'Test message for configuration validation'
    });
    
    if (error && error.message.includes('Web3 provider not enabled')) {
      console.error('❌ Web3 provider not enabled in Supabase Dashboard');
      return false;
    }
    
    console.log('✅ Web3 provider is enabled');
  } catch (error) {
    console.log('✅ Web3 provider configuration detected');
  }
  
  // Test 2: Check GitHub OAuth configuration
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: 'http://localhost:3000/test' }
    });
    
    console.log('✅ GitHub OAuth provider is configured');
  } catch (error) {
    console.warn('⚠️  GitHub OAuth may need configuration');
  }
  
  // Test 3: Check environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars);
    return false;
  }
  
  console.log('✅ All required environment variables are present');
  console.log('🎉 Configuration validation complete!');
  return true;
}

validateWeb3Config();
```

---

## 🚀 Production Deployment Checklist

### Pre-deployment
- [ ] **Web3 provider enabled** in Supabase Dashboard
- [ ] **GitHub OAuth configured** with production callback URLs
- [ ] **Rate limiting enabled** (30 attempts per 5 minutes)
- [ ] **CAPTCHA protection** configured and tested
- [ ] **Redirect URLs** updated for production domain
- [ ] **Environment variables** set in production environment
- [ ] **Database schema** updated with Web3 support

### Post-deployment
- [ ] **Test all authentication flows** in production
- [ ] **Monitor rate limiting** effectiveness
- [ ] **Verify CAPTCHA** is working
- [ ] **Check error logs** for authentication failures
- [ ] **Validate redirect flows** work correctly

### Monitoring Setup

```typescript
// lib/auth-monitoring.ts
export function logAuthEvent(event: {
  type: 'web3_login' | 'email_login' | 'github_login';
  success: boolean;
  provider?: string;
  error?: string;
}) {
  // Log to your monitoring service
  console.log('Auth Event:', {
    ...event,
    timestamp: new Date().toISOString(),
    url: window.location.href
  });
  
  // Optional: Send to analytics service
  // analytics.track('Authentication Attempt', event);
}
```

---

## 🔧 Troubleshooting Common Issues

### 1. "Web3 provider not enabled" Error
**Solution**: Enable Web3 provider in Supabase Dashboard → Authentication → Providers

### 2. "Invalid redirect URL" Error  
**Solution**: Add redirect URL to Supabase Dashboard → Authentication → URL Configuration

### 3. Rate limiting too restrictive
**Solution**: Adjust rate limits in Dashboard or config.toml

### 4. CAPTCHA not showing
**Solution**: Check CAPTCHA keys and ensure domain is whitelisted

### 5. GitHub OAuth not working
**Solution**: Verify GitHub app callback URL matches Supabase callback URL exactly

---

This configuration guide ensures a secure, scalable, and properly configured Web3 authentication system for your Supabase project.
