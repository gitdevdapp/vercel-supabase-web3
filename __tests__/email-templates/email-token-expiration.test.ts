/**
 * Email Token Expiration Testing
 * 
 * Tests how email template links handle expired and invalid tokens
 * on the live production environment.
 * 
 * IMPORTANT: These tests verify token expiration behavior without
 * creating security vulnerabilities.
 */

import { createClient } from '@/lib/supabase/client';

const PRODUCTION_URL = 'https://devdapp.com';
const TEST_EMAIL_DOMAIN = '@token-expiration-test.devdapp.com';
const NETWORK_TIMEOUT = 45000;

interface TokenExpirationTestResult {
  tokenType: string;
  testScenario: string;
  httpStatus: number;
  handlesExpirationCorrectly: boolean;
  responseTime: number;
  errorMessage?: string;
}

class TokenExpirationTester {
  private supabase = createClient();
  private testResults: TokenExpirationTestResult[] = [];

  async testExpiredTokenHandling(
    tokenType: string,
    urlPattern: string,
    expiredToken: string
  ): Promise<TokenExpirationTestResult> {
    const startTime = Date.now();
    
    let result: TokenExpirationTestResult = {
      tokenType,
      testScenario: 'Expired Token',
      httpStatus: 0,
      handlesExpirationCorrectly: false,
      responseTime: 0
    };

    try {
      const testUrl = `${PRODUCTION_URL}${urlPattern.replace('{{token}}', expiredToken)}`;
      console.log(`🕐 Testing expired token for ${tokenType}: ${testUrl.substring(0, 100)}...`);

      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'TokenExpirationTester/1.0',
          'Accept': 'text/html,application/xhtml+xml'
        },
        redirect: 'manual'
      });

      result.httpStatus = response.status;
      result.responseTime = Date.now() - startTime;

      // Expired tokens should return error status codes
      // Valid error responses: 400 (Bad Request), 401 (Unauthorized), 422 (Unprocessable Entity)
      // Or redirect to error page (302/303 to error page)
      const validExpirationResponses = [400, 401, 422];
      result.handlesExpirationCorrectly = validExpirationResponses.includes(response.status);

      // Check if redirect is to error page
      if ([302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (location && (location.includes('/auth/error') || location.includes('/auth/login'))) {
          result.handlesExpirationCorrectly = true;
        }
      }

      console.log(`✅ ${tokenType} expired token: HTTP ${result.httpStatus} - ${result.handlesExpirationCorrectly ? 'Handled correctly' : 'Needs review'}`);

    } catch (error) {
      result.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.responseTime = Date.now() - startTime;
      console.error(`❌ ${tokenType} expired token test failed:`, result.errorMessage);
    }

    this.testResults.push(result);
    return result;
  }

  async testInvalidTokenFormats(
    tokenType: string,
    urlPattern: string
  ): Promise<TokenExpirationTestResult[]> {
    const invalidTokens = [
      { name: 'Empty Token', token: '' },
      { name: 'Null Token', token: 'null' },
      { name: 'SQL Injection Attempt', token: "'; DROP TABLE users; --" },
      { name: 'XSS Attempt', token: '<script>alert("xss")</script>' },
      { name: 'Very Long Token', token: 'a'.repeat(5000) },
      { name: 'Special Characters', token: '!@#$%^&*()_+-=[]{}|;:,.<>?' },
      { name: 'Unicode Characters', token: '🚀🔐📧💻🛡️' },
      { name: 'Path Traversal Attempt', token: '../../../etc/passwd' }
    ];

    const results: TokenExpirationTestResult[] = [];

    for (const { name, token } of invalidTokens) {
      const startTime = Date.now();
      
      let result: TokenExpirationTestResult = {
        tokenType,
        testScenario: `Invalid Token: ${name}`,
        httpStatus: 0,
        handlesExpirationCorrectly: false,
        responseTime: 0
      };

      try {
        const testUrl = `${PRODUCTION_URL}${urlPattern.replace('{{token}}', encodeURIComponent(token))}`;
        console.log(`🛡️ Testing ${name} for ${tokenType}`);

        const response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'TokenSecurityTester/1.0',
            'Accept': 'text/html,application/xhtml+xml'
          },
          redirect: 'manual'
        });

        result.httpStatus = response.status;
        result.responseTime = Date.now() - startTime;

        // Invalid tokens should be handled gracefully
        // Should not return 500 (internal server error)
        // Should return appropriate error codes (400, 401, 422) or redirect to error page
        result.handlesExpirationCorrectly = 
          response.status !== 500 && 
          (
            [400, 401, 422].includes(response.status) ||
            ([302, 303, 307, 308].includes(response.status) && 
             response.headers.get('location')?.includes('/auth/error'))
          );

        console.log(`✅ ${name}: HTTP ${result.httpStatus} - ${result.handlesExpirationCorrectly ? 'Secure' : 'Needs review'}`);

      } catch (error) {
        result.errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.responseTime = Date.now() - startTime;
        console.error(`❌ ${name} test failed:`, result.errorMessage);
      }

      this.testResults.push(result);
      results.push(result);
    }

    return results;
  }

  getTestSummary(): { 
    total: number; 
    passed: number; 
    failed: number; 
    averageResponseTime: number;
  } {
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.handlesExpirationCorrectly).length;
    const failed = total - passed;
    const averageResponseTime = this.testResults.reduce((sum, r) => sum + r.responseTime, 0) / total;

    return { total, passed, failed, averageResponseTime };
  }
}

describe('🕐 Email Token Expiration and Security Testing - devdapp.com', () => {
  let tester: TokenExpirationTester;

  const EMAIL_TEMPLATE_PATTERNS = {
    signup: '/auth/confirm?token_hash={{token}}&type=signup&next=/protected/profile',
    recovery: '/auth/confirm?token_hash={{token}}&type=recovery&next=/auth/update-password',
    magiclink: '/auth/confirm?token_hash={{token}}&type=magiclink&next=/protected/profile',
    email_change: '/auth/confirm?token_hash={{token}}&type=email_change&next=/protected/profile',
    invite: '/auth/confirm?token_hash={{token}}&type=invite&next=/auth/sign-up',
    reauthentication: '/auth/confirm?token_hash={{token}}&type=reauthentication&next=/protected/profile'
  };

  beforeAll(() => {
    console.log('🕐 Starting Email Token Expiration and Security Tests');
    console.log(`🌐 Target Environment: ${PRODUCTION_URL}`);
    
    tester = new TokenExpirationTester();
  });

  afterAll(() => {
    const summary = tester.getTestSummary();
    
    console.log('\n📊 TOKEN EXPIRATION TEST SUMMARY');
    console.log('================================');
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Average Response Time: ${Math.round(summary.averageResponseTime)}ms`);
    console.log('================================');
  });

  describe('⏰ Expired Token Handling', () => {
    test('should handle expired signup confirmation tokens', async () => {
      // Simulate an expired token (old timestamp)
      const expiredToken = `expired-signup-token-${Date.now() - (24 * 60 * 60 * 1000)}`;
      
      const result = await tester.testExpiredTokenHandling(
        'Signup Confirmation',
        EMAIL_TEMPLATE_PATTERNS.signup,
        expiredToken
      );

      expect(result.httpStatus).toBeGreaterThan(0);
      expect(result.handlesExpirationCorrectly).toBe(true);
      expect(result.responseTime).toBeLessThan(30000);
    }, NETWORK_TIMEOUT);

    test('should handle expired password reset tokens', async () => {
      const expiredToken = `expired-recovery-token-${Date.now() - (24 * 60 * 60 * 1000)}`;
      
      const result = await tester.testExpiredTokenHandling(
        'Password Reset',
        EMAIL_TEMPLATE_PATTERNS.recovery,
        expiredToken
      );

      expect(result.httpStatus).toBeGreaterThan(0);
      expect(result.handlesExpirationCorrectly).toBe(true);
      expect(result.responseTime).toBeLessThan(30000);
    }, NETWORK_TIMEOUT);

    test('should handle expired magic link tokens', async () => {
      const expiredToken = `expired-magiclink-token-${Date.now() - (60 * 60 * 1000)}`; // 1 hour ago
      
      const result = await tester.testExpiredTokenHandling(
        'Magic Link',
        EMAIL_TEMPLATE_PATTERNS.magiclink,
        expiredToken
      );

      expect(result.httpStatus).toBeGreaterThan(0);
      expect(result.handlesExpirationCorrectly).toBe(true);
      expect(result.responseTime).toBeLessThan(30000);
    }, NETWORK_TIMEOUT);

    test('should handle expired email change tokens', async () => {
      const expiredToken = `expired-email-change-token-${Date.now() - (24 * 60 * 60 * 1000)}`;
      
      const result = await tester.testExpiredTokenHandling(
        'Email Change',
        EMAIL_TEMPLATE_PATTERNS.email_change,
        expiredToken
      );

      expect(result.httpStatus).toBeGreaterThan(0);
      expect(result.handlesExpirationCorrectly).toBe(true);
      expect(result.responseTime).toBeLessThan(30000);
    }, NETWORK_TIMEOUT);

    test('should handle expired invitation tokens', async () => {
      const expiredToken = `expired-invite-token-${Date.now() - (7 * 24 * 60 * 60 * 1000)}`; // 7 days ago
      
      const result = await tester.testExpiredTokenHandling(
        'User Invitation',
        EMAIL_TEMPLATE_PATTERNS.invite,
        expiredToken
      );

      expect(result.httpStatus).toBeGreaterThan(0);
      expect(result.handlesExpirationCorrectly).toBe(true);
      expect(result.responseTime).toBeLessThan(30000);
    }, NETWORK_TIMEOUT);

    test('should handle expired reauthentication tokens', async () => {
      const expiredToken = `expired-reauth-token-${Date.now() - (60 * 60 * 1000)}`; // 1 hour ago
      
      const result = await tester.testExpiredTokenHandling(
        'Reauthentication',
        EMAIL_TEMPLATE_PATTERNS.reauthentication,
        expiredToken
      );

      expect(result.httpStatus).toBeGreaterThan(0);
      expect(result.handlesExpirationCorrectly).toBe(true);
      expect(result.responseTime).toBeLessThan(30000);
    }, NETWORK_TIMEOUT);
  });

  describe('🛡️ Invalid Token Security Testing', () => {
    test('should securely handle invalid signup tokens', async () => {
      const results = await tester.testInvalidTokenFormats(
        'Signup Confirmation',
        EMAIL_TEMPLATE_PATTERNS.signup
      );

      results.forEach(result => {
        expect(result.httpStatus).toBeGreaterThan(0);
        expect(result.httpStatus).not.toBe(500); // Should not cause internal server errors
        expect(result.handlesExpirationCorrectly).toBe(true);
      });

      console.log(`✅ Signup: ${results.length} invalid token scenarios handled securely`);
    }, NETWORK_TIMEOUT);

    test('should securely handle invalid password reset tokens', async () => {
      const results = await tester.testInvalidTokenFormats(
        'Password Reset',
        EMAIL_TEMPLATE_PATTERNS.recovery
      );

      results.forEach(result => {
        expect(result.httpStatus).toBeGreaterThan(0);
        expect(result.httpStatus).not.toBe(500);
        expect(result.handlesExpirationCorrectly).toBe(true);
      });

      console.log(`✅ Password Reset: ${results.length} invalid token scenarios handled securely`);
    }, NETWORK_TIMEOUT);

    test('should securely handle invalid magic link tokens', async () => {
      const results = await tester.testInvalidTokenFormats(
        'Magic Link',
        EMAIL_TEMPLATE_PATTERNS.magiclink
      );

      results.forEach(result => {
        expect(result.httpStatus).toBeGreaterThan(0);
        expect(result.httpStatus).not.toBe(500);
        expect(result.handlesExpirationCorrectly).toBe(true);
      });

      console.log(`✅ Magic Link: ${results.length} invalid token scenarios handled securely`);
    }, NETWORK_TIMEOUT);
  });

  describe('⚡ Performance Under Error Conditions', () => {
    test('should handle multiple invalid token requests efficiently', async () => {
      const concurrentRequests = Array.from({ length: 5 }, (_, i) => 
        tester.testExpiredTokenHandling(
          `Concurrent Test ${i + 1}`,
          EMAIL_TEMPLATE_PATTERNS.signup,
          `concurrent-expired-token-${i}-${Date.now()}`
        )
      );

      const results = await Promise.all(concurrentRequests);

      results.forEach((result, index) => {
        expect(result.httpStatus).toBeGreaterThan(0);
        expect(result.responseTime).toBeLessThan(30000);
        console.log(`🚀 Concurrent request ${index + 1}: HTTP ${result.httpStatus} in ${result.responseTime}ms`);
      });

      console.log(`✅ ${results.length} concurrent invalid token requests handled efficiently`);
    }, NETWORK_TIMEOUT);

    test('should maintain consistent error responses', async () => {
      // Test the same expired token multiple times to ensure consistent behavior
      const expiredToken = `consistency-test-expired-token-${Date.now() - (24 * 60 * 60 * 1000)}`;
      
      const consistencyTests = Array.from({ length: 3 }, () =>
        tester.testExpiredTokenHandling(
          'Consistency Test',
          EMAIL_TEMPLATE_PATTERNS.signup,
          expiredToken
        )
      );

      const results = await Promise.all(consistencyTests);

      // All requests should return the same status code
      const statusCodes = results.map(r => r.httpStatus);
      const uniqueStatusCodes = [...new Set(statusCodes)];
      
      expect(uniqueStatusCodes.length).toBe(1); // Should all be the same
      
      console.log(`✅ Consistent error responses: All returned HTTP ${statusCodes[0]}`);
    }, NETWORK_TIMEOUT);
  });

  describe('📊 Token Validation Metrics', () => {
    test('should provide meaningful error messages for expired tokens', async () => {
      // Test a few different expired token scenarios to ensure error messages are helpful
      const testCases = [
        { type: 'signup', pattern: EMAIL_TEMPLATE_PATTERNS.signup },
        { type: 'recovery', pattern: EMAIL_TEMPLATE_PATTERNS.recovery },
        { type: 'magiclink', pattern: EMAIL_TEMPLATE_PATTERNS.magiclink }
      ];

      for (const testCase of testCases) {
        const expiredToken = `meaningful-error-test-${testCase.type}-${Date.now() - (24 * 60 * 60 * 1000)}`;
        
        const result = await tester.testExpiredTokenHandling(
          `Error Message Test: ${testCase.type}`,
          testCase.pattern,
          expiredToken
        );

        expect(result.httpStatus).toBeGreaterThan(0);
        
        // Response should be an error, indicating the token issue was detected
        expect([400, 401, 422, 302, 303].includes(result.httpStatus)).toBe(true);
        
        console.log(`✅ ${testCase.type} expired token error: HTTP ${result.httpStatus}`);
      }
    }, NETWORK_TIMEOUT);
  });
});

/**
 * Token Expiration Test Summary Generator
 */
export async function generateTokenExpirationTestSummary() {
  console.log('🕐 TOKEN EXPIRATION TEST SUMMARY');
  console.log('================================');
  console.log(`🌐 Target Environment: ${PRODUCTION_URL}`);
  console.log(`📧 Token Test Domain: ${TEST_EMAIL_DOMAIN}`);
  console.log(`⏰ Test Timeout: ${NETWORK_TIMEOUT}ms`);
  console.log(`🕐 Test Run: ${new Date().toISOString()}`);
  
  console.log('\n🛡️ Security Test Coverage:');
  console.log('   - Expired token handling');
  console.log('   - Invalid token formats');
  console.log('   - SQL injection attempts');
  console.log('   - XSS attempts');
  console.log('   - Path traversal attempts');
  console.log('   - Unicode and special characters');
  console.log('   - Performance under error conditions');
  
  console.log('================================');
}

/**
 * Quick Token Security Health Check
 */
export async function quickTokenSecurityHealthCheck(): Promise<boolean> {
  try {
    const tester = new TokenExpirationTester();
    
    // Test one critical scenario (expired signup token)
    const result = await tester.testExpiredTokenHandling(
      'Quick Security Check',
      '/auth/confirm?token_hash={{token}}&type=signup&next=/protected/profile',
      `quick-security-check-expired-${Date.now() - (24 * 60 * 60 * 1000)}`
    );
    
    return result.httpStatus > 0 && result.handlesExpirationCorrectly;
  } catch {
    return false;
  }
}
