#!/usr/bin/env node

/**
 * Production MVP Proof - USDC Transfer Test
 * 
 * This script proves the wallet MVP works by:
 * 1. Calling production API to send USDC
 * 2. Getting transaction hash
 * 3. Showing BaseScan link for verification
 * 
 * SECURITY: NO credentials in this file - reads from .env
 * 
 * Usage:
 * SUPABASE_AUTH_TOKEN=your-token node scripts/testing/prove-mvp-transfer.js
 */

const PRODUCTION_URL = 'https://vercel-supabase-web3.vercel.app';
const TEST_RECIPIENT = '0x69e95EfB076Da0D2f365eD1f8520AdDa816d647B';

// ANSI colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

function log(color, message) {
  console.log(`${color}${message}${RESET}`);
}

function section(title) {
  console.log('\n' + '═'.repeat(70));
  log(BOLD + BLUE, '  ' + title);
  console.log('═'.repeat(70) + '\n');
}

async function getAuthToken() {
  // Check for auth token in environment
  const token = process.env.SUPABASE_AUTH_TOKEN;
  
  if (!token) {
    log(RED, '❌ ERROR: SUPABASE_AUTH_TOKEN not set');
    console.log('\nTo get your auth token:');
    console.log('1. Login to: ' + PRODUCTION_URL);
    console.log('2. Open DevTools → Application → Cookies');
    console.log('3. Copy the supabase session token');
    console.log('4. Run: SUPABASE_AUTH_TOKEN=your-token node scripts/testing/prove-mvp-transfer.js');
    process.exit(1);
  }
  
  return token;
}

async function makeRequest(endpoint, method = 'GET', body = null, authToken = null) {
  const url = `${PRODUCTION_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  const options = {
    method,
    headers,
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      ok: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message
    };
  }
}

async function listWallets(authToken) {
  section('STEP 1: List Wallets');
  
  const result = await makeRequest('/api/wallet/list', 'GET', null, authToken);
  
  if (!result.ok) {
    log(RED, `❌ Failed to list wallets: ${result.data?.error || result.error}`);
    return null;
  }
  
  if (!result.data.wallets || result.data.wallets.length === 0) {
    log(YELLOW, '⚠️  No wallets found');
    return null;
  }
  
  const wallet = result.data.wallets[0];
  log(GREEN, `✅ Found wallet: ${wallet.name}`);
  console.log(`   Address: ${wallet.address}`);
  console.log(`   USDC Balance: ${wallet.balances?.usdc || 0}`);
  console.log(`   ETH Balance: ${wallet.balances?.eth || 0}`);
  
  return wallet;
}

async function sendUSDC(wallet, authToken, amount = 0.5) {
  section('STEP 2: Send USDC Transfer (CRITICAL TEST)');
  
  log(YELLOW, `Sending ${amount} USDC to test address...`);
  console.log(`   From: ${wallet.address}`);
  console.log(`   To: ${TEST_RECIPIENT}`);
  console.log(`   Amount: ${amount} USDC`);
  
  const result = await makeRequest('/api/wallet/transfer', 'POST', {
    fromAddress: wallet.address,
    toAddress: TEST_RECIPIENT,
    amount: amount,
    token: 'usdc'
  }, authToken);
  
  if (!result.ok) {
    log(RED, `\n❌ TRANSFER FAILED!`);
    log(RED, `   Error: ${result.data?.error || 'Unknown error'}`);
    if (result.data?.details) {
      console.log(`   Details: ${result.data.details}`);
    }
    return null;
  }
  
  log(GREEN, `\n✅ TRANSFER SUCCESSFUL!`);
  console.log(`   Transaction Hash: ${result.data.transactionHash}`);
  console.log(`   Status: ${result.data.status}`);
  console.log(`   Token: ${result.data.token}`);
  
  return result.data;
}

async function verifyOnBaseScan(txHash) {
  section('STEP 3: Verify on BaseScan');
  
  const explorerUrl = `https://sepolia.basescan.org/tx/${txHash}`;
  
  log(BLUE, '🔍 Transaction on BaseScan:');
  log(BOLD, `   ${explorerUrl}`);
  
  console.log('\n   To verify manually:');
  console.log('   1. Open the link above');
  console.log('   2. Check Status: Should be "Success" ✅');
  console.log(`   3. Check To: Should be ${TEST_RECIPIENT}`);
  console.log('   4. Check Token Transfer: Should show USDC');
  
  return explorerUrl;
}

async function checkRecipientBalance() {
  section('STEP 4: Check Recipient Address');
  
  const recipientUrl = `https://sepolia.basescan.org/address/${TEST_RECIPIENT}`;
  
  log(BLUE, '📊 Recipient on BaseScan:');
  log(BOLD, `   ${recipientUrl}`);
  
  console.log('\n   To verify recipient received USDC:');
  console.log('   1. Open the link above');
  console.log('   2. Click "Token" tab');
  console.log('   3. Check USDC balance increased');
}

async function main() {
  console.log('\n' + '═'.repeat(70));
  log(BOLD + BLUE, '  🎯 PRODUCTION MVP PROOF - USDC Transfer Test');
  log(BLUE, '  Proving wallet functionality works end-to-end');
  console.log('═'.repeat(70));
  
  // Get auth token
  const authToken = await getAuthToken();
  
  // Step 1: List wallets
  const wallet = await listWallets(authToken);
  if (!wallet) {
    log(RED, '\n❌ Cannot proceed without a wallet');
    process.exit(1);
  }
  
  // Check if wallet has sufficient balance
  if (!wallet.balances?.usdc || wallet.balances.usdc < 0.5) {
    log(YELLOW, '\n⚠️  Warning: Wallet has insufficient USDC balance');
    log(YELLOW, `   Current: ${wallet.balances?.usdc || 0} USDC`);
    log(YELLOW, '   Required: 0.5 USDC');
    log(YELLOW, '\n   Please fund wallet first using /wallet page');
    process.exit(1);
  }
  
  if (!wallet.balances?.eth || wallet.balances.eth < 0.0001) {
    log(YELLOW, '\n⚠️  Warning: Wallet has insufficient ETH for gas');
    log(YELLOW, `   Current: ${wallet.balances?.eth || 0} ETH`);
    log(YELLOW, '   Required: 0.0001 ETH (minimum)');
    log(YELLOW, '\n   Please fund wallet with ETH first');
    process.exit(1);
  }
  
  // Step 2: Send USDC
  const transferResult = await sendUSDC(wallet, authToken, 0.5);
  if (!transferResult) {
    log(RED, '\n❌ MVP PROOF FAILED - Transfer did not succeed');
    process.exit(1);
  }
  
  // Step 3: Verify on BaseScan
  const explorerUrl = await verifyOnBaseScan(transferResult.transactionHash);
  
  // Step 4: Check recipient
  await checkRecipientBalance();
  
  // Final summary
  section('🎉 MVP PROOF COMPLETE');
  
  log(GREEN, '✅ Wallet listed successfully');
  log(GREEN, '✅ USDC transfer submitted successfully');
  log(GREEN, '✅ Transaction hash received');
  log(GREEN, '✅ No "Sender wallet not found" error!');
  
  console.log('\n' + BOLD + GREEN + '🎯 PROOF OF WORKING MVP:' + RESET);
  log(BOLD, `   ${explorerUrl}`);
  
  console.log('\n' + '═'.repeat(70));
  log(BOLD + GREEN, '  ✅ SUCCESS - MVP is working on production!');
  console.log('═'.repeat(70) + '\n');
  
  console.log('Next steps:');
  console.log('1. Open the BaseScan link above');
  console.log('2. Verify transaction shows "Success"');
  console.log('3. Verify USDC was transferred to recipient');
  console.log('4. Screenshot for documentation\n');
}

// Run the test
main().catch(error => {
  log(RED, '\n❌ Fatal error:');
  console.error(error);
  process.exit(1);
});

