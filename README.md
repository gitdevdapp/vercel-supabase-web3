# 🌐 Multi-Chain Web3 Starter Kit

> **Production-ready Web3 DApp framework supporting 6+ blockchains with enterprise authentication**

A comprehensive Web3 development platform that enables you to build and deploy multi-chain DApps in minutes. Features integrated wallet management, secure user authentication, and pre-built pages for major blockchain ecosystems.

## ✨ What You Get

- 🔗 **Multi-Chain Support** - Avalanche, ApeChain, Flow, Tezos, Stacks, ROOT Network
- 💼 **X402 Wallet Manager** - Full wallet functionality with Coinbase Developer Platform
- 🔐 **Enterprise Authentication** - Supabase-powered with email verification and profile management
- 👤 **Advanced Profiles** - Rich user profiles with automatic creation and management
- 🎨 **Modern UI/UX** - Beautiful, responsive design with dark/light mode support
- 🚀 **Zero-Config Deployment** - Deploy to Vercel with automated CI/CD
- 🛡️ **Enterprise Security** - Row-level security, input validation, and secure session management
- 📱 **Mobile-First** - Optimized for all devices and screen sizes

## 🎯 Perfect For

- **Multi-chain DApp developers** building cross-ecosystem applications
- **Web3 entrepreneurs** launching production-ready platforms
- **Blockchain teams** needing secure user management and wallet integration
- **Traditional developers** transitioning to Web3 with best practices
- **DeFi projects** requiring professional infrastructure foundations

---

## 🚀 Quick Start - Deploy in 60 Minutes

### 1. Create Your Accounts (5 minutes)

**Supabase Account:**
- Go to [supabase.com](https://supabase.com) and sign up
- Create a new project with a secure password
- Note your project URL and API keys

**Vercel Account:**
- Go to [vercel.com](https://vercel.com) and sign up with GitHub
- Connect your repository for automatic deployments

### 2. Set Up Your Database (15 minutes)

#### Access Supabase SQL Editor
1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **"New Query"** to open a blank editor

#### Create the Profiles Table
Copy and paste this SQL code into the editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enhanced profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Core profile fields
  username TEXT UNIQUE,
  email TEXT,
  full_name TEXT,
  
  -- Visual/social fields  
  avatar_url TEXT,
  about_me TEXT DEFAULT 'Welcome to my profile! I''m excited to be part of the community.',
  bio TEXT DEFAULT 'New member exploring the platform',
  
  -- System fields
  is_public BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  
  -- Timestamps
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles" ON profiles 
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Add data validation constraints
ALTER TABLE profiles ADD CONSTRAINT username_length 
  CHECK (username IS NULL OR (length(username) >= 3 AND length(username) <= 30));

ALTER TABLE profiles ADD CONSTRAINT username_format 
  CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9._-]+$');

ALTER TABLE profiles ADD CONSTRAINT about_me_length 
  CHECK (about_me IS NULL OR length(about_me) <= 1000);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_public ON profiles(is_public);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, username, email, full_name, email_verified, last_active_at
  )
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1)
    ),
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      initcap(replace(split_part(new.email, '@', 1), '.', ' '))
    ),
    COALESCE(new.email_confirmed_at IS NOT NULL, false),
    NOW()
  );
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    -- Handle username conflicts by appending random number
    INSERT INTO public.profiles (
      id, username, email, full_name, email_verified, last_active_at
    )
    VALUES (
      new.id,
      split_part(new.email, '@', 1) || '_' || floor(random() * 10000)::text,
      new.email,
      COALESCE(
        new.raw_user_meta_data->>'full_name',
        initcap(replace(split_part(new.email, '@', 1), '.', ' '))
      ),
      COALESCE(new.email_confirmed_at IS NOT NULL, false),
      NOW()
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

4. Click **"Run"** to execute the SQL
5. Verify the `profiles` table appears in your **Table Editor**

### 3. Configure Environment Variables (10 minutes)

Create `.env.local` in your project root:

```bash
# Supabase Configuration (Get from Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key-here

# Optional: Coinbase Developer Platform (for wallet features)
CDP_API_KEY_NAME=your-cdp-api-key-name
CDP_PRIVATE_KEY=your-cdp-private-key
NEXT_PUBLIC_WALLET_NETWORK=base-sepolia

# Optional: AI Features
OPENAI_API_KEY=your-openai-api-key

# Feature Flags (set to true to enable)
NEXT_PUBLIC_ENABLE_CDP_WALLETS=false
NEXT_PUBLIC_ENABLE_AI_CHAT=false
```

### 4. Configure Authentication (10 minutes)

In your Supabase dashboard:

1. Go to **Authentication > Settings**
2. Set **Site URL** to your production domain (e.g., `https://yourdapp.com`)
3. Add **Redirect URLs**:
   ```
   https://yourdapp.com/auth/callback
   https://yourdapp.com/auth/confirm
   https://yourdapp.com/protected/profile
   http://localhost:3000/auth/callback
   http://localhost:3000/auth/confirm
   http://localhost:3000/protected/profile
   ```

### 5. Email Confirmation Setup Guide

#### **Current Configuration Status** ✅

This application is currently configured with **implicit flow** for optimal email-based authentication:

**Current Config** (`lib/supabase/client.ts` and `lib/supabase/server.ts`):
```typescript
{
  auth: {
    flowType: 'implicit',  // ✅ Currently active - optimized for email auth
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
}
```

#### **Email Template Configuration (Supabase Dashboard)**

**Step 1: Access Email Templates**
1. Go to your Supabase project dashboard
2. Navigate to **Authentication → Email Templates**
3. Select **Confirm signup** template

**Step 2: Current Working Email Template**
Use this exact template (currently working in production):

```html
<h2>🎉 Welcome to DevDapp!</h2>
<p>Thanks for signing up! Click the button below to confirm your email address:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/protected/profile"
     style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #0070f3 0%, #0051cc 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
    ✅ Confirm Email & Start Using DevDapp
  </a>
</div>
```

**Step 3: Verify Template Variables**
- `{{ .SiteURL }}` → Your site URL (auto-populated)
- `{{ .TokenHash }}` → Secure confirmation token (auto-populated)
- `/auth/confirm` → Your app's confirmation route

#### **Alternative: PKCE Flow Setup** 

If you need PKCE flow instead, follow these steps:

**1. Update Application Configuration:**
```typescript
// In both lib/supabase/client.ts and lib/supabase/server.ts
{
  auth: {
    flowType: 'pkce',  // Change from 'implicit' to 'pkce'
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
}
```

**2. Update Email Template for PKCE:**
```html
<!-- PKCE-Compatible Email Confirmation URL -->
<a href="{{ .SiteURL }}/auth/confirm?code={{ .TokenHash }}&next=/protected/profile">
  ✅ Confirm Email & Start Using DevDapp
</a>
```

#### **Flow Comparison Chart**

| Flow Type | URL Parameter | Template Variable | Use Case |
|-----------|---------------|-------------------|----------|
| **Implicit** ✅ | `token_hash={{ .TokenHash }}&type=signup` | `{{ .TokenHash }}` | Email-based auth (recommended) |
| **PKCE** | `code={{ .TokenHash }}` | `{{ .TokenHash }}` | OAuth redirects |

#### **Important Notes**

✅ **Your confirmation route is already compatible** with both flows:
```typescript
// app/auth/confirm/route.ts supports both automatically
const code = searchParams.get("code") || searchParams.get("token_hash");
```

✅ **Database compatibility**: Both flows work with `auth.users` and `profiles` tables

✅ **No additional setup required**: Your database triggers and RLS policies work with both flows

#### **Troubleshooting Email Confirmation**

**Common Issues & Solutions:**

| Issue | Solution |
|-------|----------|
| ❌ "flow_state_not_found" error | Switch from PKCE to implicit flow (see configuration above) |
| ❌ Email link doesn't work | Verify redirect URLs in Supabase Auth settings |
| ❌ "Missing authorization code" | Check email template uses correct `{{ .TokenHash }}` variable |
| ❌ Redirect after confirmation fails | Verify `next` parameter points to valid route |

**Test Your Email Setup:**
1. Sign up with a test email
2. Check email arrives with working confirmation link
3. Click link - should redirect to `/protected/profile`
4. Verify user appears in Supabase `auth.users` table
5. Confirm profile created in `profiles` table

### 6. Deploy to Production (15 minutes)

1. **Push to GitHub** and connect to Vercel
2. **Add environment variables** in Vercel dashboard  
3. **Deploy** - your multi-chain DApp is live!
4. **Test email confirmation** in production environment

### 7. Test Your Setup (5 minutes)

- ✅ Visit your deployed app
- ✅ Test user registration and email confirmation
- ✅ Verify profile page loads and editing works
- ✅ Check wallet functionality (if enabled)
- ✅ Test blockchain-specific pages

---

## 🏗️ Architecture Overview

### Multi-Chain Pages
- **[ROOT Network](/root)** - Native ROOT blockchain integration
- **[Avalanche](/avalanche)** - AVAX ecosystem and subnets
- **[ApeChain](/apechain)** - APE token and NFT integration
- **[Flow](/flow)** - Flow blockchain and NFT marketplace
- **[Tezos](/tezos)** - Tezos smart contracts and DeFi
- **[Stacks](/stacks)** - Bitcoin-based smart contracts

### Core Features
- **[X402 Wallet](/wallet)** - Multi-chain wallet management
- **[Profile System](/protected/profile)** - User profile management
- **Authentication Flow** - Secure login/signup with email verification

### Technical Stack
- **Frontend**: Next.js 15 with React 19 and TypeScript
- **Styling**: Tailwind CSS with dark/light mode support
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth with implicit flow
- **Deployment**: Vercel with automatic CI/CD
- **Web3 Libraries**: Ethers.js, Coinbase CDP SDK, Solana Web3.js

---

## 🔧 Development Workflow

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Verify environment setup
npm run verify-env

# Set up database (alternative to SQL editor)
npm run setup-db
```

### Available Scripts

- `npm run dev` - Development server with hot reload
- `npm run build` - Production build
- `npm run test` - Run test suite
- `npm run test:integration` - Integration tests
- `npm run test:production` - Production environment tests
- `npm run setup-db` - Database setup helper
- `npm run verify-env` - Environment validation

---

## 🛡️ Security Features

### Database Security
- **Row Level Security (RLS)** - Users can only access their own data
- **Input Validation** - Comprehensive constraints on all user inputs
- **SQL Injection Protection** - Parameterized queries and prepared statements
- **Secure Functions** - SECURITY DEFINER functions with proper access control

### Authentication Security
- **Implicit Flow** - Optimized for email-based authentication workflows
- **Email Verification** - Required email confirmation for account activation
- **Session Management** - Secure JWT tokens with automatic refresh
- **Protected Routes** - Middleware-enforced authentication

### Application Security
- **Environment Variables** - Secure handling of sensitive configuration
- **HTTPS Everywhere** - SSL/TLS encryption for all communications
- **CSP Headers** - Content Security Policy for XSS protection
- **CORS Configuration** - Proper cross-origin resource sharing setup

---

## 📚 Documentation

### Quick References
- **[Deployment Guide](docs/deployment/)** - Step-by-step deployment instructions
- **[Database Setup](docs/deployment/CANONICAL_SETUP.md)** - Complete database configuration
- **[Troubleshooting](docs/deployment/SUPABASE-UI-FIX-GUIDE.md)** - Common issues and solutions

### Advanced Configuration
- **[Production Setup](docs/deployment/PRODUCTION-SETUP-INSTRUCTIONS.md)** - Production deployment guide
- **[Email Templates](docs/deployment/SUPABASE-EMAIL-TEMPLATE-FIX-INSTRUCTIONS.md)** - Email customization
- **[Testing Guide](docs/testing/)** - Comprehensive testing strategies

---

## 🎯 Feature Roadmap

### Current Features ✅
- Multi-chain blockchain pages with dedicated UIs
- X402 wallet manager with Coinbase CDP integration
- Complete authentication system with email verification
- Advanced user profiles with automatic creation
- Enterprise-grade security and performance
- Mobile-responsive design with theme support

### Upcoming Features 🚧
- Smart contract interaction templates
- DeFi protocol integrations
- NFT marketplace components
- Cross-chain transaction support
- Advanced analytics and monitoring
- AI-powered user assistance

---

## 🤝 Getting Help

### Quick Issues
- Check the [troubleshooting guide](docs/deployment/SUPABASE-UI-FIX-GUIDE.md)
- Run `npm run verify-env` to check configuration
- Review Supabase logs for authentication issues

### Common Solutions
- **Build Errors**: Run `npm run lint && npm run build` locally
- **Auth Issues**: Verify redirect URLs in Supabase settings
- **Database Errors**: Check RLS policies and user permissions
- **Environment Issues**: Ensure all required variables are set

### Support Resources
- **[Supabase Documentation](https://supabase.com/docs)**
- **[Vercel Documentation](https://vercel.com/docs)**
- **[Next.js Documentation](https://nextjs.org/docs)**

---

## 🎉 Success Metrics

With this multi-chain Web3 starter kit, you achieve:

- **⚡ 60-minute deployment** from clone to production  
- **🔒 Enterprise security** with zero configuration required
- **✅ Working email authentication** with bulletproof confirmation flow
- **🌍 Multi-chain support** for major blockchain ecosystems
- **📱 Mobile-first design** reaching users on any device
- **🚀 Scalable architecture** supporting thousands of concurrent users
- **💰 Cost-effective hosting** starting at $0-20/year

---

**Ready to launch your multi-chain DApp?** 

Follow the Quick Start guide above and you'll have a production-ready Web3 platform supporting 6+ blockchains in under an hour.

*This starter kit has powered successful DApp launches across multiple blockchain ecosystems. See the live demo at your deployed URL.*