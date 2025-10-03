#!/usr/bin/env node

/**
 * Test wallet creation in production with auto-confirmation
 * Uses service role key to bypass email confirmation
 */

const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const PRODUCTION_URL = 'https://vercel-supabase-web3.vercel.app';
const SUPABASE_URL = 'https://[REDACTED-PROJECT-ID].supabase.co';
const SUPABASE_ANON_KEY = '[REDACTED-SUPABASE-ANON-KEY]';
const SERVICE_ROLE_KEY = '[REDACTED-SUPABASE-SERVICE-KEY]';

function generateTestEmail() {
  const timestamp = Date.now();
  return `walletfix-${timestamp}@mailinator.com`;
}

async function testProductionWalletCreation() {
  console.log('🧪 Production Wallet Creation Test (Auto-Confirm)\n');
  console.log('=' .repeat(60));
  
  const testEmail = generateTestEmail();
  const testPassword = 'TestWallet123!';
  
  console.log(`\n📧 Test Email: ${testEmail}`);
  console.log(`🔒 Test Password: ${testPassword}`);
  console.log(`🌐 Production URL: ${PRODUCTION_URL}\n`);
  
  const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  
  try {
    // Step 1: Sign up with auto-confirm
    console.log('1️⃣  Creating test account (auto-confirmed)...');
    const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // Auto-confirm
    });
    
    if (signUpError) {
      console.error('❌ Sign up failed:', signUpError.message);
      return false;
    }
    
    console.log('✅ Account created and confirmed');
    console.log(`   User ID: ${signUpData.user?.id}`);
    
    // Step 2: Sign in
    console.log('\n2️⃣  Signing in...');
    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message);
      return false;
    }
    
    console.log('✅ Signed in successfully');
    const session = signInData.session;
    
    // Step 3: Test wallet creation via production API
    console.log('\n3️⃣  Creating wallet via production API...');
    console.log(`   POST ${PRODUCTION_URL}/api/wallet/create`);
    
    const walletData = await new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        name: 'Production Test Wallet',
        type: 'custom'
      });
      
      const options = {
        hostname: 'vercel-supabase-web3.vercel.app',
        port: 443,
        path: '/api/wallet/create',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Authorization': `Bearer ${session.access_token}`,
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data: { error: data } });
          }
        });
      });
      
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
    
    const walletResponse = walletData;
    
    console.log(`   Response Status: ${walletResponse.status}`);
    
    const responseData = walletResponse.data;
    
    if (walletResponse.status !== 201) {
      console.error('\n❌ WALLET CREATION FAILED!');
      console.error('   Response:', JSON.stringify(responseData, null, 2));
      
      if (responseData.error?.includes('authentication') || 
          responseData.details?.includes('authentication') ||
          responseData.error?.includes('401')) {
        console.error('\n🚨 THE FIX DID NOT WORK! Still getting authentication errors!');
        console.error('   The CdpClient is still not receiving credentials properly.');
      }
      
      return false;
    }
    
    console.log('✅ Wallet created successfully!');
    console.log('\n📋 Wallet Details:');
    console.log(`   Address: ${responseData.address}`);
    console.log(`   Name: ${responseData.name}`);
    console.log(`   Wallet ID: ${responseData.wallet_id}`);
    console.log(`   Type: ${responseData.type}`);
    
    // Step 4: Verify in database
    console.log('\n4️⃣  Verifying wallet in database...');
    const { data: dbWallet, error: dbError } = await supabaseAnon
      .from('user_wallets')
      .select('*')
      .eq('id', responseData.wallet_id)
      .single();
    
    if (dbError) {
      console.error('❌ Database verification failed:', dbError.message);
      return false;
    }
    
    console.log('✅ Wallet found in database');
    console.log(`   Wallet Address: ${dbWallet.wallet_address}`);
    console.log(`   Network: ${dbWallet.network}`);
    console.log(`   Active: ${dbWallet.is_active}`);
    console.log(`   Created: ${dbWallet.created_at}`);
    
    // Step 5: Test another wallet type
    console.log('\n5️⃣  Testing another wallet type (Purchaser)...');
    const purchaserResult = await new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        name: 'Test Purchaser',
        type: 'purchaser'
      });
      
      const options = {
        hostname: 'vercel-supabase-web3.vercel.app',
        port: 443,
        path: '/api/wallet/create',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Authorization': `Bearer ${session.access_token}`,
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data: { error: data } });
          }
        });
      });
      
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
    
    if (purchaserResult.status !== 201) {
      console.error('⚠️  Purchaser wallet creation failed:', purchaserResult.data.error);
    } else {
      console.log('✅ Purchaser wallet created');
      console.log(`   Address: ${purchaserResult.data.address}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SUCCESS! THE FIX WORKS IN PRODUCTION!');
    console.log('='.repeat(60));
    console.log('\n✅ Confirmed: CDP credentials are being passed correctly');
    console.log('✅ Confirmed: Wallet creation authentication works');
    console.log('✅ Confirmed: Database records are created');
    console.log('\n🔧 The CdpClient fix is deployed and functioning!');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
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

