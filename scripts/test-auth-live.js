#!/usr/bin/env node

/**
 * Live Supabase Authentication Test Runner
 * 
 * This script runs the live integration tests against the actual Supabase instance.
 * It includes diagnostic checks and provides detailed output for debugging.
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${colors.bold}${colors.cyan}=== ${message} ===${colors.reset}`);
}

function checkEnvironment() {
  logHeader('Environment Check');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY'
  ];
  
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    log(`❌ Missing environment variables: ${missing.join(', ')}`, colors.red);
    log('Please check your environment setup:', colors.yellow);
    log('1. Copy env-example.txt to .env.local', colors.yellow);
    log('2. Fill in your Supabase URL and key', colors.yellow);
    log('3. Ensure your Vercel deployment has these env vars set', colors.yellow);
    return false;
  }
  
  log('✅ All required environment variables are present', colors.green);
  
  // Validate URL format
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url.match(/^https?:\/\/.+/)) {
    log(`❌ Invalid Supabase URL format: ${url}`, colors.red);
    return false;
  }
  
  log(`✅ Supabase URL format is valid: ${url}`, colors.green);
  
  // Validate key format (basic check)
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
  if (key.length < 100) {
    log(`❌ Supabase key appears to be too short (${key.length} chars)`, colors.red);
    return false;
  }
  
  log(`✅ Supabase key format appears valid (${key.length} chars)`, colors.green);
  
  return true;
}

function checkTestSetup() {
  logHeader('Test Setup Check');
  
  const testFile = path.join(__dirname, '..', '__tests__', 'integration', 'auth-live.integration.test.ts');
  if (!fs.existsSync(testFile)) {
    log(`❌ Integration test file not found: ${testFile}`, colors.red);
    return false;
  }
  
  log('✅ Integration test file exists', colors.green);
  
  // Check if Jest is properly configured
  const jestConfig = path.join(__dirname, '..', 'jest.config.js');
  if (!fs.existsSync(jestConfig)) {
    log(`❌ Jest configuration not found: ${jestConfig}`, colors.red);
    return false;
  }
  
  log('✅ Jest configuration exists', colors.green);
  
  return true;
}

async function testNetworkConnectivity() {
  logHeader('Network Connectivity Test');
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
  
  try {
    // Test basic connectivity
    log('Testing network connectivity to Supabase...', colors.blue);
    
    const { execSync } = require('child_process');
    const curlTest = `curl -s -o /dev/null -w "%{http_code}" "${url}/rest/v1/" -H "apikey: ${key}" --max-time 10`;
    
    try {
      const statusCode = execSync(curlTest, { encoding: 'utf8' }).trim();
      
      if (statusCode === '200' || statusCode === '401' || statusCode === '403') {
        log(`✅ Network connectivity successful (HTTP ${statusCode})`, colors.green);
        return true;
      } else {
        log(`❌ Unexpected HTTP status: ${statusCode}`, colors.red);
        return false;
      }
    } catch (error) {
      log('❌ Network connectivity test failed (curl not available, trying fetch)', colors.yellow);
      
      // Fallback test using Node.js fetch (if available)
      try {
        const response = await fetch(`${url}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
          }
        });
        
        log(`✅ Network connectivity successful (HTTP ${response.status})`, colors.green);
        return true;
      } catch (fetchError) {
        log(`❌ Network connectivity failed: ${fetchError.message}`, colors.red);
        return false;
      }
    }
  } catch (error) {
    log(`❌ Network test error: ${error.message}`, colors.red);
    return false;
  }
}

function runIntegrationTests() {
  logHeader('Running Live Integration Tests');
  
  try {
    log('Starting Jest with live integration tests...', colors.blue);
    
    const command = 'npm run test -- --testPathPattern=auth-live.integration.test.ts --verbose --no-cache';
    
    log(`Command: ${command}`, colors.cyan);
    
    execSync(command, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        NODE_ENV: 'test'
      }
    });
    
    log('\n✅ All integration tests passed!', colors.green);
    return true;
  } catch (error) {
    log('\n❌ Integration tests failed', colors.red);
    log('Check the output above for specific test failures', colors.yellow);
    return false;
  }
}

function runDiagnosticAPI() {
  logHeader('Running Diagnostic API Test');
  
  try {
    log('Testing diagnostic API endpoint...', colors.blue);
    
    // This would require the server to be running
    log('To test the diagnostic API:', colors.cyan);
    log('1. Start your development server: npm run dev', colors.cyan);
    log('2. Visit: http://localhost:3000/api/debug/supabase-status', colors.cyan);
    log('3. Or run: curl http://localhost:3000/api/debug/supabase-status', colors.cyan);
    
    return true;
  } catch (error) {
    log(`❌ Diagnostic API test error: ${error.message}`, colors.red);
    return false;
  }
}

async function main() {
  log(`${colors.bold}${colors.blue}🔍 Supabase Authentication Live Test Suite${colors.reset}`);
  log('This script will test your Supabase authentication setup against the live instance.\n');
  
  const steps = [
    { name: 'Environment Variables', fn: checkEnvironment, critical: true },
    { name: 'Test Setup', fn: checkTestSetup, critical: true },
    { name: 'Network Connectivity', fn: testNetworkConnectivity, critical: true },
    { name: 'Integration Tests', fn: runIntegrationTests, critical: true },
    { name: 'Diagnostic API', fn: runDiagnosticAPI, critical: false }
  ];
  
  let allPassed = true;
  
  for (const step of steps) {
    try {
      const result = await step.fn();
      if (!result && step.critical) {
        allPassed = false;
        log(`\n❌ Critical step failed: ${step.name}`, colors.red);
        if (step.critical) {
          log('Cannot continue with remaining tests.', colors.red);
          break;
        }
      }
    } catch (error) {
      log(`\n❌ Error in ${step.name}: ${error.message}`, colors.red);
      if (step.critical) {
        allPassed = false;
        break;
      }
    }
  }
  
  logHeader('Test Summary');
  
  if (allPassed) {
    log('🎉 All tests completed successfully!', colors.green);
    log('Your Supabase authentication setup is working correctly.', colors.green);
  } else {
    log('❌ Some tests failed.', colors.red);
    log('Please review the errors above and fix the issues.', colors.yellow);
    log('\nCommon fixes:', colors.yellow);
    log('1. Check environment variables in .env.local', colors.yellow);
    log('2. Verify Supabase project is active and accessible', colors.yellow);
    log('3. Check network connectivity and firewall settings', colors.yellow);
    log('4. Ensure Supabase keys are valid and not expired', colors.yellow);
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  log(`❌ Unhandled error: ${error.message}`, colors.red);
  process.exit(1);
});

// Run the main function
main().catch((error) => {
  log(`❌ Fatal error: ${error.message}`, colors.red);
  process.exit(1);
});
