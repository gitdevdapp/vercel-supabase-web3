#!/usr/bin/env node

/**
 * Database Setup Script for Supabase
 *
 * This script will help you set up the profiles table in Supabase.
 * Make sure your environment variables are set up before running this script.
 *
 * Usage:
 * 1. Set up your .env.local file with Supabase credentials
 * 2. Run: npm run setup-db
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  // Check if environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Environment variables not found!');
    console.log('');
    console.log('📋 MANUAL SETUP INSTRUCTIONS:');
    console.log('');
    console.log('1. Go to https://supabase.com and open your project dashboard');
    console.log('2. Navigate to "SQL Editor" in the left sidebar');
    console.log('3. Click "New query"');
    console.log('4. Copy and paste the SQL below:');
    console.log('');
    console.log('='.repeat(60));

    // Read and display the SQL file
    const sqlPath = path.join(__dirname, '..', 'docs', 'profile', 'profile-setup.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log(sqlContent);

    console.log('='.repeat(60));
    console.log('');
    console.log('5. Click "Run" to execute the SQL');
    console.log('6. Verify the profiles table was created in "Table Editor"');
    console.log('');
    console.log('✅ After running the SQL, your profile system will be ready!');
    return;
  }

  console.log('🚀 Setting up Supabase database programmatically...');
  console.log('⚠️  Note: Programmatic SQL execution has limitations in Supabase.');
  console.log('   For best results, use the manual method above.');
  console.log('');

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test connection
    const { data, error: testError } = await supabase.from('profiles').select('count').limit(1);
    if (testError && !testError.message.includes('relation "public.profiles" does not exist')) {
      throw testError;
    }

    console.log('✅ Connected to Supabase successfully');

    if (data && data.length > 0) {
      console.log('ℹ️  Profiles table might already exist');
    } else {
      console.log('ℹ️  Profiles table needs to be created');
    }

    console.log('');
    console.log('📋 Please use the manual SQL setup method above for reliable results.');

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.log('');
    console.log('📋 Please use the manual SQL setup method shown above.');
  }
}

// Run the setup
setupDatabase();
