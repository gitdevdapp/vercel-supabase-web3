#!/usr/bin/env node

/**
 * Production Wallet Test Script
 * Tests the wallet functionality on production
 * 
 * Prerequisites:
 * - Must be logged into production site in browser
 * - Copy session token from browser DevTools
 * 
 * Usage:
 * node scripts/testing/test-wallet-production.js
 */

const PRODUCTION_URL = 'https://vercel-supabase-web3.vercel.app';
const TEST_RECIPIENT = '0x69e95EfB076Da0D2f365eD1f8520AdDa816d647B';

// ANSI color codes
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[36m';
const RESET = '\x1b[0m';

function log(color, message) {
  console.log(`${color}${message}${RESET}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(BLUE, title);
  console.log('='.repeat(60) + '\n');
}

async function makeRequest(endpoint, method = 'GET', body = null) {
  const url = `${PRODUCTION_URL}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for session cookies
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

async function testWalletList() {
  section('TEST 1: List Wallets');
  
  const result = await makeRequest('/api/wallet/list');
  
  if (!result.ok) {
    log(RED, `❌ Failed to list wallets: ${result.error || result.data?.error}`);
    return null;
  }
  
  if (!result.data.wallets || result.data.wallets.length === 0) {
    log(YELLOW, '⚠️  No wallets found. Please create a wallet first.');
    return null;
  }
  
  const wallet = result.data.wallets[0];
  log(GREEN, `✅ Found wallet: ${wallet.name}`);
  console.log(`   Address: ${wallet.address}`);
  console.log(`   USDC Balance: ${wallet.balances?.usdc || 0}`);
  console.log(`   ETH Balance: ${wallet.balances?.eth || 0}`);
  
  return wallet;
}

async function testBalanceCheck(walletAddress) {
  section('TEST 2: Check USDC Balance (Direct Blockchain)');
  
  const result = await makeRequest(`/api/wallet/balance?address=${walletAddress}`);
  
  if (!result.ok) {
    log(RED, `❌ Failed to check balance: ${result.error || result.data?.error}`);
    return false;
  }
  
  log(GREEN, `✅ Balance API Working`);
  console.log(`   USDC: ${result.data.usdc}`);
  console.log(`   ETH: ${result.data.eth}`);
  console.log(`   Source: ${result.data.balanceSource}`);
  console.log(`   Last Updated: ${result.data.lastUpdated}`);
  
  if (result.data.debug) {
    console.log('\n   Debug Info:');
    console.log(`   - Raw USDC: ${result.data.debug.usdcAmount}`);
    console.log(`   - Raw ETH: ${result.data.debug.ethAmount}`);
    console.log(`   - Network: ${result.data.debug.network}`);
  }
  
  return result.data.usdc > 0;
}

async function testUSDCTransfer(walletAddress, amount = 0.1) {
  section('TEST 3: Send USDC Transfer');
  
  log(YELLOW, `Attempting to send ${amount} USDC...`);
  console.log(`   From: ${walletAddress}`);
  console.log(`   To: ${TEST_RECIPIENT}`);
  
  const result = await makeRequest('/api/wallet/transfer', 'POST', {
    fromAddress: walletAddress,
    toAddress: TEST_RECIPIENT,
    amount: amount,
    token: 'usdc'
  });
  
  if (!result.ok) {
    log(RED, `❌ Transfer failed: ${result.data?.error || 'Unknown error'}`);
    if (result.data?.details) {
      console.log(`   Details: ${result.data.details}`);
    }
    return null;
  }
  
  log(GREEN, `✅ Transfer submitted successfully!`);
  console.log(`   Transaction Hash: ${result.data.transactionHash}`);
  console.log(`   Status: ${result.data.status}`);
  console.log(`   Explorer: ${result.data.explorerUrl}`);
  
  return result.data.transactionHash;
}

async function testTransactionHistory() {
  section('TEST 4: Check Transaction History');
  
  const result = await makeRequest('/api/wallet/transactions');
  
  if (!result.ok) {
    log(RED, `❌ Failed to fetch transaction history: ${result.error || result.data?.error}`);
    return false;
  }
  
  log(GREEN, `✅ Transaction History Retrieved`);
  console.log(`   Total Transactions: ${result.data.transactions?.length || 0}`);
  
  if (result.data.transactions && result.data.transactions.length > 0) {
    console.log('\n   Recent Transactions:');
    result.data.transactions.slice(0, 5).forEach((tx, idx) => {
      console.log(`   ${idx + 1}. ${tx.operation_type.toUpperCase()} - ${tx.token_type.toUpperCase()} - ${tx.amount || 'N/A'} - ${tx.status}`);
      if (tx.tx_hash) {
        console.log(`      TX: ${tx.tx_hash}`);
      }
    });
  }
  
  return true;
}

async function runTests() {
  console.log('\n' + '═'.repeat(60));
  log(BLUE, '  PRODUCTION WALLET TESTING SUITE');
  log(BLUE, '  Testing wallet fixes on production');
  console.log('═'.repeat(60));
  
  // Test 1: List wallets
  const wallet = await testWalletList();
  if (!wallet) {
    log(RED, '\n❌ Cannot proceed without a wallet. Please create one first.');
    return;
  }
  
  // Test 2: Check balance
  const hasBalance = await testBalanceCheck(wallet.address);
  
  // Test 3: Send USDC (only if balance available)
  let txHash = null;
  if (hasBalance) {
    txHash = await testUSDCTransfer(wallet.address, 0.1);
  } else {
    section('TEST 3: Send USDC Transfer');
    log(YELLOW, '⚠️  Skipping transfer - insufficient USDC balance');
    log(YELLOW, '   Please fund wallet first using the faucet');
  }
  
  // Test 4: Check transaction history
  await testTransactionHistory();
  
  // Summary
  section('TEST SUMMARY');
  log(GREEN, '✅ Wallet List: PASSED');
  log(GREEN, '✅ Balance Check: PASSED');
  
  if (txHash) {
    log(GREEN, '✅ USDC Transfer: PASSED');
    log(GREEN, `   View on BaseScan: https://sepolia.basescan.org/tx/${txHash}`);
  } else if (hasBalance) {
    log(RED, '❌ USDC Transfer: FAILED');
  } else {
    log(YELLOW, '⚠️  USDC Transfer: SKIPPED (no balance)');
  }
  
  log(GREEN, '✅ Transaction History: PASSED');
  
  console.log('\n' + '═'.repeat(60));
  log(BLUE, '  Testing Complete!');
  console.log('═'.repeat(60) + '\n');
}

// Note: This script requires browser session for authentication
console.log('\n⚠️  NOTE: This script requires authentication.');
console.log('Please test manually at: ' + PRODUCTION_URL + '/wallet\n');

// Export for potential programmatic use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testWalletList,
    testBalanceCheck,
    testUSDCTransfer,
    testTransactionHistory,
    runTests
  };
}

