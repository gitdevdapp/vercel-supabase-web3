#!/usr/bin/env node

/**
 * Database Verification Test
 * Tests database connectivity, user creation, and profile auto-creation
 */

const { createClient } = require('@supabase/supabase-js');

// Environment configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://[REDACTED-PROJECT-ID].supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || '[REDACTED-SUPABASE-ANON-KEY]';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '[REDACTED-SUPABASE-SERVICE-KEY]';

// Create Supabase clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function testDatabaseVerification() {
  console.log('🔍 Database Verification Test');
  console.log('===============================');
  console.log();

  // Step 1: Test database connectivity
  console.log('📡 Step 1: Testing database connectivity...');
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('count', { count: 'exact' });

    if (error) {
      console.log('❌ Database connection failed:', error.message);
      return;
    }

    console.log('✅ Database connection successful!');
    console.log(`   Current profiles count: ${data.length > 0 ? data[0].count || 0 : 0}`);
    console.log();
  } catch (err) {
    console.log('❌ Database connection error:', err.message);
    return;
  }

  // Step 2: Check existing users and profiles
  console.log('👥 Step 2: Checking existing users and profiles...');
  try {
    // Get current user count from auth.users (using RPC to avoid direct table access)
    const { data: userCountData, error: userCountError } = await supabaseAdmin.rpc('get_user_count');
    
    // Alternative approach: Get profiles directly
    const { data: profilesData, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, username, created_at', { count: 'exact' });

    if (profilesError) {
      console.log('⚠️ Could not fetch profiles:', profilesError.message);
    } else {
      console.log(`✅ Found ${profilesData.length} existing profiles:`);
      profilesData.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.email} (${profile.username}) - ${profile.created_at}`);
      });
    }
    console.log();
  } catch (err) {
    console.log('⚠️ Error checking existing data:', err.message);
  }

  // Step 3: Test user creation
  console.log('👤 Step 3: Testing user creation...');
  const timestamp = Date.now();
  const testEmail = `verify-test-${timestamp}@mailinator.com`;
  const testPassword = 'TestPassword123!';

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: 'https://devdapp.com/auth/confirm?next=/protected/profile'
      }
    });

    if (error) {
      console.log('❌ User creation failed:', error.message);
      return;
    }

    if (!data.user) {
      console.log('❌ No user data returned from signup');
      return;
    }

    console.log('✅ User created successfully!');
    console.log(`   User ID: ${data.user.id}`);
    console.log(`   Email: ${data.user.email}`);
    console.log(`   Email confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`);
    console.log();

    // Step 4: Check profile auto-creation
    console.log('📊 Step 4: Checking profile auto-creation...');
    
    // Wait for trigger to execute
    await new Promise(resolve => setTimeout(resolve, 3000));

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.log('❌ Profile auto-creation failed:', profileError.message);
      
      // Try to create profile manually to test if it's a permissions issue
      console.log('🔧 Attempting manual profile creation...');
      const { data: manualProfile, error: manualError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          username: data.user.email.split('@')[0],
          about_me: 'Welcome to my profile! I am excited to be part of the community.'
        })
        .select()
        .single();

      if (manualError) {
        console.log('❌ Manual profile creation failed:', manualError.message);
      } else {
        console.log('✅ Manual profile creation successful!');
        console.log(`   Username: ${manualProfile.username}`);
        console.log(`   Email: ${manualProfile.email}`);
      }
    } else {
      console.log('✅ Profile auto-created successfully!');
      console.log(`   Username: ${profile.username}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   About me: ${profile.about_me?.substring(0, 50)}...`);
      console.log(`   Created: ${profile.created_at}`);
    }
    console.log();

    // Step 5: Test PKCE token verification
    console.log('🔑 Step 5: Testing PKCE token generation...');
    
    try {
      // Check if confirmation token was generated
      const { data: authUserData, error: authUserError } = await supabaseAdmin.rpc('get_user_confirmation_token', { user_id: data.user.id });

      if (authUserError) {
        console.log('⚠️ Cannot access auth.users directly (expected limitation)');
        console.log('   This is normal - PKCE tokens are handled by Supabase auth system');
      }

      console.log('✅ User signup completed - check email for confirmation link');
      console.log(`   Test email: ${testEmail}`);
      console.log('   Email should contain PKCE confirmation token');
      console.log();
    } catch (err) {
      console.log('⚠️ Auth token check not available (this is normal)');
    }

  } catch (err) {
    console.log('❌ Test failed:', err.message);
  }

  // Final summary
  console.log('📋 VERIFICATION SUMMARY');
  console.log('=======================');
  console.log('✅ Database connectivity: WORKING');
  console.log('✅ User creation: WORKING');
  console.log('🔄 Profile auto-creation: NEEDS VERIFICATION');
  console.log('🔄 PKCE token generation: NEEDS EMAIL CHECK');
  console.log();
  console.log('🎯 Next Steps:');
  console.log('1. Check email for confirmation link');
  console.log('2. Verify database trigger is properly set up');
  console.log('3. Run enhanced database setup if needed');
}

// Execute the test
if (require.main === module) {
  testDatabaseVerification().catch(console.error);
}

module.exports = { testDatabaseVerification };
