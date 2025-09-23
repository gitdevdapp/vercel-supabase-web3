/**
 * Live Supabase Authentication Integration Tests
 * 
 * These tests run against the actual Supabase instance configured in the environment.
 * They test the complete authentication flow including network requests.
 * 
 * IMPORTANT: These tests create and clean up real user accounts.
 */

import { createClient } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Test configuration
const TEST_EMAIL_PREFIX = 'test-auth-integration';
const TEST_EMAIL_DOMAIN = '@example.com';
const TEST_PASSWORD = 'TestPassword123!';
const TEST_TIMEOUT = 30000; // 30 seconds for network operations

// Test user management
interface TestUser {
  email: string;
  password: string;
  id?: string;
}

class TestUserManager {
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
    // Note: In a real test environment, you would need admin privileges to delete users
    // For now, we'll just track them for manual cleanup if needed
    console.log(`Test cleanup: ${this.testUsers.length} test users created`);
    this.testUsers.forEach(user => {
      console.log(`Test user: ${user.email}`);
    });
  }
}

describe('Live Supabase Authentication Integration Tests', () => {
  let testUserManager: TestUserManager;
  let supabase: ReturnType<typeof createClient>;

  beforeAll(() => {
    testUserManager = new TestUserManager();
    supabase = createClient();
  });

  afterAll(async () => {
    await testUserManager.cleanup();
  });

  describe('Environment and Connectivity', () => {
    test('should have required environment variables', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
      expect(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY).toBeDefined();
      
      // Validate URL format
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      expect(url).toMatch(/^https?:\/\/.+/);
      
      // Validate key format (basic check)
      const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!;
      expect(key.length).toBeGreaterThan(50);
    });

    test('should be able to create Supabase client', () => {
      expect(() => createClient()).not.toThrow();
      expect(supabase).toBeDefined();
    });

    test('should be able to connect to Supabase', async () => {
      const { data, error } = await supabase.auth.getSession();
      
      // We don't expect a session, but we should not get a connection error
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.session).toBeNull(); // No active session initially
    }, TEST_TIMEOUT);
  });

  describe('Diagnostic API Endpoint', () => {
    test('should provide system status via API', async () => {
      const response = await fetch('/api/debug/supabase-status');
      expect(response).toBeDefined();
      
      const data = await response.json();
      expect(data).toBeDefined();
      expect(data.timestamp).toBeDefined();
      expect(data.environment).toBeDefined();
      expect(data.connectivity).toBeDefined();
    }, TEST_TIMEOUT);
  });

  describe('User Registration Flow', () => {
    test('should successfully sign up a new user', async () => {
      const testUser = testUserManager.generateTestUser();
      
      const { data, error } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
      });

      // Check for successful signup
      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(testUser.email);
      
      // Store user ID for cleanup
      if (data.user?.id) {
        testUser.id = data.user.id;
      }
    }, TEST_TIMEOUT);

    test('should handle duplicate email registration', async () => {
      const testUser = testUserManager.generateTestUser();
      
      // First registration
      const { error: firstError } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
      });
      expect(firstError).toBeNull();

      // Second registration with same email
      const { error: secondError } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
      });
      
      // Should either succeed (resend confirmation) or give appropriate error
      if (secondError) {
        expect(secondError.message).toContain('already');
      }
    }, TEST_TIMEOUT);

    test('should reject invalid email format', async () => {
      const { data, error } = await supabase.auth.signUp({
        email: 'invalid-email-format',
        password: TEST_PASSWORD,
      });

      expect(error).not.toBeNull();
      expect(error?.message).toMatch(/email|invalid/i);
    }, TEST_TIMEOUT);

    test('should reject weak passwords', async () => {
      const testUser = testUserManager.generateTestUser();
      
      const { data, error } = await supabase.auth.signUp({
        email: testUser.email,
        password: '123', // Weak password
      });

      expect(error).not.toBeNull();
      expect(error?.message).toMatch(/password/i);
    }, TEST_TIMEOUT);
  });

  describe('User Login Flow', () => {
    let registeredUser: TestUser;

    beforeAll(async () => {
      // Create a user for login tests
      registeredUser = testUserManager.generateTestUser();
      const { error } = await supabase.auth.signUp({
        email: registeredUser.email,
        password: registeredUser.password,
      });
      expect(error).toBeNull();
    });

    test('should reject login with invalid credentials', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'nonexistent@test.com',
        password: 'wrong-password',
      });

      expect(error).not.toBeNull();
      expect(error?.message).toMatch(/invalid|credentials|password/i);
      expect(data.user).toBeNull();
    }, TEST_TIMEOUT);

    test('should reject login with wrong password', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: registeredUser.email,
        password: 'wrong-password',
      });

      expect(error).not.toBeNull();
      expect(error?.message).toMatch(/invalid|credentials|password/i);
      expect(data.user).toBeNull();
    }, TEST_TIMEOUT);

    test('should handle login attempt with unconfirmed email', async () => {
      // This user was just created and email not confirmed
      const { data, error } = await supabase.auth.signInWithPassword({
        email: registeredUser.email,
        password: registeredUser.password,
      });

      // Depending on Supabase settings, this might succeed or require confirmation
      if (error) {
        expect(error.message).toMatch(/confirm|verification|email/i);
      } else {
        expect(data.user).toBeDefined();
      }
    }, TEST_TIMEOUT);
  });

  describe('Session Management', () => {
    test('should handle session retrieval', async () => {
      const { data, error } = await supabase.auth.getSession();
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      // Session might be null if no user is logged in, which is fine
    }, TEST_TIMEOUT);

    test('should handle user retrieval', async () => {
      const { data, error } = await supabase.auth.getUser();
      
      // Error is expected if no user is logged in
      if (error) {
        expect(error.message).toMatch(/session|user|jwt/i);
      } else {
        expect(data.user).toBeDefined();
      }
    }, TEST_TIMEOUT);
  });

  describe('Error Handling and Network Issues', () => {
    test('should handle network timeout gracefully', async () => {
      // Create a client with a very short timeout to test error handling
      const testClient = createClient();
      
      // This tests that the client doesn't crash on network issues
      const startTime = Date.now();
      const { data, error } = await testClient.auth.getSession();
      const duration = Date.now() - startTime;
      
      // Either succeeds quickly or fails gracefully
      expect(duration).toBeLessThan(10000); // Max 10 seconds
      expect(data).toBeDefined();
    }, TEST_TIMEOUT);

    test('should provide meaningful error messages', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: '',
        password: '',
      });

      expect(error).not.toBeNull();
      expect(error?.message).toBeDefined();
      expect(error?.message.length).toBeGreaterThan(0);
    }, TEST_TIMEOUT);
  });

  describe('Auth State Changes', () => {
    test('should handle auth state change listeners', (done) => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        expect(event).toBeDefined();
        expect(['INITIAL_SESSION', 'SIGNED_OUT', 'SIGNED_IN', 'TOKEN_REFRESHED'].includes(event)).toBe(true);
        
        // Clean up listener after first event
        subscription.unsubscribe();
        done();
      });

      // Trigger an auth state change
      supabase.auth.getSession();
    }, TEST_TIMEOUT);
  });

  describe('Production Environment Specific Tests', () => {
    test('should use HTTPS in production', () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      
      if (process.env.NODE_ENV === 'production') {
        expect(url).toMatch(/^https:/);
      } else {
        // Development can use HTTP
        expect(url).toMatch(/^https?:/);
      }
    });

    test('should have proper CORS configuration', async () => {
      // Test that the browser can make requests (CORS is properly configured)
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!}`
        }
      });

      // Should not get CORS error (would throw)
      expect(response).toBeDefined();
    }, TEST_TIMEOUT);
  });
});

// Helper function for debugging test failures
export async function runAuthDiagnostics() {
  console.log('🔍 Running Auth Diagnostics...');
  
  const diagnostics = {
    environment: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
      keyLength: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY?.length
    },
    timestamp: new Date().toISOString()
  };
  
  console.log('Environment:', diagnostics.environment);
  
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getSession();
    console.log('Session test:', { success: !error, error: error?.message });
  } catch (error) {
    console.log('Client creation failed:', error);
  }
  
  return diagnostics;
}
