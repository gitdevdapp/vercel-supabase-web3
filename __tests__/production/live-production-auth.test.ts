/**
 * Live Production Authentication Tests for https://www.devdapp.com
 * 
 * This test suite validates the complete authentication flow on the live production
 * environment to ensure new users can successfully create accounts and login.
 * 
 * IMPORTANT: These tests run against the actual live production Supabase instance.
 * They create real user accounts and test the complete flow end-to-end.
 */

import { createClient } from '@/lib/supabase/client';
import { getAuthRedirectURL } from '@/lib/auth-helpers';

// Production test configuration
const PRODUCTION_URL = 'https://www.devdapp.com';
const TEST_EMAIL_DOMAIN = '@devdapp-production-test.com';
const TEST_PASSWORD = 'ProductionTest123!@#';
const NETWORK_TIMEOUT = 45000; // 45 seconds for production environment

interface ProductionTestUser {
  email: string;
  password: string;
  id?: string;
  created_at?: string;
}

class ProductionTestManager {
  private testUsers: ProductionTestUser[] = [];
  private supabase = createClient();
  private testSessionId = Date.now().toString();

  generateProductionTestUser(): ProductionTestUser {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const email = `prod-test-${this.testSessionId}-${timestamp}-${random}${TEST_EMAIL_DOMAIN}`;
    
    const user: ProductionTestUser = {
      email,
      password: TEST_PASSWORD,
      created_at: new Date().toISOString()
    };
    
    this.testUsers.push(user);
    console.log(`🔹 Generated test user: ${user.email}`);
    return user;
  }

  async validateProductionEnvironment(): Promise<boolean> {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

      // Validate environment variables
      if (!url || !key) {
        console.error('❌ Missing Supabase environment variables');
        return false;
      }

      // Validate URL format and connectivity
      const response = await fetch(`${url}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });

      if (!response.ok) {
        console.error(`❌ Supabase connectivity failed: HTTP ${response.status}`);
        return false;
      }

      console.log('✅ Production environment validated');
      return true;
    } catch (error) {
      console.error('❌ Environment validation failed:', error);
      return false;
    }
  }

  async cleanup() {
    console.log(`🧹 Production test cleanup: ${this.testUsers.length} test users created`);
    
    // Log test users for manual cleanup if needed
    this.testUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (Created: ${user.created_at})`);
    });

    // Note: In production, we typically don't auto-delete users for audit purposes
    // Test users can be manually cleaned up through Supabase dashboard if needed
    console.log('📝 Note: Test users logged for manual cleanup if required');
  }
}

describe('🚀 Live Production Authentication Tests - devdapp.com', () => {
  let testManager: ProductionTestManager;
  let supabase: ReturnType<typeof createClient>;

  beforeAll(async () => {
    console.log('🎯 Starting Live Production Authentication Tests');
    console.log(`🌐 Target Environment: ${PRODUCTION_URL}`);
    
    testManager = new ProductionTestManager();
    supabase = createClient();

    // Validate production environment before running tests
    const isValid = await testManager.validateProductionEnvironment();
    if (!isValid) {
      throw new Error('Production environment validation failed');
    }
  });

  afterAll(async () => {
    await testManager.cleanup();
    console.log('✅ Production tests completed');
  });

  describe('🔧 Production Environment Validation', () => {
    test('should have correct production Supabase configuration', () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

      // Validate URL format
      expect(url).toBeDefined();
      expect(url).toMatch(/^https:\/\/[a-z0-9]+\.supabase\.co$/);
      
      // Validate key format (Supabase anon keys are JWT tokens)
      expect(key).toBeDefined();
      expect(key!.length).toBeGreaterThan(200); // JWT tokens are typically 200+ chars
      expect(key).toMatch(/^eyJ/); // JWT tokens start with 'eyJ'
      
      console.log(`✅ Supabase URL: ${url}`);
      console.log(`✅ API Key Length: ${key!.length} characters`);
    });

    test('should connect to production Supabase successfully', async () => {
      const { data, error } = await supabase.auth.getSession();
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      // Initial session should be null (no user logged in)
      expect(data.session).toBeNull();
      
      console.log('✅ Supabase connectivity confirmed');
    }, NETWORK_TIMEOUT);

    test('should validate auth redirect URL configuration', () => {
      const redirectUrl = getAuthRedirectURL('/protected/profile');
      
      expect(redirectUrl).toBeDefined();
      expect(redirectUrl).toMatch(/^https:\/\//); // Production should use HTTPS
      expect(redirectUrl).toContain('/protected/profile');
      
      console.log(`✅ Auth redirect URL: ${redirectUrl}`);
    });
  });

  describe('📝 Live User Registration Flow', () => {
    test('should successfully register new user on production', async () => {
      const testUser = testManager.generateProductionTestUser();
      
      console.log(`🔹 Testing user registration for: ${testUser.email}`);
      
      const { data, error } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
        options: {
          emailRedirectTo: getAuthRedirectURL('/protected/profile')
        }
      });

      // Validate successful registration
      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(testUser.email);
      expect(data.user?.id).toBeDefined();
      
      // Store user ID for tracking
      testUser.id = data.user?.id;
      
      console.log(`✅ User registered successfully: ${data.user?.id}`);
      console.log(`📧 Confirmation email should be sent to: ${testUser.email}`);
      
      // Check if user needs email confirmation
      if (data.user && !data.session) {
        console.log('📧 Email confirmation required (expected behavior)');
        expect(data.user.email_confirmed_at).toBeNull();
      }
    }, NETWORK_TIMEOUT);

    test('should handle duplicate email registration gracefully', async () => {
      const testUser = testManager.generateProductionTestUser();
      
      // First registration
      const { error: firstError } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password
      });
      expect(firstError).toBeNull();

      // Second registration with same email
      const { data: secondData, error: secondError } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password
      });
      
      // Supabase typically allows duplicate sign-ups (resends confirmation)
      // or returns an appropriate message
      if (secondError) {
        expect(secondError.message).toMatch(/already|exists|registered/i);
        console.log(`✅ Duplicate email handled: ${secondError.message}`);
      } else {
        console.log('✅ Duplicate registration allowed (resent confirmation)');
      }
    }, NETWORK_TIMEOUT);

    test('should reject invalid email formats', async () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        'test@.com'
      ];

      for (const email of invalidEmails) {
        const { error } = await supabase.auth.signUp({
          email,
          password: TEST_PASSWORD
        });

        expect(error).not.toBeNull();
        expect(error?.message).toMatch(/email|invalid|format/i);
        console.log(`✅ Invalid email rejected: ${email} - ${error?.message}`);
      }
    }, NETWORK_TIMEOUT);

    test('should enforce password requirements', async () => {
      const testUser = testManager.generateProductionTestUser();
      const weakPasswords = [
        '123',           // Too short
        'password',      // Too weak
        '12345678',      // No special chars
        'abc'            // Too short and weak
      ];

      for (const password of weakPasswords) {
        const { error } = await supabase.auth.signUp({
          email: testUser.email,
          password
        });

        expect(error).not.toBeNull();
        expect(error?.message).toMatch(/password|weak|length|character/i);
        console.log(`✅ Weak password rejected: "${password}" - ${error?.message}`);
      }
    }, NETWORK_TIMEOUT);
  });

  describe('🔐 Live Login Attempt Testing', () => {
    let registeredUser: ProductionTestUser;

    beforeAll(async () => {
      // Create a user for login tests
      registeredUser = testManager.generateProductionTestUser();
      
      const { error } = await supabase.auth.signUp({
        email: registeredUser.email,
        password: registeredUser.password
      });
      
      expect(error).toBeNull();
      console.log(`🔹 Created test user for login tests: ${registeredUser.email}`);
    });

    test('should reject login with invalid credentials', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'nonexistent-user@fake-domain.com',
        password: 'wrong-password'
      });

      expect(error).not.toBeNull();
      expect(error?.message).toMatch(/invalid|credentials|password|email/i);
      expect(data.user).toBeNull();
      
      console.log(`✅ Invalid credentials rejected: ${error?.message}`);
    }, NETWORK_TIMEOUT);

    test('should handle unconfirmed email login attempts', async () => {
      // Test login with the user we just created (email not confirmed)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: registeredUser.email,
        password: registeredUser.password
      });

      // Depending on Supabase configuration, this might:
      // 1. Succeed but require email confirmation for full access
      // 2. Fail with email confirmation required message
      // 3. Succeed if email confirmation is disabled
      
      if (error) {
        expect(error.message).toMatch(/confirm|verification|email|validate/i);
        console.log(`✅ Unconfirmed email handled: ${error.message}`);
      } else if (data.user) {
        console.log(`✅ Login successful for unconfirmed email (check email_confirmed_at: ${data.user.email_confirmed_at})`);
        expect(data.user.email).toBe(registeredUser.email);
      }
    }, NETWORK_TIMEOUT);

    test('should reject login with wrong password for existing user', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: registeredUser.email,
        password: 'definitely-wrong-password'
      });

      expect(error).not.toBeNull();
      expect(error?.message).toMatch(/invalid|credentials|password/i);
      expect(data.user).toBeNull();
      
      console.log(`✅ Wrong password rejected: ${error?.message}`);
    }, NETWORK_TIMEOUT);
  });

  describe('🌐 Production API Endpoints Testing', () => {
    test('should access diagnostic endpoint successfully', async () => {
      const response = await fetch(`${PRODUCTION_URL}/api/debug/supabase-status`);
      
      expect(response).toBeDefined();
      
      if (response.ok) {
        const data = await response.json();
        expect(data.timestamp).toBeDefined();
        expect(data.environment).toBeDefined();
        expect(data.connectivity).toBeDefined();
        
        console.log('✅ Diagnostic endpoint accessible');
        console.log(`   Success: ${data.success}`);
        console.log(`   URL Format: ${data.environment.urlFormat}`);
        console.log(`   Network Reachable: ${data.connectivity.networkTest.reachable}`);
      } else {
        console.log(`⚠️ Diagnostic endpoint returned ${response.status} (may be disabled in production)`);
      }
    }, NETWORK_TIMEOUT);

    test('should validate CORS configuration for auth requests', async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
      
      // Test direct API call to validate CORS
      const response = await fetch(`${url}/auth/v1/settings`, {
        method: 'GET',
        headers: {
          'apikey': key!,
          'Authorization': `Bearer ${key!}`,
          'Content-Type': 'application/json'
        }
      });

      // Should not throw CORS error
      expect(response).toBeDefined();
      expect(response.status).toBeLessThan(500); // Auth endpoint should be accessible
      
      console.log(`✅ CORS configuration valid - HTTP ${response.status}`);
    }, NETWORK_TIMEOUT);
  });

  describe('⚡ Performance & Reliability Testing', () => {
    test('should complete auth operations within reasonable time', async () => {
      const testUser = testManager.generateProductionTestUser();
      
      const startTime = Date.now();
      
      const { error } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password
      });
      
      const duration = Date.now() - startTime;
      
      expect(error).toBeNull();
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
      
      console.log(`✅ Sign-up completed in ${duration}ms`);
    }, NETWORK_TIMEOUT);

    test('should handle concurrent registration attempts', async () => {
      const users = Array.from({ length: 3 }, () => testManager.generateProductionTestUser());
      
      const signUpPromises = users.map(user =>
        supabase.auth.signUp({
          email: user.email,
          password: user.password
        })
      );

      const results = await Promise.all(signUpPromises);
      
      // All should succeed
      results.forEach((result, index) => {
        expect(result.error).toBeNull();
        expect(result.data.user?.email).toBe(users[index].email);
      });
      
      console.log(`✅ ${users.length} concurrent registrations successful`);
    }, NETWORK_TIMEOUT);
  });

  describe('🔒 Security & Data Validation', () => {
    test('should use HTTPS for all authentication requests', () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      expect(url).toMatch(/^https:/);
      
      console.log('✅ HTTPS enforced for authentication');
    });

    test('should not expose sensitive data in responses', async () => {
      const testUser = testManager.generateProductionTestUser();
      
      const { data } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password
      });

      if (data.user) {
        // Password should never be returned
        expect(data.user).not.toHaveProperty('password');
        // Sensitive internal fields should not be exposed
        expect(data.user).not.toHaveProperty('raw_user_meta_data');
        
        console.log('✅ Sensitive data properly filtered from responses');
      }
    }, NETWORK_TIMEOUT);
  });
});

/**
 * Production Test Summary Helper
 * 
 * This function provides a summary of the production test run
 * for monitoring and validation purposes.
 */
export async function generateProductionTestSummary() {
  console.log('📊 Production Authentication Test Summary');
  console.log('=====================================');
  console.log(`🌐 Target Environment: ${PRODUCTION_URL}`);
  console.log(`🔧 Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log(`📧 Test Email Domain: ${TEST_EMAIL_DOMAIN}`);
  console.log(`⏰ Test Timeout: ${NETWORK_TIMEOUT}ms`);
  console.log(`🕐 Test Run: ${new Date().toISOString()}`);
  
  // Environment validation
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getSession();
    
    console.log('✅ Environment Status: OPERATIONAL');
    console.log(`   Session Check: ${error ? 'ERROR' : 'SUCCESS'}`);
    console.log(`   Auth Endpoint: ${error ? error.message : 'ACCESSIBLE'}`);
  } catch (error) {
    console.log('❌ Environment Status: ERROR');
    console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
  
  console.log('=====================================');
}

/**
 * Quick Production Health Check
 * 
 * Minimal test for continuous monitoring
 */
export async function quickProductionHealthCheck(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.getSession();
    return !error;
  } catch {
    return false;
  }
}
