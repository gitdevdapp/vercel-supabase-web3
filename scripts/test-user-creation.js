#!/usr/bin/env node

/**
 * Manual User Creation Test Script
 * 
 * This script tests user creation directly using the Supabase client
 * to verify the authentication system works after project restoration.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

console.log('🧪 Manual User Creation Test');
console.log('============================');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY');
  process.exit(1);
}

console.log(`✅ Supabase URL: ${supabaseUrl}`);
console.log(`✅ Supabase Key: ${supabaseKey.substring(0, 20)}...`);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Generate test user
const timestamp = Date.now();
const testEmail = `test.user.${timestamp}@gmail.com`;
const testPassword = 'TestPassword123!';
const testFullName = `Test User ${timestamp}`;

console.log('\n🔍 Testing User Creation');
console.log('========================');
console.log(`Email: ${testEmail}`);
console.log(`Password: ${testPassword}`);
console.log(`Full Name: ${testFullName}`);

async function testUserCreation() {
  try {
    console.log('\n🚀 Attempting user registration...');
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testFullName,
        }
      }
    });

    if (error) {
      console.error('❌ User registration failed:', error.message);
      console.error('Error details:', error);
      return false;
    }

    console.log('✅ User registration successful!');
    console.log('User ID:', data.user?.id);
    console.log('User Email:', data.user?.email);
    console.log('User Created At:', data.user?.created_at);
    
    if (data.session) {
      console.log('✅ Session created');
      console.log('Session ID:', data.session.access_token.substring(0, 20) + '...');
    } else {
      console.log('ℹ️  No session (email confirmation required)');
    }

    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

async function testConnectivity() {
  try {
    console.log('\n🔗 Testing basic connectivity...');
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Connectivity test failed:', error.message);
      return false;
    }
    
    console.log('✅ Basic connectivity successful');
    console.log('Session data:', data.session ? 'Session exists' : 'No active session');
    return true;
  } catch (error) {
    console.error('❌ Connectivity error:', error);
    return false;
  }
}

async function main() {
  console.log('\n🏃 Starting tests...\n');
  
  // Test 1: Basic connectivity
  const connectivityOk = await testConnectivity();
  if (!connectivityOk) {
    console.log('\n❌ Test suite failed at connectivity check');
    process.exit(1);
  }
  
  // Test 2: User creation
  const userCreationOk = await testUserCreation();
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('===============');
  console.log(`Connectivity: ${connectivityOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`User Creation: ${userCreationOk ? '✅ PASS' : '❌ FAIL'}`);
  
  if (connectivityOk && userCreationOk) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('\n✅ Supabase authentication is working correctly');
    console.log('✅ You can now verify the user in your Supabase dashboard:');
    console.log(`   ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/auth/users`);
    process.exit(0);
  } else {
    console.log('\n❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

main();
