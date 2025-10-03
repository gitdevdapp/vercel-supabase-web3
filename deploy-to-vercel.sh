#!/bin/bash

# Deploy CDP Wallets to Production Vercel
# This script sets environment variables and deploys

set -e  # Exit on error

echo "🚀 Deploying CDP Wallets to Production Vercel"
echo "=============================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install it with:"
    echo "   npm i -g vercel"
    exit 1
fi

echo "📋 Step 1: Setting environment variables in Vercel..."
echo ""

# Function to set env var
set_env_var() {
    local key=$1
    local value=$2
    local env_type=${3:-production}
    
    echo "Setting $key for $env_type..."
    echo "$value" | vercel env add "$key" "$env_type" --yes 2>/dev/null || \
    echo "$value" | vercel env rm "$key" "$env_type" --yes 2>/dev/null && \
    echo "$value" | vercel env add "$key" "$env_type" --yes 2>/dev/null || \
    echo "  ⚠️  $key might already be set (that's OK)"
}

# Supabase Production ([REDACTED-PROJECT-ID])
echo ""
echo "📦 Supabase Configuration..."
set_env_var "NEXT_PUBLIC_SUPABASE_URL" "https://[REDACTED-PROJECT-ID].supabase.co"
set_env_var "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY" "[REDACTED-SUPABASE-ANON-KEY]"
set_env_var "SUPABASE_SERVICE_ROLE_KEY" "[REDACTED-SUPABASE-SERVICE-KEY]"

# CDP Credentials (TESTED AND WORKING ✅)
echo ""
echo "🔐 CDP Configuration..."
set_env_var "CDP_API_KEY_ID" "[REDACTED-CDP-API-KEY-ID]"
set_env_var "CDP_API_KEY_SECRET" "[REDACTED-CDP-API-SECRET]"
set_env_var "CDP_WALLET_SECRET" "[REDACTED-CDP-WALLET-SECRET]"

# Network & Feature Flags
echo ""
echo "⚙️  Configuration..."
set_env_var "NETWORK" "base-sepolia"
set_env_var "NEXT_PUBLIC_WALLET_NETWORK" "base-sepolia"
set_env_var "NEXT_PUBLIC_ENABLE_CDP_WALLETS" "true"

echo ""
echo "✅ Environment variables configured!"
echo ""
echo "=============================================="
echo "📦 Step 2: Deploying to Production..."
echo "=============================================="
echo ""

# Deploy to production
vercel --prod

echo ""
echo "=============================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=============================================="
echo ""
echo "🧪 Test your deployment:"
echo ""
echo "1. Check environment variables loaded:"
echo "   https://your-domain.vercel.app/api/debug/check-cdp-env"
echo ""
echo "2. Test wallet creation:"
echo "   https://your-domain.vercel.app/protected/profile"
echo ""
echo "3. Run production test script:"
echo "   node scripts/testing/test-production-wallet-creation.js"
echo ""
echo "📊 View deployment logs:"
echo "   vercel logs --follow"
echo ""

