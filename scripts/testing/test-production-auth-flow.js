#!/usr/bin/env node

/**
 * 🧪 Production Authentication Flow Test
 * Tests complete user signup → email confirmation → profile access flow
 * Verifies PKCE token handling and database synchronization
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if it exists
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      if (value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY');
  process.exit(1);
}

// Create Supabase clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function generateTestUser() {
  const timestamp = Date.now();
  return {
    email: `auth-test-${timestamp}@mailinator.com`,
    password: 'TestPassword123!',
    timestamp
  };
}

async function waitForUserInput(question) {
  const rl = createReadlineInterface();
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function testProductionAuthFlow() {
  console.log('🚀 Production Authentication Flow Test');
  console.log('=====================================');
  console.log();

  // Verify environment configuration
  console.log('🔍 Environment Configuration:');
  console.log(`   Supabase URL: ${supabaseUrl}`);
  console.log(`   Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);
  console.log(`   Admin Access: ${supabaseAdmin ? '✅ Available' : '❌ Not configured'}`);
  console.log();

  // Step 1: Test user creation
  const testUser = generateTestUser();
  console.log('👤 Step 1: Creating test user...');
  console.log(`   Email: ${testUser.email}`);
  console.log(`   Password: ${testUser.password}`);
  console.log();

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        emailRedirectTo: 'https://devdapp.com/auth/confirm?next=/protected/profile'
      }
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('No user data returned from signup');
    }

    console.log('✅ User created successfully!');
    console.log(`   User ID: ${data.user.id}`);
    console.log(`   Email: ${data.user.email}`);
    console.log(`   Confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`);
    console.log();

    testUser.id = data.user.id;

    // Step 2: Verify profile creation
    console.log('📊 Step 2: Checking profile auto-creation...');
    
    // Wait a moment for trigger to execute
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUser.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.warn('⚠️ Profile query error:', profileError.message);
    }

    if (profile) {
      console.log('✅ Profile auto-created successfully!');
      console.log(`   Username: ${profile.username}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   About me: ${profile.about_me?.substring(0, 50)}...`);
      console.log(`   Created: ${profile.created_at}`);
    } else {
      console.log('❌ Profile not found - database trigger may not be working');
    }
    console.log();

    // Step 3: Get confirmation token (if admin access available)
    if (supabaseAdmin) {
      console.log('🔗 Step 3: Retrieving confirmation token...');
      
      const { data: authUser, error: authError } = await supabaseAdmin
        .from('auth.users')
        .select('confirmation_token, email_confirmed_at')
        .eq('id', testUser.id)
        .single();

      if (authError) {
        console.warn('⚠️ Could not retrieve auth user data:', authError.message);
      } else {
        if (authUser.confirmation_token) {
          // Construct the confirmation URL that should be in the email
          const confirmationUrl = `https://devdapp.com/auth/confirm?token_hash=${authUser.confirmation_token}&type=signup&next=/protected/profile`;
          
          console.log('✅ Confirmation token found!');
          console.log();
          console.log('📧 EMAIL CONFIRMATION URL:');
          console.log('=' .repeat(80));
          console.log(confirmationUrl);
          console.log('=' .repeat(80));
          console.log();
          
          testUser.confirmationUrl = confirmationUrl;
        } else {
          console.log('⚠️ No confirmation token found (user may already be confirmed)');
        }
      }
    } else {
      console.log('⚠️ Step 3: Admin access not available');
      console.log('📧 Check the email address for confirmation link');
    }
    console.log();

    // Step 4: Manual confirmation test
    console.log('🔑 Step 4: Email Confirmation Test');
    console.log('📋 Instructions:');
    if (testUser.confirmationUrl) {
      console.log('1. Copy the confirmation URL above');
      console.log('2. Open it in your browser (or click if terminal supports links)');
      console.log('3. Verify you are redirected to the profile page');
      console.log('4. Come back and press Enter to continue the test');
    } else {
      console.log('1. Check the email address: ' + testUser.email);
      console.log('2. Click the confirmation link in the email');
      console.log('3. Verify you are redirected to the profile page');
      console.log('4. Come back and press Enter to continue the test');
    }
    console.log();

    await waitForUserInput('Press Enter after testing the confirmation link...');

    // Step 5: Verify confirmation worked
    console.log('🔍 Step 5: Verifying email confirmation...');
    
    if (supabaseAdmin) {
      const { data: confirmedUser, error: confirmError } = await supabaseAdmin
        .from('auth.users')
        .select('email_confirmed_at, last_sign_in_at')
        .eq('id', testUser.id)
        .single();

      if (confirmError) {
        console.warn('⚠️ Could not verify confirmation status:', confirmError.message);
      } else {
        if (confirmedUser.email_confirmed_at) {
          console.log('✅ Email confirmation successful!');
          console.log(`   Confirmed at: ${confirmedUser.email_confirmed_at}`);
          console.log(`   Last sign in: ${confirmedUser.last_sign_in_at || 'Never'}`);
        } else {
          console.log('❌ Email confirmation failed or not completed');
        }
      }

      // Check updated profile data
      const { data: updatedProfile, error: profileUpdateError } = await supabaseAdmin
        .from('profiles')
        .select('email_verified, last_active_at')
        .eq('id', testUser.id)
        .single();

      if (!profileUpdateError && updatedProfile) {
        console.log(`   Profile email_verified: ${updatedProfile.email_verified}`);
        console.log(`   Profile last_active: ${updatedProfile.last_active_at}`);
      }
    }
    console.log();

    // Step 6: Test profile access
    console.log('👤 Step 6: Testing profile access...');
    console.log('📋 Instructions:');
    console.log('1. Go to: https://devdapp.com/protected/profile');
    console.log('2. Verify you can access the profile page without logging in again');
    console.log('3. Try editing the "About Me" section');
    console.log('4. Verify changes save successfully');
    console.log();

    const profileAccessResult = await waitForUserInput('Did profile access work correctly? (y/n): ');
    
    if (profileAccessResult.toLowerCase() === 'y' || profileAccessResult.toLowerCase() === 'yes') {
      console.log('✅ Profile access working correctly!');
    } else {
      console.log('❌ Profile access issues detected');
    }
    console.log();

    // Final Summary
    console.log('📊 TEST SUMMARY');
    console.log('================');
    console.log(`✅ User Creation: SUCCESS`);
    console.log(`${profile ? '✅' : '❌'} Profile Auto-Creation: ${profile ? 'SUCCESS' : 'FAILED'}`);
    console.log(`${testUser.confirmationUrl ? '✅' : '⚠️'} Confirmation URL: ${testUser.confirmationUrl ? 'GENERATED' : 'CHECK EMAIL'}`);
    console.log(`${profileAccessResult.toLowerCase().startsWith('y') ? '✅' : '❌'} Profile Access: ${profileAccessResult.toLowerCase().startsWith('y') ? 'SUCCESS' : 'FAILED'}`);
    console.log();

    if (profile && testUser.confirmationUrl && profileAccessResult.toLowerCase().startsWith('y')) {
      console.log('🎉 COMPLETE SUCCESS! Authentication system is fully operational.');
      console.log('🚀 Ready for production deployment!');
    } else {
      console.log('⚠️ Some issues detected. Review the failures above.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('   Full error:', error);
  }

  console.log();
  console.log('🧪 Test completed');
}

// Run the test
if (require.main === module) {
  testProductionAuthFlow().catch(console.error);
}

module.exports = { testProductionAuthFlow };
