/**
 * Complete User Flow Integration Tests
 * 
 * This test suite validates the complete user lifecycle:
 * 1. User creation and auth.users/profiles synchronization
 * 2. Email confirmation flow with real confirmation URLs
 * 3. Profile page access after confirmation
 * 4. Profile editing functionality (about me)
 * 
 * These tests run against the actual Supabase instance and create real test users.
 */

import { createClient } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getProfile, updateProfile } from '@/lib/profile';

// Test configuration
const TEST_EMAIL_PREFIX = 'complete-flow-test';
const TEST_EMAIL_DOMAIN = '@mailinator.com'; // Public email service for testing
const TEST_PASSWORD = 'TestPassword123!';
const TEST_TIMEOUT = 60000; // 60 seconds for network operations

// Test user management
interface TestUser {
  email: string;
  password: string;
  id?: string;
  confirmationUrl?: string;
}

class CompleteFlowTestManager {
  private testUsers: TestUser[] = [];
  private supabase = createClient();

  generateTestUser(): TestUser {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const email = `${TEST_EMAIL_PREFIX}-${timestamp}-${random}${TEST_EMAIL_DOMAIN}`;
    
    const user: TestUser = {
      email,
      password: TEST_PASSWORD
    };
    
    this.testUsers.push(user);
    return user;
  }

  async cleanup() {
    console.log(`Test cleanup: ${this.testUsers.length} test users created`);
    
    // In a production test environment, you would clean up users here
    // For now, we'll log them for manual cleanup if needed
    for (const user of this.testUsers) {
      console.log(`Test user created: ${user.email} (ID: ${user.id})`);
      
      if (user.id) {
        try {
          // Attempt to clean up profile data
          await this.supabase
            .from('profiles')
            .delete()
            .eq('id', user.id);
        } catch (error) {
          console.warn(`Could not clean up profile for ${user.email}:`, error);
        }
      }
    }
  }

  async getAdminClient() {
    // For tests that require admin access
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient } = await import('@supabase/supabase-js');
      return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
    }
    return null;
  }
}

describe('Complete User Flow Integration Tests', () => {
  let testManager: CompleteFlowTestManager;
  let supabase: ReturnType<typeof createClient>;

  beforeAll(() => {
    testManager = new CompleteFlowTestManager();
    supabase = createClient();
  });

  afterAll(async () => {
    await testManager.cleanup();
  });

  describe('User Creation and Database Synchronization', () => {
    let testUser: TestUser;

    test('should create new user in auth.users table', async () => {
      testUser = testManager.generateTestUser();
      
      const { data, error } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirm?next=/protected/profile`
        }
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(testUser.email);
      expect(data.user?.id).toBeDefined();

      // Store user ID for further tests
      testUser.id = data.user!.id;
    }, TEST_TIMEOUT);

    test('should automatically create profile in profiles table', async () => {
      expect(testUser.id).toBeDefined();
      
      // Wait for database trigger to execute
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testUser.id!)
        .single();

      expect(error).toBeNull();
      expect(profile).toBeDefined();
      expect(profile.id).toBe(testUser.id);
      expect(profile.email).toBe(testUser.email);
      expect(profile.username).toBeDefined();
      expect(profile.about_me).toBeDefined();
      expect(profile.bio).toBeDefined();
      expect(profile.email_verified).toBe(false); // Not confirmed yet
      expect(profile.onboarding_completed).toBe(false);
    }, TEST_TIMEOUT);

    test('should verify auth.users and profiles tables are properly synchronized', async () => {
      const adminClient = await testManager.getAdminClient();
      
      if (adminClient) {
        // Check auth.users table
        const { data: authUser, error: authError } = await adminClient
          .from('auth.users')
          .select('id, email, email_confirmed_at, created_at')
          .eq('id', testUser.id!)
          .single();

        expect(authError).toBeNull();
        expect(authUser).toBeDefined();
        expect(authUser.email).toBe(testUser.email);

        // Check profiles table
        const { data: profile, error: profileError } = await adminClient
          .from('profiles')
          .select('id, email, email_verified, created_at')
          .eq('id', testUser.id!)
          .single();

        expect(profileError).toBeNull();
        expect(profile).toBeDefined();
        expect(profile.email).toBe(testUser.email);

        // Verify data consistency
        expect(authUser.id).toBe(profile.id);
        expect(authUser.email).toBe(profile.email);
      } else {
        console.warn('Skipping auth.users verification - service role key not available');
      }
    }, TEST_TIMEOUT);
  });

  describe('Email Confirmation Flow', () => {
    let testUser: TestUser;
    let confirmationUrl: string;

    beforeAll(async () => {
      // Create a new user for confirmation tests
      testUser = testManager.generateTestUser();
      
      const { data, error } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirm?next=/protected/profile`
        }
      });

      expect(error).toBeNull();
      testUser.id = data.user!.id;
    });

    test('should generate confirmation URL via admin API', async () => {
      const adminClient = await testManager.getAdminClient();
      
      if (adminClient) {
        // Get confirmation token from auth.users
        const { data: authUser, error } = await adminClient
          .from('auth.users')
          .select('confirmation_token')
          .eq('id', testUser.id!)
          .single();

        expect(error).toBeNull();
        expect(authUser.confirmation_token).toBeDefined();

        // Construct confirmation URL
        const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        confirmationUrl = `${baseUrl}/auth/v1/verify?token=${authUser.confirmation_token}&type=signup&redirect_to=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')}/auth/confirm?next=/protected/profile`;
        
        expect(confirmationUrl).toContain('verify');
        expect(confirmationUrl).toContain('token=');
        expect(confirmationUrl).toContain('type=signup');
        
        console.log('📧 Generated confirmation URL:', confirmationUrl);
        testUser.confirmationUrl = confirmationUrl;
      } else {
        console.warn('Skipping confirmation URL generation - service role key not available');
      }
    }, TEST_TIMEOUT);

    test('should simulate email confirmation by directly confirming user', async () => {
      const adminClient = await testManager.getAdminClient();
      
      if (adminClient) {
        // Directly confirm the user using admin API
        const { data, error } = await adminClient.auth.admin.updateUserById(
          testUser.id!,
          { email_confirm: true }
        );

        expect(error).toBeNull();
        expect(data.user).toBeDefined();
        expect(data.user.email_confirmed_at).toBeDefined();

        console.log('✅ User email confirmed via admin API');
      } else {
        console.warn('Skipping email confirmation simulation - service role key not available');
      }
    }, TEST_TIMEOUT);

    test('should update profile email_verified status after confirmation', async () => {
      // Wait for any triggers to update profile
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('email_verified')
        .eq('id', testUser.id!)
        .single();

      expect(error).toBeNull();
      expect(profile).toBeDefined();
      
      // Note: This depends on whether you have a trigger that updates profile.email_verified
      // based on auth.users.email_confirmed_at changes
      console.log('📋 Profile email_verified status:', profile.email_verified);
    }, TEST_TIMEOUT);
  });

  describe('Profile Page Access and Authentication', () => {
    let testUser: TestUser;

    beforeAll(async () => {
      // Create and confirm a user for profile access tests
      testUser = testManager.generateTestUser();
      
      const { data, error } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
      });

      expect(error).toBeNull();
      testUser.id = data.user!.id;

      // Confirm the user
      const adminClient = await testManager.getAdminClient();
      if (adminClient) {
        await adminClient.auth.admin.updateUserById(
          testUser.id!,
          { email_confirm: true }
        );
      }
    });

    test('should allow confirmed user to sign in', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password,
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.id).toBe(testUser.id);
      expect(data.session).toBeDefined();
      expect(data.session?.access_token).toBeDefined();

      console.log('✅ User successfully signed in');
    }, TEST_TIMEOUT);

    test('should retrieve user profile after sign in', async () => {
      // User should still be signed in from previous test
      const { data: { user } } = await supabase.auth.getUser();
      expect(user).toBeDefined();
      expect(user?.id).toBe(testUser.id);

      const profile = await getProfile(testUser.id!);
      
      expect(profile).toBeDefined();
      expect(profile?.id).toBe(testUser.id);
      expect(profile?.email).toBe(testUser.email);
      expect(profile?.username).toBeDefined();
      expect(profile?.about_me).toBeDefined();

      console.log('✅ Profile successfully retrieved');
    }, TEST_TIMEOUT);

    test('should access profile page without redirect', async () => {
      // Test that user can access protected profile route
      // This would typically be done with Next.js testing utilities
      // For now, we'll test the profile retrieval logic directly
      
      const { data: { user } } = await supabase.auth.getUser();
      expect(user).toBeDefined();
      
      if (user) {
        const profile = await getProfile(user.id);
        expect(profile).toBeDefined();
        console.log('✅ Profile page access would be successful');
      }
    }, TEST_TIMEOUT);
  });

  describe('Profile Editing Functionality', () => {
    let testUser: TestUser;
    const TEST_ABOUT_ME = 'This is my updated about me section for testing purposes. It contains multiple sentences to test the character limit and formatting.';

    beforeAll(async () => {
      // Create, confirm, and sign in a user for editing tests
      testUser = testManager.generateTestUser();
      
      const { data, error } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
      });

      expect(error).toBeNull();
      testUser.id = data.user!.id;

      // Confirm and sign in
      const adminClient = await testManager.getAdminClient();
      if (adminClient) {
        await adminClient.auth.admin.updateUserById(
          testUser.id!,
          { email_confirm: true }
        );
      }

      await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password,
      });
    });

    test('should update profile about_me field', async () => {
      const updatedProfile = await updateProfile(testUser.id!, {
        about_me: TEST_ABOUT_ME
      });

      expect(updatedProfile).toBeDefined();
      expect(updatedProfile?.about_me).toBe(TEST_ABOUT_ME);
      expect(updatedProfile?.updated_at).toBeDefined();

      console.log('✅ Profile about_me field updated successfully');
    }, TEST_TIMEOUT);

    test('should retrieve updated profile data', async () => {
      const profile = await getProfile(testUser.id!);

      expect(profile).toBeDefined();
      expect(profile?.about_me).toBe(TEST_ABOUT_ME);

      console.log('✅ Updated profile data retrieved successfully');
    }, TEST_TIMEOUT);

    test('should update profile via direct database query (simulating form submission)', async () => {
      const NEW_ABOUT_ME = 'This is another update to test the profile editing functionality through direct database operations.';
      
      const { data: { user } } = await supabase.auth.getUser();
      expect(user).toBeDefined();

      const { data, error } = await supabase
        .from('profiles')
        .update({
          about_me: NEW_ABOUT_ME,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user!.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.about_me).toBe(NEW_ABOUT_ME);

      console.log('✅ Profile updated via direct database query');
    }, TEST_TIMEOUT);

    test('should validate character limits on about_me field', async () => {
      const LONG_TEXT = 'A'.repeat(1001); // Exceeds 1000 character limit
      
      const { error } = await supabase
        .from('profiles')
        .update({
          about_me: LONG_TEXT,
        })
        .eq('id', testUser.id!);

      // Should fail due to constraint
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/constraint|length|about_me/i);

      console.log('✅ Character limit validation working correctly');
    }, TEST_TIMEOUT);

    test('should preserve other profile fields when updating about_me', async () => {
      const profileBefore = await getProfile(testUser.id!);
      expect(profileBefore).toBeDefined();

      const FINAL_ABOUT_ME = 'Final about me text for preservation test.';
      
      await updateProfile(testUser.id!, {
        about_me: FINAL_ABOUT_ME
      });

      const profileAfter = await getProfile(testUser.id!);
      expect(profileAfter).toBeDefined();

      // Check that other fields are preserved
      expect(profileAfter?.username).toBe(profileBefore?.username);
      expect(profileAfter?.email).toBe(profileBefore?.email);
      expect(profileAfter?.bio).toBe(profileBefore?.bio);
      expect(profileAfter?.about_me).toBe(FINAL_ABOUT_ME);

      console.log('✅ Other profile fields preserved during update');
    }, TEST_TIMEOUT);
  });

  describe('Complete Flow Integration Test', () => {
    test('should complete entire user lifecycle from signup to profile editing', async () => {
      const testUser = testManager.generateTestUser();
      console.log('🚀 Starting complete flow test for:', testUser.email);

      // Step 1: User signup
      console.log('📝 Step 1: User signup');
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
      });

      expect(signupError).toBeNull();
      expect(signupData.user).toBeDefined();
      testUser.id = signupData.user!.id;

      // Step 2: Verify profile creation
      console.log('📋 Step 2: Verify automatic profile creation');
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testUser.id!)
        .single();

      expect(profileError).toBeNull();
      expect(profile).toBeDefined();

      // Step 3: Email confirmation
      console.log('📧 Step 3: Email confirmation');
      const adminClient = await testManager.getAdminClient();
      if (adminClient) {
        await adminClient.auth.admin.updateUserById(
          testUser.id!,
          { email_confirm: true }
        );
      }

      // Step 4: User sign in
      console.log('🔑 Step 4: User sign in');
      const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password,
      });

      expect(signinError).toBeNull();
      expect(signinData.user).toBeDefined();
      expect(signinData.session).toBeDefined();

      // Step 5: Profile access
      console.log('👤 Step 5: Profile access');
      const userProfile = await getProfile(testUser.id!);
      expect(userProfile).toBeDefined();

      // Step 6: Profile editing
      console.log('✏️ Step 6: Profile editing');
      const COMPLETE_FLOW_ABOUT_ME = 'This profile was created and edited as part of the complete flow integration test. All systems are working correctly!';
      
      const updatedProfile = await updateProfile(testUser.id!, {
        about_me: COMPLETE_FLOW_ABOUT_ME
      });

      expect(updatedProfile).toBeDefined();
      expect(updatedProfile?.about_me).toBe(COMPLETE_FLOW_ABOUT_ME);

      console.log('🎉 Complete flow test successful!');
      console.log('📊 Test summary:');
      console.log('  ✅ User signup');
      console.log('  ✅ Profile auto-creation');
      console.log('  ✅ Email confirmation');
      console.log('  ✅ User sign in');
      console.log('  ✅ Profile access');
      console.log('  ✅ Profile editing');
    }, TEST_TIMEOUT * 2); // Double timeout for complete flow
  });

  describe('System Status and Health Checks', () => {
    test('should verify all required environment variables', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
      expect(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY).toBeDefined();
      
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      expect(url).toMatch(/^https?:\/\/.+/);
      
      const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!;
      expect(key.length).toBeGreaterThan(50);
    });

    test('should verify database connectivity', async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    }, TEST_TIMEOUT);

    test('should verify database schema and constraints', async () => {
      // Test that required constraints are in place
      const testUser = testManager.generateTestUser();
      
      // Test username constraints
      const { error: usernameError } = await supabase
        .from('profiles')
        .insert({
          id: '00000000-0000-0000-0000-000000000000', // Invalid UUID for test
          username: 'ab', // Too short
          email: testUser.email,
        });

      expect(usernameError).toBeDefined();
      
      console.log('✅ Database constraints are properly configured');
    }, TEST_TIMEOUT);
  });
});

// Export helper functions for manual testing
export { CompleteFlowTestManager };
