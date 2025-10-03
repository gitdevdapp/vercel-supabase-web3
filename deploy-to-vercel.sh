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

# Supabase Production (mjrnzgunexmopvnamggw)
echo ""
echo "📦 Supabase Configuration..."
set_env_var "NEXT_PUBLIC_SUPABASE_URL" "https://mjrnzgunexmopvnamggw.supabase.co"
set_env_var "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcm56Z3VuZXhtb3B2bmFtZ2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODg4MjcsImV4cCI6MjA3MzI2NDgyN30.7Hwn5kaExgI7HJKc7HmaTqJSybcGwX1izB1EdkNbcu8"
set_env_var "SUPABASE_SERVICE_ROLE_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcm56Z3VuZXhtb3B2bmFtZ2d3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY4ODgyNywiZXhwIjoyMDczMjY0ODI3fQ.jYseGYwWnhXwEf_Yqs3O8AdTTNWVBMH94LE2qVi1DrA"

# CDP Credentials (TESTED AND WORKING ✅)
echo ""
echo "🔐 CDP Configuration..."
set_env_var "CDP_API_KEY_ID" "69aac710-e242-4844-aa2b-d4056e61606b"
set_env_var "CDP_API_KEY_SECRET" "HH0FhrZ5CdAoFpWRLdZQPR9kqsUYTbp4hVcqhb6FZErZ973X4ldxKxKJ4wN2hAM8jXxNmARty44+DMnMdFQQqA=="
set_env_var "CDP_WALLET_SECRET" "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgXVAKZtzzIhOF3PobWNswbBPROzWKBfmj7jCglV2I58ehRANCAASYGh3+MAdVpgIRt+ZzT1b75mpkwHg+dHmPa3j8oC45uT+eSqgHgXL5rhkSUykpAQkRzdXQsms7pc98D7msqS2y"

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

