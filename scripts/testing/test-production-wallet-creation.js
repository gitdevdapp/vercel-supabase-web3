#!/usr/bin/env node

/**
 * Test wallet creation in production after fix deployment
 * This script will:
 * 1. Create a test account with mailinator
 * 2. Confirm email
 * 3. Create a wallet
 * 4. Verify the fix worked
 */

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const PRODUCTION_URL = 'https://vercel-supabase-web3.vercel.app';
const SUPABASE_URL = 'https://[REDACTED-PROJECT-ID].supabase.co';
const SUPABASE_ANON_KEY = '[REDACTED-SUPABASE-ANON-KEY]';

function generateTestEmail() {
  const timestamp = Date.now();
  return `wallet-test-${timestamp}@mailinator.com`;
}

async function testProductionWalletCreation() {
  console.log('🧪 Production Wallet Creation Test\n');
  console.log('=' .repeat(60));
  
  const testEmail = generateTestEmail();
  const testPassword = 'TestPassword123!';
  
  console.log(`\n📧 Test Email: ${testEmail}`);
  console.log(`🔒 Test Password: ${testPassword}`);
  console.log(`🌐 Production URL: ${PRODUCTION_URL}\n`);
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // Step 1: Sign up
    console.log('1️⃣  Creating test account...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signUpError) {
      console.error('❌ Sign up failed:', signUpError.message);
      return false;
    }
    
    console.log('✅ Account created');
    console.log(`   User ID: ${signUpData.user?.id}`);
    
    // Step 2: Get confirmation link from email
    console.log('\n2️⃣  Email confirmation required');
    console.log(`   📬 Check: https://www.mailinator.com/v4/public/inboxes.jsp?to=${testEmail.split('@')[0]}`);
    console.log('   ⚠️  You must manually click the confirmation link in the email');
    console.log('   ⏸️  Script pausing for 30 seconds...');
    
    // Wait for manual confirmation
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Step 3: Sign in
    console.log('\n3️⃣  Signing in after confirmation...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message);
      console.error('   Make sure you clicked the confirmation link!');
      return false;
    }
    
    console.log('✅ Signed in successfully');
    const session = signInData.session;
    
    // Step 4: Test wallet creation via API
    console.log('\n4️⃣  Creating wallet via production API...');
    console.log(`   Endpoint: ${PRODUCTION_URL}/api/wallet/create`);
    
    const walletResponse = await fetch(`${PRODUCTION_URL}/api/wallet/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        name: 'Production Test Wallet',
        type: 'custom'
      })
    });
    
    const walletData = await walletResponse.json();
    
    console.log(`   Status: ${walletResponse.status}`);
    
    if (walletResponse.status !== 201) {
      console.error('❌ Wallet creation failed!');
      console.error('   Response:', JSON.stringify(walletData, null, 2));
      
      if (walletData.error?.includes('authentication error') || walletData.error?.includes('401')) {
        console.error('\n🚨 THE FIX DID NOT WORK! Still getting 401 errors!');
      }
      
      return false;
    }
    
    console.log('✅ Wallet created successfully!');
    console.log('\n📋 Wallet Details:');
    console.log(`   Address: ${walletData.address}`);
    console.log(`   Name: ${walletData.name}`);
    console.log(`   Wallet ID: ${walletData.wallet_id}`);
    console.log(`   Type: ${walletData.type}`);
    
    // Step 5: Verify in database
    console.log('\n5️⃣  Verifying wallet in database...');
    const { data: dbWallet, error: dbError } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('id', walletData.wallet_id)
      .single();
    
    if (dbError) {
      console.error('❌ Database verification failed:', dbError.message);
      return false;
    }
    
    console.log('✅ Wallet found in database');
    console.log(`   Wallet Address: ${dbWallet.wallet_address}`);
    console.log(`   Network: ${dbWallet.network}`);
    console.log(`   Created: ${dbWallet.created_at}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SUCCESS! The fix works in production!');
    console.log('='.repeat(60));
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error(error);
    return false;
  }
}

// Run the test
testProductionWalletCreation()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

