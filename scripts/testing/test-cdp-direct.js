/**
 * Direct CDP SDK Test - Minimal reproduction script
 * This tests if CDP credentials work independently of Next.js
 */

const { CdpClient } = require('@coinbase/cdp-sdk');

// Use credentials from vercel-env-variables.txt
const CDP_API_KEY_ID = '69aac710-e242-4844-aa2b-d4056e61606b';
const CDP_API_KEY_SECRET = 'HH0FhrZ5CdAoFpWRLdZQPR9kqsUYTbp4hVcqhb6FZErZ973X4ldxKxKJ4wN2hAM8jXxNmARty44+DMnMdFQQqA==';
const CDP_WALLET_SECRET = 'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgXVAKZtzzIhOF3PobWNswbBPROzWKBfmj7jCglV2I58ehRANCAASYGh3+MAdVpgIRt+ZzT1b75mpkwHg+dHmPa3j8oC45uT+eSqgHgXL5rhkSUykpAQkRzdXQsms7pc98D7msqS2y';

async function testCdpCredentials() {
  console.log('🔍 Testing CDP Credentials...\n');
  
  console.log('📋 Configuration:');
  console.log('  API Key ID:', CDP_API_KEY_ID);
  console.log('  API Key Secret:', CDP_API_KEY_SECRET.substring(0, 20) + '...');
  console.log('  Wallet Secret:', CDP_WALLET_SECRET.substring(0, 20) + '...\n');

  try {
    console.log('1️⃣ Attempting: CdpClient with constructor params...');
    const cdp1 = new CdpClient({
      apiKeyId: CDP_API_KEY_ID,
      apiKeySecret: CDP_API_KEY_SECRET,
      walletSecret: CDP_WALLET_SECRET,
    });
    
    console.log('   ✅ CdpClient created with constructor params\n');
    
    console.log('2️⃣ Testing: Account creation...');
    const timestamp = Date.now();
    const accountName = `test-${timestamp}`;
    
    console.log(`   Creating account: "${accountName}"`);
    const account = await cdp1.evm.getOrCreateAccount({
      name: accountName
    });
    
    console.log('   ✅ Account created successfully!');
    console.log('   📍 Address:', account.address);
    console.log('   📝 Name:', accountName);
    
    return { success: true, address: account.address };
    
  } catch (error) {
    console.log('   ❌ FAILED with constructor params');
    console.log('   Error:', error.message);
    if (error.statusCode) {
      console.log('   Status Code:', error.statusCode);
      console.log('   Error Type:', error.errorType);
      console.log('   Correlation ID:', error.correlationId);
    }
    console.log('\n');
    
    // Try with environment variables
    try {
      console.log('3️⃣ Attempting: CdpClient with environment variables...');
      process.env.CDP_API_KEY_ID = CDP_API_KEY_ID;
      process.env.CDP_API_KEY_SECRET = CDP_API_KEY_SECRET;
      process.env.CDP_WALLET_SECRET = CDP_WALLET_SECRET;
      
      const cdp2 = new CdpClient();
      console.log('   ✅ CdpClient created with env vars\n');
      
      console.log('4️⃣ Testing: Account creation with env vars...');
      const timestamp2 = Date.now();
      const accountName2 = `test-${timestamp2}`;
      
      console.log(`   Creating account: "${accountName2}"`);
      const account2 = await cdp2.evm.getOrCreateAccount({
        name: accountName2
      });
      
      console.log('   ✅ Account created successfully with env vars!');
      console.log('   📍 Address:', account2.address);
      console.log('   📝 Name:', accountName2);
      
      return { success: true, address: account2.address, method: 'env_vars' };
      
    } catch (error2) {
      console.log('   ❌ FAILED with environment variables too');
      console.log('   Error:', error2.message);
      if (error2.statusCode) {
        console.log('   Status Code:', error2.statusCode);
        console.log('   Error Type:', error2.errorType);
        console.log('   Correlation ID:', error2.correlationId);
      }
      
      return { 
        success: false, 
        error: error2.message,
        statusCode: error2.statusCode,
        errorType: error2.errorType
      };
    }
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  CDP SDK Direct Test - Credential Validation');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const result = await testCdpCredentials();
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  FINAL RESULT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(JSON.stringify(result, null, 2));
  console.log('═══════════════════════════════════════════════════════════\n');
  
  process.exit(result.success ? 0 : 1);
}

main().catch(error => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});

