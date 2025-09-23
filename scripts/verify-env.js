#!/usr/bin/env node

/**
 * Environment Variable Verification Script
 * Verifies that the canonical MJR Supabase project configuration is correctly set
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 CANONICAL MJR SUPABASE ENVIRONMENT VERIFICATION');
console.log('=================================================');
console.log('');

// Expected canonical values
const CANONICAL_SUPABASE_URL = 'https://mjrnzgunexmopvnamggw.supabase.co';
const CANONICAL_PROJECT_ID = 'mjrnzgunexmopvnamggw';

// Get current environment values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let hasErrors = false;

console.log('📋 Environment Variable Status:');
console.log('-------------------------------');

// Check Supabase URL
console.log(`Supabase URL: ${supabaseUrl || '❌ NOT SET'}`);
if (supabaseUrl === CANONICAL_SUPABASE_URL) {
  console.log('✅ Supabase URL is CORRECT (canonical MJR project)');
} else if (supabaseUrl && supabaseUrl.includes('tydttpgytuhwoecbogvd')) {
  console.log('❌ Supabase URL is WRONG (old project ID detected)');
  console.log(`   Expected: ${CANONICAL_SUPABASE_URL}`);
  console.log(`   Found:    ${supabaseUrl}`);
  hasErrors = true;
} else if (!supabaseUrl) {
  console.log('❌ Supabase URL is NOT SET');
  hasErrors = true;
} else {
  console.log('⚠️  Supabase URL is set but unexpected value');
  console.log(`   Expected: ${CANONICAL_SUPABASE_URL}`);
  console.log(`   Found:    ${supabaseUrl}`);
  hasErrors = true;
}

console.log('');

// Check Anon Key
console.log(`Anon Key: ${supabaseKey ? '✅ SET (hidden for security)' : '❌ NOT SET'}`);
if (!supabaseKey) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY is missing');
  hasErrors = true;
}

console.log('');

// Check Service Role Key
console.log(`Service Key: ${serviceKey ? '✅ SET (hidden for security)' : '❌ NOT SET'}`);
if (!serviceKey) {
  console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY is missing (required for admin operations)');
}

console.log('');
console.log('🔧 Additional Configuration:');
console.log('-----------------------------');

// Check other environment variables
const cdpApiKey = process.env.CDP_API_KEY_NAME;
const cdpPrivateKey = process.env.CDP_PRIVATE_KEY;
const walletNetwork = process.env.NEXT_PUBLIC_WALLET_NETWORK;
const enableCdp = process.env.NEXT_PUBLIC_ENABLE_CDP_WALLETS;
const enableAi = process.env.NEXT_PUBLIC_ENABLE_AI_CHAT;

console.log(`CDP API Key: ${cdpApiKey ? '✅ SET' : '⚪ NOT SET (optional)'}`);
console.log(`CDP Private Key: ${cdpPrivateKey ? '✅ SET' : '⚪ NOT SET (optional)'}`);
console.log(`Wallet Network: ${walletNetwork || 'base-sepolia (default)'}`);
console.log(`CDP Wallets Enabled: ${enableCdp || 'false (default)'}`);
console.log(`AI Chat Enabled: ${enableAi || 'false (default)'}`);

console.log('');

// Extract project ID from URL for verification
if (supabaseUrl) {
  const urlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  const projectId = urlMatch ? urlMatch[1] : null;
  
  console.log('🆔 Project ID Analysis:');
  console.log('----------------------');
  console.log(`Extracted Project ID: ${projectId || 'INVALID URL FORMAT'}`);
  
  if (projectId === CANONICAL_PROJECT_ID) {
    console.log('✅ Project ID matches canonical MJR project');
  } else if (projectId === 'tydttpgytuhwoecbogvd') {
    console.log('❌ Project ID is the OLD project (needs migration)');
    hasErrors = true;
  } else if (projectId) {
    console.log('⚠️  Project ID is unexpected value');
    hasErrors = true;
  }
}

console.log('');

// Final status
console.log('📊 VERIFICATION SUMMARY:');
console.log('========================');

if (hasErrors) {
  console.log('❌ VERIFICATION FAILED');
  console.log('');
  console.log('🔧 Required Actions:');
  console.log('1. Update .env.local with correct values:');
  console.log(`   NEXT_PUBLIC_SUPABASE_URL=${CANONICAL_SUPABASE_URL}`);
  console.log('   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=[get from Supabase dashboard]');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=[get from Supabase dashboard]');
  console.log('');
  console.log('2. Get correct keys from: https://supabase.com/dashboard/project/mjrnzgunexmopvnamggw/settings/api');
  console.log('');
  console.log('3. Restart your development server after making changes');
  console.log('');
  process.exit(1);
} else {
  console.log('✅ VERIFICATION PASSED');
  console.log('');
  console.log('🎉 Your environment is correctly configured for the canonical MJR Supabase project!');
  console.log('');
  console.log('🚀 Next steps:');
  console.log('1. Ensure Vercel environment variables match these local settings');
  console.log('2. Test authentication flow end-to-end');
  console.log('3. Verify email verification links work correctly');
  console.log('');
}

// Show environment file location
console.log('📁 Environment file checked: .env.local');
console.log('📋 For migration guide, see: docs/future/canonical-mjr-supabase-migration-guide.md');
console.log('');
