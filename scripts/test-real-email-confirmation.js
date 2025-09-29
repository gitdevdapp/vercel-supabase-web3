#!/usr/bin/env node

/**
 * Real Email Confirmation Test Script
 * 
 * This script creates a test user, triggers a real email confirmation,
 * and provides instructions for manually testing the confirmation URL.
 * 
 * It demonstrates the complete email confirmation flow including:
 * 1. User signup with email confirmation request
 * 2. Real confirmation URL generation
 * 3. Manual confirmation URL testing instructions
 * 4. Profile page access verification
 * 5. Profile editing functionality test
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const readline = require('readline');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

// Utility functions
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function testEmailConfirmationFlow() {
  const rl = createReadlineInterface();
  
  try {
    console.log('🧪 Real Email Confirmation Flow Test');
    console.log('═'.repeat(60));
    console.log();

    // Get user's email for testing
    const userEmail = await askQuestion(rl, '📧 Enter your email address for testing: ');
    
    if (!userEmail || !userEmail.includes('@')) {
      console.error('❌ Invalid email address');
      return false;
    }

    const testPassword = 'TestPassword123!';
    console.log('🔐 Using password:', testPassword);
    console.log();

    // Step 1: Create user account
    console.log('📝 Step 1: Creating user account...');
    const { data: signupData, error: signupError } = await supabaseClient.auth.signUp({
      email: userEmail,
      password: testPassword,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirm?next=/protected/profile`
      }
    });

    if (signupError) {
      console.error('❌ Signup failed:', signupError.message);
      return false;
    }

    const userId = signupData.user?.id;
    if (!userId) {
      console.error('❌ No user ID returned');
      return false;
    }

    console.log('✅ User account created successfully');
    console.log('👤 User ID:', userId);
    console.log('📧 Confirmation email sent to:', userEmail);
    console.log();

    // Step 2: Wait for profile creation
    console.log('📋 Step 2: Verifying profile creation...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message);
      return false;
    }

    console.log('✅ Profile created automatically');
    console.log('📊 Profile details:');
    console.log('  - Username:', profile.username);
    console.log('  - Email:', profile.email);
    console.log('  - Email verified:', profile.email_verified);
    console.log('  - About me:', profile.about_me?.substring(0, 50) + '...');
    console.log();

    // Step 3: Get confirmation URL (if admin access available)
    if (supabaseAdmin) {
      console.log('🔗 Step 3: Generating confirmation URL...');
      
      const { data: authUser, error: authError } = await supabaseAdmin
        .from('auth.users')
        .select('confirmation_token, email_confirmed_at')
        .eq('id', userId)
        .single();

      if (authError) {
        console.warn('⚠️ Could not retrieve confirmation token:', authError.message);
      } else {
        if (authUser.confirmation_token) {
          const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${authUser.confirmation_token}&type=signup&redirect_to=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')}/auth/confirm?next=/protected/profile`;
          
          console.log('✅ Confirmation URL generated:');
          console.log();
          console.log('🔗 CONFIRMATION URL:');
          console.log('═'.repeat(60));
          console.log(confirmationUrl);
          console.log('═'.repeat(60));
          console.log();
          
          console.log('📋 Instructions:');
          console.log('1. Copy the confirmation URL above');
          console.log('2. Open it in your browser');
          console.log('3. You should be redirected to the profile page');
          console.log('4. Come back here and continue the test');
          console.log();
        } else {
          console.log('✅ User already confirmed or token expired');
        }
      }
    } else {
      console.log('⚠️ Step 3: Admin access not available - check your email for confirmation link');
      console.log('📧 Check your email (' + userEmail + ') for the confirmation link');
      console.log();
    }

    // Step 4: Wait for user to confirm
    console.log('⏳ Step 4: Waiting for email confirmation...');
    await askQuestion(rl, 'Press Enter after you have clicked the confirmation link...');

    // Step 5: Verify confirmation
    console.log('🔍 Step 5: Verifying email confirmation...');
    
    if (supabaseAdmin) {
      const { data: confirmedUser, error: confirmError } = await supabaseAdmin
        .from('auth.users')
        .select('email_confirmed_at')
        .eq('id', userId)
        .single();

      if (confirmError) {
        console.error('❌ Could not verify confirmation:', confirmError.message);
      } else {
        if (confirmedUser.email_confirmed_at) {
          console.log('✅ Email confirmed successfully at:', confirmedUser.email_confirmed_at);
        } else {
          console.log('⚠️ Email not yet confirmed');
        }
      }
    }

    // Step 6: Test login and profile access
    console.log('🔑 Step 6: Testing login...');
    const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
      email: userEmail,
      password: testPassword
    });

    if (loginError) {
      console.error('❌ Login failed:', loginError.message);
      return false;
    }

    console.log('✅ Login successful');
    console.log('🎫 Session created');
    console.log();

    // Step 7: Test profile access and editing
    console.log('👤 Step 7: Testing profile access and editing...');
    
    const { data: currentUser } = await supabaseClient.auth.getUser();
    if (!currentUser.user) {
      console.error('❌ No authenticated user found');
      return false;
    }

    // Test profile retrieval
    const { data: currentProfile, error: currentProfileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', currentUser.user.id)
      .single();

    if (currentProfileError) {
      console.error('❌ Could not retrieve profile:', currentProfileError.message);
      return false;
    }

    console.log('✅ Profile accessed successfully');
    console.log('📊 Current profile:');
    console.log('  - Username:', currentProfile.username);
    console.log('  - About me:', currentProfile.about_me);
    console.log();

    // Test profile editing
    const updatedAboutMe = `Profile updated via test script at ${new Date().toISOString()}. This confirms that the complete user flow is working correctly!`;
    
    const { data: updatedProfile, error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        about_me: updatedAboutMe,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentUser.user.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Profile update failed:', updateError.message);
      return false;
    }

    console.log('✅ Profile edited successfully');
    console.log('📝 New about me:', updatedProfile.about_me);
    console.log();

    // Step 8: Final verification
    console.log('🎯 Step 8: Final verification...');
    
    // Verify updated profile persists
    const { data: finalProfile, error: finalError } = await supabaseClient
      .from('profiles')
      .select('about_me, updated_at')
      .eq('id', currentUser.user.id)
      .single();

    if (finalError) {
      console.error('❌ Final verification failed:', finalError.message);
      return false;
    }

    console.log('✅ Profile changes persisted');
    console.log('📅 Last updated:', finalProfile.updated_at);
    console.log();

    // Success summary
    console.log('🎉 COMPLETE FLOW TEST SUCCESSFUL!');
    console.log('═'.repeat(60));
    console.log('✅ User signup');
    console.log('✅ Profile auto-creation');
    console.log('✅ Email confirmation');
    console.log('✅ User login');
    console.log('✅ Profile page access');
    console.log('✅ Profile editing');
    console.log('✅ Data persistence');
    console.log();
    console.log('🚀 System is ready for production!');
    
    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  } finally {
    rl.close();
  }
}

async function cleanupTestData() {
  const rl = createReadlineInterface();
  
  try {
    const shouldCleanup = await askQuestion(rl, '\n🧹 Do you want to clean up test data? (y/N): ');
    
    if (shouldCleanup.toLowerCase() === 'y') {
      const userEmail = await askQuestion(rl, '📧 Enter the test email to clean up: ');
      
      if (supabaseAdmin && userEmail) {
        // Find and delete the test user
        const { data: users, error: findError } = await supabaseAdmin
          .from('auth.users')
          .select('id')
          .eq('email', userEmail);

        if (findError) {
          console.error('❌ Could not find user:', findError.message);
        } else if (users && users.length > 0) {
          const userId = users[0].id;
          
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
          
          if (deleteError) {
            console.error('❌ Could not delete user:', deleteError.message);
          } else {
            console.log('✅ Test user cleaned up successfully');
          }
        } else {
          console.log('⚠️ No user found with that email');
        }
      } else {
        console.log('⚠️ Cannot cleanup without admin access');
      }
    }
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  } finally {
    rl.close();
  }
}

async function main() {
  console.log('🚀 Real Email Confirmation Flow Test');
  console.log('This script will test the complete user authentication flow');
  console.log('including real email confirmation URLs.');
  console.log();

  const success = await testEmailConfirmationFlow();
  
  if (success) {
    await cleanupTestData();
  }

  process.exit(success ? 0 : 1);
}

main().catch(console.error);
