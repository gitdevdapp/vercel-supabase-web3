#!/usr/bin/env node

/**
 * Production Authentication Endpoint Testing Script
 * Tests all authentication-related endpoints to ensure they're working correctly
 */

const https = require('https');

// Configuration
const PRODUCTION_URL = 'https://devdapp.com';
const ENDPOINTS_TO_TEST = [
  { path: '/', name: 'Homepage', expectAuth: false },
  { path: '/auth/sign-up', name: 'Sign Up Page', expectAuth: false },
  { path: '/auth/login', name: 'Login Page', expectAuth: false },
  { path: '/auth/forgot-password', name: 'Forgot Password Page', expectAuth: false },
  { path: '/protected', name: 'Protected Area', expectAuth: true },
  { path: '/protected/profile', name: 'Profile Page', expectAuth: true },
];

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      resolve({
        statusCode: response.statusCode,
        headers: response.headers,
        redirected: response.statusCode >= 300 && response.statusCode < 400
      });
    });

    request.on('error', (error) => {
      reject(error);
    });

    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testEndpoint(endpoint) {
  const url = `${PRODUCTION_URL}${endpoint.path}`;
  
  try {
    console.log(`Testing: ${endpoint.name} (${endpoint.path})`);
    
    const response = await makeRequest(url);
    
    let status = '✅ PASS';
    let details = '';
    
    if (endpoint.expectAuth && response.statusCode === 200) {
      status = '⚠️  UNEXPECTED';
      details = '(Expected redirect to login, but got 200)';
    } else if (endpoint.expectAuth && (response.statusCode === 302 || response.statusCode === 307)) {
      const location = response.headers.location;
      if (location && location.includes('/auth/login')) {
        status = '✅ PASS';
        details = '(Correctly redirected to login)';
      } else {
        status = '⚠️  UNEXPECTED';
        details = `(Redirected to: ${location})`;
      }
    } else if (!endpoint.expectAuth && response.statusCode === 200) {
      status = '✅ PASS';
      details = '(Public page accessible)';
    } else if (response.statusCode >= 400) {
      status = '❌ FAIL';
      details = `(HTTP ${response.statusCode})`;
    }
    
    console.log(`   ${status} ${details}`);
    return { success: status.includes('✅'), endpoint: endpoint.name, status: response.statusCode, details };
    
  } catch (error) {
    console.log(`   ❌ FAIL (${error.message})`);
    return { success: false, endpoint: endpoint.name, error: error.message };
  }
}

async function testSupabaseConnection() {
  console.log('🔌 Testing Supabase Connection...');
  
  // Test if we can reach the Supabase project
  const supabaseUrl = 'https://mjrnzgunexmopvnamggw.supabase.co/rest/v1/';
  
  try {
    const response = await makeRequest(supabaseUrl);
    if (response.statusCode === 401) {
      console.log('   ✅ PASS (Supabase API reachable - 401 expected without auth)');
      return true;
    } else {
      console.log(`   ⚠️  UNEXPECTED (Status: ${response.statusCode})`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ FAIL (${error.message})`);
    return false;
  }
}

async function main() {
  console.log('🧪 PRODUCTION AUTHENTICATION ENDPOINT TESTING');
  console.log('==============================================');
  console.log(`Testing against: ${PRODUCTION_URL}`);
  console.log('');

  // Test Supabase connection first
  await testSupabaseConnection();
  console.log('');

  // Test all endpoints
  console.log('🌐 Testing Application Endpoints...');
  const results = [];
  
  for (const endpoint of ENDPOINTS_TO_TEST) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    console.log('');
  }

  // Summary
  console.log('📊 TEST SUMMARY');
  console.log('===============');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ${failed > 0 ? '❌' : ''}`);
  console.log('');

  if (failed > 0) {
    console.log('❌ FAILED TESTS:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`   - ${result.endpoint}: ${result.details || result.error}`);
    });
    console.log('');
  }

  // Recommendations
  console.log('💡 RECOMMENDATIONS');
  console.log('==================');
  
  if (failed === 0) {
    console.log('✅ All tests passed! Your production authentication setup appears to be working correctly.');
    console.log('');
    console.log('🔄 Next steps:');
    console.log('1. Test actual sign-up flow with a real email');
    console.log('2. Verify email verification links work');
    console.log('3. Test complete login → profile → logout cycle');
  } else {
    console.log('⚠️  Some tests failed. Common issues and solutions:');
    console.log('');
    console.log('1. If all endpoints return errors:');
    console.log('   - Check if your domain is properly configured');
    console.log('   - Verify DNS is pointing to Vercel');
    console.log('   - Ensure latest deployment is live');
    console.log('');
    console.log('2. If protected routes are accessible without auth:');
    console.log('   - Check middleware configuration');
    console.log('   - Verify Supabase environment variables in Vercel');
    console.log('   - Check auth route configuration');
    console.log('');
    console.log('3. If auth pages return errors:');
    console.log('   - Verify Supabase project configuration');
    console.log('   - Check environment variables in Vercel dashboard');
    console.log('   - Review build logs for errors');
  }

  console.log('');
  console.log('📋 For detailed migration guide, see: docs/future/canonical-mjr-supabase-migration-guide.md');
  console.log('🔧 To test local environment, run: node scripts/verify-env.js');
  console.log('');

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the tests
main();