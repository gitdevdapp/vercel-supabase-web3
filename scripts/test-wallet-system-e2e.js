#!/usr/bin/env node

/**
 * END-TO-END WALLET SYSTEM TEST
 * 
 * This script tests the complete wallet system functionality:
 * 1. User signup with email confirmation
 * 2. Wallet creation
 * 3. Testnet funding (ETH & USDC)
 * 4. USDC transfers between wallets
 * 5. Database verification
 * 
 * Usage:
 *   node scripts/test-wallet-system-e2e.js <production-url>
 * 
 * Example:
 *   node scripts/test-wallet-system-e2e.js https://mjr.vercel.app
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if it exists
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      if (value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✓' : '✗');
  process.exit(1);
}

const PRODUCTION_URL = process.argv[2] || 'http://localhost:3000';

console.log('\n🧪 WALLET SYSTEM END-TO-END TEST\n');
console.log('═'.repeat(60));
console.log(`Production URL: ${PRODUCTION_URL}`);
console.log(`Supabase URL: ${SUPABASE_URL}`);
console.log(`Auto-confirm users: ${SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗'}`);
console.log('═'.repeat(60));

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null;

// Test user credentials
// Using mailinator.com for test emails (publicly accessible inbox)
const TEST_USER_1 = {
  email: `wallet-test-user-1-${Date.now()}@mailinator.com`,
  password: 'TestPassword123!@#'
};

const TEST_USER_2 = {
  email: `wallet-test-user-2-${Date.now()}@mailinator.com`,
  password: 'TestPassword123!@#'
};

let user1Session = null;
let user2Session = null;
let user1Wallet = null;
let user2Wallet = null;

// Utility function to make authenticated API calls
async function apiCall(endpoint, options = {}, session = user1Session) {
  const url = `${PRODUCTION_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(session ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json();
  return { response, data };
}

// Test 1: User Signup
async function testUserSignup(userCredentials, userLabel) {
  console.log(`\n📝 TEST 1: User Signup (${userLabel})`);
  console.log('─'.repeat(60));

  try {
    const { data, error } = await supabase.auth.signUp({
      email: userCredentials.email,
      password: userCredentials.password,
      options: {
        emailRedirectTo: `${PRODUCTION_URL}/auth/callback`
      }
    });

    if (error) throw error;

    console.log(`✅ User created: ${userCredentials.email}`);
    console.log(`   User ID: ${data.user?.id}`);
    console.log(`   Email confirmed: ${data.user?.email_confirmed_at ? 'Yes' : 'No'}`);
    
    if (data.session) {
      console.log(`   Session: ✓`);
      return data.session;
    } else {
      // Auto-confirm user if service role key is available
      if (supabaseAdmin && data.user) {
        console.log(`   Auto-confirming user...`);
        const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
          data.user.id,
          { email_confirm: true }
        );
        
        if (confirmError) {
          console.error(`   ❌ Auto-confirm failed: ${confirmError.message}`);
          return null;
        }
        
        // Now login with the confirmed user
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: userCredentials.email,
          password: userCredentials.password
        });
        
        if (loginError || !loginData.session) {
          console.error(`   ❌ Login after confirmation failed: ${loginError?.message}`);
          return null;
        }
        
        console.log(`   ✅ User confirmed and logged in`);
        console.log(`   Session: ✓`);
        return loginData.session;
      } else {
        console.log(`   ⚠️  No session returned - email confirmation required`);
        console.log(`   Please check email and confirm, or use admin to confirm user`);
        return null;
      }
    }
  } catch (error) {
    console.error(`❌ Signup failed: ${error.message}`);
    return null;
  }
}

// Test 2: Manual Login (for confirmed users)
async function testUserLogin(userCredentials, userLabel) {
  console.log(`\n🔐 TEST 2: User Login (${userLabel})`);
  console.log('─'.repeat(60));

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userCredentials.email,
      password: userCredentials.password
    });

    if (error) throw error;

    console.log(`✅ Login successful: ${userCredentials.email}`);
    console.log(`   User ID: ${data.user?.id}`);
    console.log(`   Session: ✓`);
    
    return data.session;
  } catch (error) {
    console.error(`❌ Login failed: ${error.message}`);
    return null;
  }
}

// Test 3: Wallet Creation
async function testWalletCreation(session, userLabel) {
  console.log(`\n💼 TEST 3: Wallet Creation (${userLabel})`);
  console.log('─'.repeat(60));

  try {
    const { response, data } = await apiCall('/api/wallet/create', {
      method: 'POST',
      body: JSON.stringify({
        name: `${userLabel} Test Wallet`,
        type: 'custom'
      })
    }, session);

    if (!response.ok) {
      throw new Error(data.error || 'Wallet creation failed');
    }

    console.log(`✅ Wallet created successfully`);
    console.log(`   Address: ${data.address}`);
    console.log(`   Name: ${data.name}`);
    console.log(`   Wallet ID: ${data.wallet_id}`);
    
    return {
      address: data.address,
      name: data.name,
      wallet_id: data.wallet_id
    };
  } catch (error) {
    console.error(`❌ Wallet creation failed: ${error.message}`);
    return null;
  }
}

// Test 4: Wallet Balance Check
async function testWalletBalance(wallet, session, userLabel) {
  console.log(`\n💰 TEST 4: Wallet Balance (${userLabel})`);
  console.log('─'.repeat(60));

  try {
    const { response, data } = await apiCall(
      `/api/wallet/balance?address=${wallet.address}`, 
      {}, 
      session
    );

    if (!response.ok) {
      throw new Error(data.error || 'Balance check failed');
    }

    console.log(`✅ Balance retrieved successfully`);
    console.log(`   ETH: ${data.eth.toFixed(6)} ETH`);
    console.log(`   USDC: ${data.usdc.toFixed(2)} USDC`);
    console.log(`   Network: ${data.debug?.network || 'unknown'}`);
    
    return data;
  } catch (error) {
    console.error(`❌ Balance check failed: ${error.message}`);
    return null;
  }
}

// Test 5: Request Testnet Funds (ETH)
async function testFundWalletETH(wallet, session, userLabel) {
  console.log(`\n💎 TEST 5: Fund Wallet with ETH (${userLabel})`);
  console.log('─'.repeat(60));

  try {
    console.log('   Requesting ETH from faucet...');
    
    const { response, data } = await apiCall('/api/wallet/fund', {
      method: 'POST',
      body: JSON.stringify({
        address: wallet.address,
        token: 'eth'
      })
    }, session);

    if (!response.ok) {
      throw new Error(data.error || 'ETH funding failed');
    }

    console.log(`✅ ETH funding successful`);
    console.log(`   TX Hash: ${data.transactionHash}`);
    console.log(`   Status: ${data.status}`);
    console.log(`   Explorer: ${data.explorerUrl}`);
    
    // Wait a bit for balance to update
    console.log('   Waiting 3s for balance update...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return data;
  } catch (error) {
    console.error(`❌ ETH funding failed: ${error.message}`);
    return null;
  }
}

// Test 6: Request Testnet Funds (USDC)
async function testFundWalletUSDC(wallet, session, userLabel) {
  console.log(`\n💵 TEST 6: Fund Wallet with USDC (${userLabel})`);
  console.log('─'.repeat(60));

  try {
    console.log('   Requesting USDC from faucet...');
    
    const { response, data } = await apiCall('/api/wallet/fund', {
      method: 'POST',
      body: JSON.stringify({
        address: wallet.address,
        token: 'usdc'
      })
    }, session);

    if (!response.ok) {
      throw new Error(data.error || 'USDC funding failed');
    }

    console.log(`✅ USDC funding successful`);
    console.log(`   TX Hash: ${data.transactionHash}`);
    console.log(`   Status: ${data.status}`);
    console.log(`   Explorer: ${data.explorerUrl}`);
    
    // Wait a bit for balance to update
    console.log('   Waiting 3s for balance update...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return data;
  } catch (error) {
    console.error(`❌ USDC funding failed: ${error.message}`);
    return null;
  }
}

// Test 7: Transfer USDC
async function testUSDCTransfer(fromWallet, toWallet, amount, session) {
  console.log(`\n💸 TEST 7: USDC Transfer`);
  console.log('─'.repeat(60));

  try {
    console.log(`   Sending ${amount} USDC...`);
    console.log(`   From: ${fromWallet.address}`);
    console.log(`   To: ${toWallet.address}`);
    
    const { response, data } = await apiCall('/api/wallet/transfer', {
      method: 'POST',
      body: JSON.stringify({
        fromAddress: fromWallet.address,
        toAddress: toWallet.address,
        amount: amount,
        token: 'usdc'
      })
    }, session);

    if (!response.ok) {
      throw new Error(data.error || 'USDC transfer failed');
    }

    console.log(`✅ USDC transfer successful`);
    console.log(`   TX Hash: ${data.transactionHash}`);
    console.log(`   Status: ${data.status}`);
    console.log(`   Amount: ${data.amount} ${data.token}`);
    console.log(`   Explorer: ${data.explorerUrl}`);
    
    return data;
  } catch (error) {
    console.error(`❌ USDC transfer failed: ${error.message}`);
    return null;
  }
}

// Test 8: Database Verification
async function testDatabaseVerification(userId, walletId) {
  console.log(`\n🗄️  TEST 8: Database Verification`);
  console.log('─'.repeat(60));

  try {
    // Check wallet exists
    const { data: wallets, error: walletError } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', userId);

    if (walletError) throw walletError;

    console.log(`✅ User wallets in database: ${wallets.length}`);
    wallets.forEach((w, i) => {
      console.log(`   ${i + 1}. ${w.wallet_name} (${w.wallet_address})`);
    });

    // Check transactions
    const { data: transactions, error: txError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (txError) throw txError;

    console.log(`\n✅ Transaction history: ${transactions.length} records`);
    transactions.slice(0, 5).forEach((tx, i) => {
      console.log(`   ${i + 1}. ${tx.operation_type.toUpperCase()} - ${tx.token_type.toUpperCase()} - ${tx.status}`);
      if (tx.tx_hash) {
        console.log(`      TX: ${tx.tx_hash.substring(0, 20)}...`);
      }
    });

    return { wallets, transactions };
  } catch (error) {
    console.error(`❌ Database verification failed: ${error.message}`);
    return null;
  }
}

// Main test execution
async function runTests() {
  try {
    console.log('\n🚀 Starting comprehensive wallet system tests...\n');

    // USER 1: Complete flow
    console.log('\n' + '═'.repeat(60));
    console.log('USER 1: COMPLETE WALLET FLOW');
    console.log('═'.repeat(60));

    user1Session = await testUserSignup(TEST_USER_1, 'User 1');
    
    if (!user1Session) {
      console.log('\n⚠️  User 1 requires email confirmation. Attempting login...');
      // In production, user would need to confirm email first
      // For testing with admin panel, you can manually confirm and then login
      console.log('\n📧 MANUAL STEP REQUIRED:');
      console.log('   1. Go to Supabase Dashboard > Authentication > Users');
      console.log(`   2. Find user: ${TEST_USER_1.email}`);
      console.log('   3. Click "..." > Confirm email');
      console.log('   4. Re-run this script\n');
      return;
    }

    user1Wallet = await testWalletCreation(user1Session, 'User 1');
    if (!user1Wallet) return;

    await testWalletBalance(user1Wallet, user1Session, 'User 1');
    
    await testFundWalletETH(user1Wallet, user1Session, 'User 1');
    await testWalletBalance(user1Wallet, user1Session, 'User 1');
    
    await testFundWalletUSDC(user1Wallet, user1Session, 'User 1');
    await testWalletBalance(user1Wallet, user1Session, 'User 1');

    // USER 2: For transfer testing
    console.log('\n' + '═'.repeat(60));
    console.log('USER 2: CREATE RECIPIENT WALLET');
    console.log('═'.repeat(60));

    user2Session = await testUserSignup(TEST_USER_2, 'User 2');
    
    if (!user2Session) {
      console.log('\n⚠️  User 2 requires email confirmation.');
      console.log('   Continuing with User 1 tests only...\n');
    } else {
      user2Wallet = await testWalletCreation(user2Session, 'User 2');
      
      if (user2Wallet) {
        await testWalletBalance(user2Wallet, user2Session, 'User 2');
        
        // Test transfer from User 1 to User 2
        console.log('\n' + '═'.repeat(60));
        console.log('TRANSFER TEST: USER 1 → USER 2');
        console.log('═'.repeat(60));
        
        await testUSDCTransfer(user1Wallet, user2Wallet, 0.5, user1Session);
        
        // Check balances after transfer
        await new Promise(resolve => setTimeout(resolve, 3000));
        await testWalletBalance(user1Wallet, user1Session, 'User 1 (After Transfer)');
        await testWalletBalance(user2Wallet, user2Session, 'User 2 (After Transfer)');
      }
    }

    // Database verification
    const user1Id = (await supabase.auth.getUser()).data.user?.id;
    if (user1Id) {
      await testDatabaseVerification(user1Id, user1Wallet.wallet_id);
    }

    // Final summary
    console.log('\n' + '═'.repeat(60));
    console.log('✅ TEST SUITE COMPLETED');
    console.log('═'.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   • User 1: ${TEST_USER_1.email}`);
    console.log(`   • User 1 Wallet: ${user1Wallet.address}`);
    if (user2Wallet) {
      console.log(`   • User 2: ${TEST_USER_2.email}`);
      console.log(`   • User 2 Wallet: ${user2Wallet.address}`);
    }
    console.log('\n🎉 All tests completed! Check results above.\n');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);

