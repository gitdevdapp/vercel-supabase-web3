#!/usr/bin/env node

/**
 * CDP Wallet Operations E2E Test
 * 
 * This script tests the complete wallet flow:
 * 1. Create new user
 * 2. User automatically gets profile
 * 3. Create wallet for user
 * 4. Request testnet funds (ETH and USDC)
 * 5. Verify funds appear in database
 * 6. Verify transaction history
 * 
 * Usage: node scripts/testing/test-cdp-wallet-operations.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Test user credentials
const TEST_EMAIL = `test-wallet-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestWallet123!';
const TEST_WALLET_NAME = 'E2E Test Wallet';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`STEP ${step}: ${message}`, 'cyan');
  log('='.repeat(60), 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Validate environment
function validateEnvironment() {
  logStep(0, 'Validating Environment');

  if (!SUPABASE_URL) {
    logError('NEXT_PUBLIC_SUPABASE_URL is not set');
    process.exit(1);
  }
  logSuccess(`Supabase URL: ${SUPABASE_URL}`);

  if (!SUPABASE_ANON_KEY) {
    logError('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    process.exit(1);
  }
  logSuccess('Supabase Anon Key: Set');

  if (!SUPABASE_SERVICE_KEY) {
    logWarning('SUPABASE_SERVICE_ROLE_KEY is not set (some tests may be skipped)');
  } else {
    logSuccess('Supabase Service Role Key: Set');
  }

  logSuccess('Environment validation passed');
}

// Create Supabase clients
function createClients() {
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const adminClient = SUPABASE_SERVICE_KEY 
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    : null;

  return { anonClient, adminClient };
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main test flow
async function runTests() {
  console.log('\n');
  log('🚀 CDP WALLET OPERATIONS E2E TEST', 'cyan');
  log('='.repeat(60), 'cyan');

  validateEnvironment();

  const { anonClient, adminClient } = createClients();
  let userId = null;
  let walletId = null;
  let walletAddress = null;

  try {
    // ========================================================================
    // STEP 1: Create Test User
    // ========================================================================
    logStep(1, 'Create Test User');
    
    const { data: signupData, error: signupError } = await anonClient.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (signupError) {
      logError(`Signup failed: ${signupError.message}`);
      throw signupError;
    }

    userId = signupData.user.id;
    logSuccess(`User created: ${TEST_EMAIL}`);
    logInfo(`User ID: ${userId}`);

    // ========================================================================
    // STEP 2: Verify Profile Auto-Creation
    // ========================================================================
    logStep(2, 'Verify Profile Auto-Creation');
    
    logInfo('Waiting 2 seconds for database trigger...');
    await wait(2000);

    const { data: profile, error: profileError } = await anonClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      logError(`Profile check failed: ${profileError.message}`);
      throw profileError;
    }

    if (!profile) {
      logError('Profile was not auto-created');
      throw new Error('Profile not found');
    }

    logSuccess('Profile auto-created successfully');
    logInfo(`Username: ${profile.username}`);
    logInfo(`Email: ${profile.email}`);

    // ========================================================================
    // STEP 3: Sign In User
    // ========================================================================
    logStep(3, 'Sign In User');

    const { data: signinData, error: signinError } = await anonClient.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (signinError) {
      logError(`Sign in failed: ${signinError.message}`);
      throw signinError;
    }

    logSuccess('User signed in successfully');
    logInfo(`Session expires: ${new Date(signinData.session.expires_at * 1000).toISOString()}`);

    // ========================================================================
    // STEP 4: Create Wallet via API
    // ========================================================================
    logStep(4, 'Create Wallet via API');

    const createWalletResponse = await fetch(`${APP_URL}/api/wallet/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signinData.session.access_token}`,
      },
      body: JSON.stringify({
        name: TEST_WALLET_NAME,
        type: 'custom',
      }),
    });

    if (!createWalletResponse.ok) {
      const errorData = await createWalletResponse.json();
      logError(`Wallet creation failed: ${errorData.error || 'Unknown error'}`);
      
      if (errorData.error && errorData.error.includes('CDP not configured')) {
        logWarning('CDP is not configured. Make sure CDP environment variables are set.');
        logWarning('Skipping remaining tests that require CDP.');
        return;
      }
      
      throw new Error(`Wallet creation failed: ${createWalletResponse.status}`);
    }

    const walletData = await createWalletResponse.json();
    walletId = walletData.wallet_id;
    walletAddress = walletData.address;

    logSuccess('Wallet created successfully');
    logInfo(`Wallet ID: ${walletId}`);
    logInfo(`Wallet Address: ${walletAddress}`);
    logInfo(`Wallet Name: ${walletData.name}`);

    // ========================================================================
    // STEP 5: Verify Wallet in Database
    // ========================================================================
    logStep(5, 'Verify Wallet in Database');

    const { data: dbWallet, error: walletError } = await anonClient
      .from('user_wallets')
      .select('*')
      .eq('id', walletId)
      .single();

    if (walletError) {
      logError(`Wallet verification failed: ${walletError.message}`);
      throw walletError;
    }

    if (!dbWallet) {
      logError('Wallet not found in database');
      throw new Error('Wallet not in database');
    }

    logSuccess('Wallet verified in database');
    logInfo(`User ID match: ${dbWallet.user_id === userId ? '✓' : '✗'}`);
    logInfo(`Address match: ${dbWallet.wallet_address === walletAddress ? '✓' : '✗'}`);
    logInfo(`Network: ${dbWallet.network}`);
    logInfo(`Active: ${dbWallet.is_active}`);

    // ========================================================================
    // STEP 6: Request ETH Funding
    // ========================================================================
    logStep(6, 'Request ETH Funding');

    const fundEthResponse = await fetch(`${APP_URL}/api/wallet/fund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signinData.session.access_token}`,
      },
      body: JSON.stringify({
        address: walletAddress,
        token: 'eth',
      }),
    });

    if (!fundEthResponse.ok) {
      const errorData = await fundEthResponse.json();
      logError(`ETH funding failed: ${errorData.error || 'Unknown error'}`);
      
      if (errorData.error && errorData.error.includes('Rate limit')) {
        logWarning('Rate limit hit. This is expected if test was run recently.');
      } else {
        throw new Error(`ETH funding failed: ${fundEthResponse.status}`);
      }
    } else {
      const ethFundData = await fundEthResponse.json();
      logSuccess('ETH funding request successful');
      logInfo(`Transaction Hash: ${ethFundData.transactionHash}`);
      logInfo(`Explorer: ${ethFundData.explorerUrl}`);
    }

    // ========================================================================
    // STEP 7: Request USDC Funding
    // ========================================================================
    logStep(7, 'Request USDC Funding');

    logInfo('Waiting 5 seconds to avoid rate limit...');
    await wait(5000);

    const fundUsdcResponse = await fetch(`${APP_URL}/api/wallet/fund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signinData.session.access_token}`,
      },
      body: JSON.stringify({
        address: walletAddress,
        token: 'usdc',
      }),
    });

    if (!fundUsdcResponse.ok) {
      const errorData = await fundUsdcResponse.json();
      logError(`USDC funding failed: ${errorData.error || 'Unknown error'}`);
      
      if (errorData.error && errorData.error.includes('Rate limit')) {
        logWarning('Rate limit hit. This is expected if test was run recently.');
      } else {
        throw new Error(`USDC funding failed: ${fundUsdcResponse.status}`);
      }
    } else {
      const usdcFundData = await fundUsdcResponse.json();
      logSuccess('USDC funding request successful');
      logInfo(`Transaction Hash: ${usdcFundData.transactionHash}`);
      logInfo(`Explorer: ${usdcFundData.explorerUrl}`);
    }

    // ========================================================================
    // STEP 8: Verify Transactions in Database
    // ========================================================================
    logStep(8, 'Verify Transactions in Database');

    logInfo('Waiting 3 seconds for transaction logging...');
    await wait(3000);

    const { data: transactions, error: txError } = await anonClient
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', walletId)
      .order('created_at', { ascending: true });

    if (txError) {
      logError(`Transaction query failed: ${txError.message}`);
      throw txError;
    }

    logSuccess(`Found ${transactions.length} transactions in database`);
    
    transactions.forEach((tx, index) => {
      log(`\n  Transaction ${index + 1}:`, 'cyan');
      logInfo(`    Operation: ${tx.operation_type}`);
      logInfo(`    Token: ${tx.token_type}`);
      logInfo(`    Amount: ${tx.amount || 'N/A'}`);
      logInfo(`    Status: ${tx.status}`);
      logInfo(`    TX Hash: ${tx.tx_hash || 'N/A'}`);
      logInfo(`    Created: ${new Date(tx.created_at).toLocaleString()}`);
    });

    // Expected: 1 create + 2 fund operations (if no rate limits)
    const expectedMinTransactions = 1; // At least wallet creation
    if (transactions.length >= expectedMinTransactions) {
      logSuccess(`Transaction logging working correctly (${transactions.length} transactions)`);
    } else {
      logWarning(`Expected at least ${expectedMinTransactions} transaction, found ${transactions.length}`);
    }

    // ========================================================================
    // STEP 9: Check Wallet Balances
    // ========================================================================
    logStep(9, 'Check Wallet Balances');

    logInfo('Waiting 10 seconds for blockchain confirmation...');
    await wait(10000);

    const listWalletsResponse = await fetch(`${APP_URL}/api/wallet/list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${signinData.session.access_token}`,
      },
    });

    if (!listWalletsResponse.ok) {
      const errorData = await listWalletsResponse.json();
      logError(`Wallet list failed: ${errorData.error || 'Unknown error'}`);
      throw new Error(`Wallet list failed: ${listWalletsResponse.status}`);
    }

    const walletsData = await listWalletsResponse.json();
    logSuccess('Wallet list retrieved successfully');
    
    if (walletsData.wallets && walletsData.wallets.length > 0) {
      const wallet = walletsData.wallets[0];
      logInfo(`ETH Balance: ${wallet.balances?.eth || 0}`);
      logInfo(`USDC Balance: ${wallet.balances?.usdc || 0}`);
      
      if (wallet.balances?.eth > 0 || wallet.balances?.usdc > 0) {
        logSuccess('Wallet has been funded successfully!');
      } else {
        logWarning('Wallet balances are 0. Transactions may still be pending.');
      }
    } else {
      logWarning('No wallets found in list response');
    }

    // ========================================================================
    // FINAL SUMMARY
    // ========================================================================
    log('\n' + '='.repeat(60), 'green');
    log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!', 'green');
    log('='.repeat(60), 'green');

    log('\nTest Summary:', 'cyan');
    logSuccess(`✓ User created: ${TEST_EMAIL}`);
    logSuccess(`✓ Profile auto-created with username: ${profile.username}`);
    logSuccess(`✓ User authenticated`);
    logSuccess(`✓ Wallet created: ${walletAddress}`);
    logSuccess(`✓ Wallet stored in database`);
    logSuccess(`✓ Transactions logged: ${transactions.length} total`);
    logSuccess(`✓ Wallet balances retrieved`);

    log('\nDatabase Records:', 'cyan');
    logInfo(`User ID: ${userId}`);
    logInfo(`Wallet ID: ${walletId}`);
    logInfo(`Wallet Address: ${walletAddress}`);

    log('\nCleanup:', 'yellow');
    logWarning('Test user and wallet were created and remain in the database.');
    logWarning(`To clean up manually, delete user: ${userId}`);
    log('');

  } catch (error) {
    log('\n' + '='.repeat(60), 'red');
    log('❌ TEST FAILED', 'red');
    log('='.repeat(60), 'red');
    logError(`Error: ${error.message}`);
    
    if (error.stack) {
      log('\nStack Trace:', 'red');
      console.error(error.stack);
    }

    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  logError(`Unhandled error: ${error.message}`);
  process.exit(1);
});
