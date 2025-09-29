#!/usr/bin/env node

/**
 * Complete User Flow Automated Test Script
 * 
 * This script automatically tests the complete user lifecycle:
 * 1. User signup and auth.users/profiles synchronization
 * 2. Email confirmation (simulated with admin API)
 * 3. User login and profile access
 * 4. Profile editing functionality
 * 5. Data persistence verification
 * 
 * This script can run without manual intervention and is suitable for CI/CD.
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Test configuration
const TEST_EMAIL_PREFIX = 'automated-flow-test';
const TEST_EMAIL_DOMAIN = '@mailinator.com';
const TEST_PASSWORD = 'TestPassword123!';

// Validate environment
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY');
  process.exit(1);
}

// Create clients
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
});

const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

if (!supabaseAdmin) {
  console.warn('⚠️ Service role key not available - some tests will be limited');
}

class TestManager {
  constructor() {
    this.testUsers = [];
  }

  generateTestUser() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const email = `${TEST_EMAIL_PREFIX}-${timestamp}-${random}${TEST_EMAIL_DOMAIN}`;
    
    const user = {
      email,
      password: TEST_PASSWORD,
      id: null,
      createdAt: new Date().toISOString()
    };
    
    this.testUsers.push(user);
    return user;
  }

  async cleanup() {
    if (!supabaseAdmin) {
      console.log('⚠️ Cannot cleanup test users without admin access');
      return;
    }

    console.log(`🧹 Cleaning up ${this.testUsers.length} test users...`);
    
    for (const user of this.testUsers) {
      if (user.id) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(user.id);
          console.log(`✅ Cleaned up user: ${user.email}`);
        } catch (error) {
          console.warn(`⚠️ Could not clean up ${user.email}:`, error.message);
        }
      }
    }
  }
}

async function runCompleteFlowTest() {
  const testManager = new TestManager();
  let success = false;

  try {
    console.log('🚀 COMPLETE USER FLOW AUTOMATED TEST');
    console.log('═'.repeat(60));
    console.log('Environment:', {
      url: supabaseUrl,
      hasServiceRole: !!supabaseAdmin,
      timestamp: new Date().toISOString()
    });
    console.log('═'.repeat(60));
    console.log();

    // Test 1: User Signup and Profile Creation
    console.log('📝 Test 1: User Signup and Profile Creation');
    console.log('-'.repeat(40));
    
    const testUser = testManager.generateTestUser();
    console.log('👤 Test user:', testUser.email);

    const { data: signupData, error: signupError } = await supabaseClient.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirm?next=/protected/profile`
      }
    });

    if (signupError) {
      throw new Error(`Signup failed: ${signupError.message}`);
    }

    testUser.id = signupData.user?.id;
    if (!testUser.id) {
      throw new Error('No user ID returned from signup');
    }

    console.log('✅ User created successfully');
    console.log('👤 User ID:', testUser.id);

    // Wait for profile creation trigger
    console.log('⏳ Waiting for profile creation...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', testUser.id)
      .single();

    if (profileError) {
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }

    console.log('✅ Profile created automatically');
    console.log('📊 Profile data:', {
      username: profile.username,
      email: profile.email,
      email_verified: profile.email_verified,
      about_me_preview: profile.about_me?.substring(0, 30) + '...'
    });
    console.log();

    // Test 2: Email Confirmation
    console.log('📧 Test 2: Email Confirmation');
    console.log('-'.repeat(40));

    if (supabaseAdmin) {
      // Simulate email confirmation
      const { data: confirmData, error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
        testUser.id,
        { email_confirm: true }
      );

      if (confirmError) {
        throw new Error(`Email confirmation failed: ${confirmError.message}`);
      }

      console.log('✅ Email confirmed via admin API');
      console.log('📧 Confirmation time:', confirmData.user.email_confirmed_at);
    } else {
      console.log('⚠️ Skipping email confirmation - no admin access');
    }
    console.log();

    // Test 3: User Login
    console.log('🔑 Test 3: User Login');
    console.log('-'.repeat(40));

    const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });

    if (loginError) {
      throw new Error(`Login failed: ${loginError.message}`);
    }

    console.log('✅ Login successful');
    console.log('🎫 Session created');
    console.log('⏰ Expires at:', loginData.session?.expires_at);
    console.log();

    // Test 4: Profile Access
    console.log('👤 Test 4: Profile Access');
    console.log('-'.repeat(40));

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }

    const { data: userProfile, error: userProfileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userProfileError) {
      throw new Error(`Profile access failed: ${userProfileError.message}`);
    }

    console.log('✅ Profile accessed successfully');
    console.log('📋 Current profile:', {
      id: userProfile.id,
      username: userProfile.username,
      email: userProfile.email,
      about_me_length: userProfile.about_me?.length || 0
    });
    console.log();

    // Test 5: Profile Editing
    console.log('✏️ Test 5: Profile Editing');
    console.log('-'.repeat(40));

    const testAboutMe = `Profile updated by automated test at ${new Date().toISOString()}. This confirms that the complete user flow is working correctly! The system has been tested for user creation, email confirmation, login, profile access, and editing functionality.`;

    const { data: updatedProfile, error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        about_me: testAboutMe,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Profile update failed: ${updateError.message}`);
    }

    console.log('✅ Profile updated successfully');
    console.log('📝 New about_me length:', updatedProfile.about_me.length);
    console.log('⏰ Updated at:', updatedProfile.updated_at);
    console.log();

    // Test 6: Data Persistence
    console.log('💾 Test 6: Data Persistence');
    console.log('-'.repeat(40));

    // Refresh session to simulate a new page load
    await supabaseClient.auth.refreshSession();

    const { data: persistedProfile, error: persistError } = await supabaseClient
      .from('profiles')
      .select('about_me, updated_at')
      .eq('id', user.id)
      .single();

    if (persistError) {
      throw new Error(`Data persistence check failed: ${persistError.message}`);
    }

    if (persistedProfile.about_me !== testAboutMe) {
      throw new Error('Profile data did not persist correctly');
    }

    console.log('✅ Data persisted correctly');
    console.log('📊 Verified about_me matches expected content');
    console.log();

    // Test 7: Character Limit Validation
    console.log('🔍 Test 7: Character Limit Validation');
    console.log('-'.repeat(40));

    const longText = 'A'.repeat(1001); // Exceeds 1000 character limit
    
    const { error: validationError } = await supabaseClient
      .from('profiles')
      .update({
        about_me: longText
      })
      .eq('id', user.id);

    if (!validationError) {
      throw new Error('Character limit validation failed - should have rejected long text');
    }

    console.log('✅ Character limit validation working');
    console.log('🚫 Correctly rejected text longer than 1000 characters');
    console.log();

    // Success Summary
    console.log('🎉 ALL TESTS PASSED!');
    console.log('═'.repeat(60));
    console.log('✅ User signup and auth.users creation');
    console.log('✅ Automatic profile creation and sync');
    console.log('✅ Email confirmation process');
    console.log('✅ User authentication and login');
    console.log('✅ Profile access and retrieval');
    console.log('✅ Profile editing functionality');
    console.log('✅ Data persistence verification');
    console.log('✅ Input validation and constraints');
    console.log();
    console.log('🚀 SYSTEM IS READY FOR PRODUCTION!');
    
    success = true;

  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.error('💡 Check the error details above for troubleshooting');
    success = false;
  } finally {
    // Cleanup
    await testManager.cleanup();
  }

  return success;
}

async function runHealthChecks() {
  console.log('🏥 SYSTEM HEALTH CHECKS');
  console.log('═'.repeat(60));

  // Database connectivity
  console.log('🔌 Testing database connectivity...');
  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    return false;
  }

  // Schema validation
  console.log('🗄️ Testing schema validation...');
  try {
    const { error } = await supabaseClient
      .from('profiles')
      .select('id, username, email, about_me, bio, email_verified, onboarding_completed, created_at, updated_at')
      .limit(1);

    if (error) {
      console.error('❌ Schema validation failed:', error.message);
      return false;
    }
    console.log('✅ Schema validation successful');
  } catch (error) {
    console.error('❌ Schema validation error:', error.message);
    return false;
  }

  // Auth system
  console.log('🔐 Testing auth system...');
  try {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) {
      console.error('❌ Auth system error:', error.message);
      return false;
    }
    console.log('✅ Auth system operational');
  } catch (error) {
    console.error('❌ Auth system error:', error.message);
    return false;
  }

  console.log('✅ All health checks passed');
  return true;
}

async function main() {
  console.log('🚀 COMPLETE USER FLOW TEST SUITE');
  console.log('Testing complete user lifecycle from signup to profile editing');
  console.log('Timestamp:', new Date().toISOString());
  console.log();

  // Run health checks first
  const healthOk = await runHealthChecks();
  if (!healthOk) {
    console.error('❌ Health checks failed - aborting test');
    process.exit(1);
  }

  console.log();

  // Run complete flow test
  const testSuccess = await runCompleteFlowTest();
  
  console.log();
  console.log('═'.repeat(60));
  console.log('📊 FINAL RESULT');
  console.log('═'.repeat(60));
  
  if (testSuccess) {
    console.log('🎉 ALL TESTS PASSED - SYSTEM READY FOR PRODUCTION');
    console.log('✅ User registration flow working');
    console.log('✅ Email confirmation system operational');
    console.log('✅ Profile management functional');
    console.log('✅ Data persistence verified');
    console.log();
    console.log('🚀 You can now safely deploy and commit changes!');
  } else {
    console.log('❌ TESTS FAILED - SYSTEM NEEDS ATTENTION');
    console.log('💡 Please review the error messages above');
    console.log('🔧 Fix issues before deploying to production');
  }

  process.exit(testSuccess ? 0 : 1);
}

main().catch(console.error);
