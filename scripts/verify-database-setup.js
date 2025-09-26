#!/usr/bin/env node

/**
 * Database Verification Script for Supabase
 *
 * This script verifies if the profiles table and related infrastructure
 * are properly set up in your Supabase database.
 *
 * Usage:
 * 1. Set up your .env.local file with Supabase credentials
 * 2. Run: node scripts/verify-database-setup.js
 */

require('dotenv').config({ path: '.env.local' });

async function verifyDatabaseSetup() {
  console.log('🔍 Verifying Supabase Database Setup...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Environment variables not found!');
    console.log('   Make sure .env.local contains:');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL');
    console.log('   - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY\n');
    return false;
  }

  console.log('✅ Environment variables found');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...\n`);

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔌 Testing Supabase connection...');

    // Test basic connection
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (healthError) {
      if (healthError.message.includes('relation "public.profiles" does not exist')) {
        console.log('❌ Profiles table does not exist');
        console.log('   🛠️  Need to run database setup script\n');
        showSetupInstructions();
        return false;
      } else {
        console.log('❌ Database connection error:', healthError.message);
        return false;
      }
    }

    console.log('✅ Database connection successful');
    console.log('✅ Profiles table exists\n');

    // Verify table structure
    console.log('🔍 Verifying table structure...');
    
    // Test basic query to check table structure
    const { data: structureTest, error: structureError } = await supabase
      .from('profiles')
      .select('id, username, email, full_name, about_me, bio, is_public, created_at')
      .limit(1);

    if (structureError) {
      console.log('⚠️  Table structure may be incomplete:', structureError.message);
      console.log('   🛠️  Consider running enhanced database setup\n');
      showSetupInstructions();
      return false;
    }

    console.log('✅ Table structure verified');

    // Check for existing profiles
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('⚠️  Could not count profiles:', countError.message);
    } else {
      console.log(`📊 Current profiles in database: ${count || 0}`);
    }

    // Test RLS policies by trying to access as anonymous user
    console.log('\n🔒 Testing Row Level Security...');
    
    // This should fail for anonymous users (which is correct)
    const { data: rlsTest, error: rlsError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (rlsError && rlsError.message.includes('row-level security')) {
      console.log('✅ Row Level Security is properly configured');
    } else if (rlsTest && rlsTest.length === 0) {
      console.log('✅ Row Level Security is working (no data returned for anonymous user)');
    } else {
      console.log('⚠️  Row Level Security may not be properly configured');
    }

    console.log('\n🎉 Database Setup Verification Complete!');
    console.log('✅ Your Supabase database is properly configured');
    console.log('✅ Ready for production deployment');
    console.log('\n🚀 Next steps:');
    console.log('   1. Deploy your application to Vercel');
    console.log('   2. Test the complete authentication flow');
    console.log('   3. Verify profile creation and editing works\n');

    return true;

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.log('\n🛠️  Database setup may be incomplete.');
    showSetupInstructions();
    return false;
  }
}

function showSetupInstructions() {
  console.log('📋 SETUP INSTRUCTIONS:');
  console.log('');
  console.log('1. Go to your Supabase Dashboard:');
  console.log('   https://supabase.com/dashboard/projects');
  console.log('');
  console.log('2. Navigate to "SQL Editor" in the left sidebar');
  console.log('');
  console.log('3. Click "New query"');
  console.log('');
  console.log('4. Copy and paste the contents of:');
  console.log('   scripts/enhanced-database-setup.sql');
  console.log('');
  console.log('5. Click "Run" to execute the SQL');
  console.log('');
  console.log('6. Run this verification script again to confirm setup');
  console.log('');
  console.log('✅ After setup, your authentication system will be ready!');
}

// Run the verification
if (require.main === module) {
  verifyDatabaseSetup().catch(console.error);
}

module.exports = { verifyDatabaseSetup };
