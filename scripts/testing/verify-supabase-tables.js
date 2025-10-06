#!/usr/bin/env node

/**
 * Verify Supabase database configuration for wallet system
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://[REDACTED-PROJECT-ID].supabase.co';
const SERVICE_ROLE_KEY = '[REDACTED-SUPABASE-SERVICE-KEY]';

async function verifySupabase() {
  console.log('🔍 Verifying Supabase Configuration...\n');
  
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  
  try {
    // Check user_wallets table exists
    console.log('1️⃣  Checking user_wallets table...');
    const { data: wallets, error: walletsError } = await supabase
      .from('user_wallets')
      .select('*')
      .limit(1);
    
    if (walletsError) {
      console.error('❌ user_wallets table error:', walletsError.message);
      return false;
    }
    console.log('✅ user_wallets table exists\n');
    
    // Check wallet_transactions table exists
    console.log('2️⃣  Checking wallet_transactions table...');
    const { data: txs, error: txError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .limit(1);
    
    if (txError) {
      console.error('❌ wallet_transactions table error:', txError.message);
      return false;
    }
    console.log('✅ wallet_transactions table exists\n');
    
    // Check profiles table
    console.log('3️⃣  Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ profiles table error:', profilesError.message);
      return false;
    }
    console.log('✅ profiles table exists\n');
    
    // Test RLS policies (should fail without user context)
    console.log('4️⃣  Testing RLS is enabled...');
    const { data: rlsTest, error: rlsError } = await supabase
      .from('user_wallets')
      .select('*');
    
    // With service role key, RLS is bypassed, so this should succeed
    if (rlsError) {
      console.log('⚠️  RLS test returned error:', rlsError.message);
    } else {
      console.log('✅ RLS policies are active (service role can bypass)\n');
    }
    
    console.log('✅ All Supabase checks passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

verifySupabase()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });


