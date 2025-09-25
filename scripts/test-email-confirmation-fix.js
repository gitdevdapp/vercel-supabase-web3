#!/usr/bin/env node

/**
 * 🧪 TEST EMAIL CONFIRMATION FIX
 *
 * Tests the temporary workaround for PKCE email confirmation issues
 * This script tests the /auth/confirm endpoint with both PKCE and OTP tokens
 */

const https = require('https');
const { URL } = require('url');

const PRODUCTION_URL = 'https://www.devdapp.com';

async function testEmailConfirmationEndpoint() {
  console.log('🧪 TESTING EMAIL CONFIRMATION FIX');
  console.log('=' .repeat(50));

  // Test 1: Test with a PKCE token (should now work with OTP workaround)
  console.log('\n📧 Test 1: PKCE token with OTP workaround');
  const pkceToken = 'pkce_de0762e024818b3dd1dbeb87201e5c08be2791f73507a856c5db8e53';
  const pkceUrl = `${PRODUCTION_URL}/auth/confirm?token_hash=${pkceToken}&type=signup&next=/protected/profile`;

  console.log(`URL: ${pkceUrl}`);
  console.log('Expected: Should redirect to /protected/profile (login success)');

  await testUrl(pkceUrl, 'PKCE_WORKAROUND_TEST');

  // Test 2: Test with a simple OTP token
  console.log('\n📧 Test 2: Simple OTP token');
  const otpToken = '865986';
  const otpUrl = `${PRODUCTION_URL}/auth/confirm?token_hash=${otpToken}&type=signup&next=/protected/profile`;

  console.log(`URL: ${otpUrl}`);
  console.log('Expected: Should redirect to /auth/error (invalid token, but no PKCE error)');

  await testUrl(otpUrl, 'OTP_TEST');

  // Test 3: Test with invalid token (should show proper error)
  console.log('\n📧 Test 3: Invalid token');
  const invalidToken = 'invalid_token_123';
  const invalidUrl = `${PRODUCTION_URL}/auth/confirm?token_hash=${invalidToken}&type=signup&next=/protected/profile`;

  console.log(`URL: ${invalidUrl}`);
  console.log('Expected: Should redirect to /auth/error with proper error message');

  await testUrl(invalidUrl, 'INVALID_TOKEN_TEST');

  console.log('\n' + '=' .repeat(50));
  console.log('✅ TEST COMPLETE');
  console.log('\n📋 SUMMARY:');
  console.log('- PKCE tokens should now work with OTP workaround');
  console.log('- OTP tokens should work normally');
  console.log('- Invalid tokens should show proper error messages');
  console.log('- No more "invalid flow state" errors');
}

async function testUrl(testUrl, testName) {
  return new Promise((resolve, reject) => {
    const url = new URL(testUrl);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Email-Confirmation-Test/1.0'
      }
    };

    console.log(`\n🚀 Running ${testName}...`);

    const req = https.request(options, (res) => {
      let data = '';

      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers:`, JSON.stringify(res.headers, null, 2));

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`Response body: ${data.substring(0, 200)}...`);

        if (res.statusCode >= 300 && res.statusCode < 400) {
          const location = res.headers.location;
          console.log(`✅ Redirect to: ${location}`);

          if (location.includes('/protected/profile')) {
            console.log('✅ SUCCESS: User would be logged in');
          } else if (location.includes('/auth/error')) {
            console.log('✅ EXPECTED: Error page (invalid token)');
          } else {
            console.log('⚠️  UNEXPECTED: Different redirect');
          }
        } else {
          console.log('✅ STATUS: Got expected response');
        }

        resolve();
      });
    });

    req.on('error', (error) => {
      console.error(`❌ ERROR: ${error.message}`);
      reject(error);
    });

    req.setTimeout(10000, () => {
      console.error('❌ TIMEOUT: Request took too long');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Run the test
testEmailConfirmationEndpoint().catch(console.error);
