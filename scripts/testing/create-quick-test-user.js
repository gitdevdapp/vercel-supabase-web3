#!/usr/bin/env node

/**
 * Quick Test User Creator
 * Creates a user and auto-confirms them for immediate testing
 */

const { createClient } = require('@supabase/supabase-js');

async function createTestUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables');
    console.error('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  console.log('🔧 Creating test user...\n');
  console.log(`📧 Email: ${testEmail}`);
  console.log(`🔐 Password: ${testPassword}\n`);

  try {
    // Create user with auto-confirmation
    const { data, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // Auto-confirm
      user_metadata: {
        test_user: true
      }
    });

    if (error) {
      console.error('❌ Error creating user:', error);
      process.exit(1);
    }

    console.log('✅ Test user created successfully!\n');
    console.log('🌐 Log in at: http://localhost:3001/auth/login');
    console.log(`📧 Email: ${testEmail}`);
    console.log(`🔐 Password: ${testPassword}\n`);
    
    return { email: testEmail, password: testPassword };

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

createTestUser().catch(console.error);

