#!/usr/bin/env node

/**
 * Production Authentication Test Script
 * 
 * This script tests the live production authentication flow at https://www.devdapp.com
 * to ensure new users can successfully create accounts and login.
 * 
 * Usage:
 *   node scripts/test-production-auth.js
 *   npm run test:production
 */

const { execSync } = require('child_process');
const path = require('path');

// Test configuration
const PRODUCTION_URL = 'https://www.devdapp.com';
const TEST_TIMEOUT = 45000;

console.log('🚀 DevDapp.com Production Authentication Test');
console.log('============================================');
console.log(`🌐 Target: ${PRODUCTION_URL}`);
console.log(`⏰ Timeout: ${TEST_TIMEOUT}ms`);
console.log('');

// Environment validation
console.log('🔍 Validating Environment...');

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('');
  console.error('💡 Please ensure your .env.local file contains the required Supabase credentials.');
  process.exit(1);
}

// Validate URL format
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl.match(/^https:\/\/[a-z0-9]+\.supabase\.co$/)) {
  console.error('❌ Invalid Supabase URL format');
  console.error(`   Expected: https://[project-id].supabase.co`);
  console.error(`   Received: ${supabaseUrl}`);
  process.exit(1);
}

// Validate key format
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
if (!supabaseKey.startsWith('eyJ') || supabaseKey.length < 200) {
  console.error('❌ Invalid Supabase API key format');
  console.error('   Expected: JWT token starting with "eyJ" and 200+ characters');
  console.error(`   Received length: ${supabaseKey.length} characters`);
  process.exit(1);
}

console.log('✅ Environment variables validated');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.substring(0, 20)}... (${supabaseKey.length} chars)`);
console.log('');

// Network connectivity check
console.log('🌐 Testing Network Connectivity...');

async function testConnectivity() {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log('✅ Supabase connectivity confirmed');
    return true;
  } catch (error) {
    console.error('❌ Network connectivity failed:', error.message);
    return false;
  }
}

// Quick health check
async function quickHealthCheck() {
  console.log('🔬 Running Quick Health Check...');
  
  try {
    // Import and run the quick health check
    const { quickProductionHealthCheck } = require('../__tests__/production/live-production-auth.test.ts');
    const isHealthy = await quickProductionHealthCheck();
    
    if (isHealthy) {
      console.log('✅ Quick health check passed');
      return true;
    } else {
      console.log('❌ Quick health check failed');
      return false;
    }
  } catch (error) {
    console.log('⚠️ Quick health check unavailable:', error.message);
    return true; // Continue with full test
  }
}

// Main test execution
async function runProductionTests() {
  console.log('🧪 Running Full Production Test Suite...');
  console.log('');

  try {
    // Run the Jest test suite
    const command = `npx jest __tests__/production/live-production-auth.test.ts --testTimeout=${TEST_TIMEOUT} --verbose --no-cache`;
    
    console.log(`Executing: ${command}`);
    console.log('');

    execSync(command, { 
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
      env: { ...process.env, NODE_ENV: 'test' }
    });

    console.log('');
    console.log('🎉 All production tests passed!');
    console.log('✅ devdapp.com authentication is fully operational');
    
    return true;
  } catch (error) {
    console.error('');
    console.error('❌ Production tests failed');
    console.error('');
    
    if (error.status) {
      console.error(`Exit code: ${error.status}`);
    }
    
    return false;
  }
}

// Test summary
function printSummary(success) {
  console.log('');
  console.log('📊 Production Test Summary');
  console.log('========================');
  console.log(`🌐 Environment: ${PRODUCTION_URL}`);
  console.log(`🔧 Supabase: ${supabaseUrl}`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log(`📈 Status: ${success ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (success) {
    console.log('');
    console.log('🚀 Ready for Production Use!');
    console.log('   New users can successfully:');
    console.log('   ✅ Create accounts at https://www.devdapp.com/auth/sign-up');
    console.log('   ✅ Receive confirmation emails');
    console.log('   ✅ Login after email confirmation');
    console.log('   ✅ Access protected features');
  } else {
    console.log('');
    console.log('🔧 Action Required:');
    console.log('   - Review test output above for specific failures');
    console.log('   - Check environment variable configuration');
    console.log('   - Verify Supabase project status');
    console.log('   - Test network connectivity');
  }
}

// Execute the full test flow
async function main() {
  try {
    // Step 1: Test network connectivity
    const connectivityOk = await testConnectivity();
    if (!connectivityOk) {
      printSummary(false);
      process.exit(1);
    }

    // Step 2: Quick health check
    await quickHealthCheck();

    // Step 3: Full production tests
    const testsSuccess = await runProductionTests();
    
    // Step 4: Summary
    printSummary(testsSuccess);
    
    process.exit(testsSuccess ? 0 : 1);
    
  } catch (error) {
    console.error('');
    console.error('💥 Unexpected error during production testing:');
    console.error(error.message);
    console.error('');
    
    printSummary(false);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  // Load environment variables
  require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });
  
  // Run main function
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
