#!/usr/bin/env node

/**
 * Email Template Link Validation Script
 * 
 * Tests all Supabase email template links on the live production environment
 * using Node.js native fetch to avoid CORS restrictions.
 * 
 * Usage:
 *   node scripts/test-email-templates.js
 *   npm run test:email-templates:live
 */

const https = require('https');
const { URL } = require('url');

// Configuration
const PRODUCTION_URL = 'https://devdapp.com';
const TIMEOUT = 30000; // 30 seconds
const USER_AGENT = 'EmailTemplateValidator/1.0 (Node.js)';

// Email template URL patterns from the email templates guide
const EMAIL_TEMPLATE_PATTERNS = {
  'Confirm Signup': '/auth/confirm?token_hash=test-token-123&type=signup&next=/protected/profile',
  'Invite User': '/auth/confirm?token_hash=test-token-123&type=invite&next=/auth/sign-up',
  'Magic Link': '/auth/confirm?token_hash=test-token-123&type=magiclink&next=/protected/profile',
  'Change Email Address': '/auth/confirm?token_hash=test-token-123&type=email_change&next=/protected/profile',
  'Reset Password': '/auth/confirm?token_hash=test-token-123&type=recovery&next=/auth/update-password',
  'Reauthentication': '/auth/confirm?token_hash=test-token-123&type=reauthentication&next=/protected/profile'
};

class EmailTemplateValidator {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: TIMEOUT
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data.substring(0, 1000) // Limit body size for logging
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  async testEmailTemplateURL(templateName, urlPattern) {
    const startTime = Date.now();
    const testUrl = `${PRODUCTION_URL}${urlPattern}`;
    
    console.log(`🔍 Testing ${templateName}:`);
    console.log(`   URL: ${testUrl}`);

    try {
      const response = await this.makeRequest(testUrl);
      const responseTime = Date.now() - startTime;

      const result = {
        templateName,
        url: testUrl,
        statusCode: response.statusCode,
        responseTime,
        success: this.isValidResponse(response.statusCode),
        location: response.headers.location || null,
        timestamp: new Date().toISOString()
      };

      this.results.push(result);

      const status = result.success ? '✅' : '❌';
      console.log(`   ${status} HTTP ${response.statusCode} (${responseTime}ms)`);
      
      if (response.headers.location) {
        console.log(`   📍 Redirects to: ${response.headers.location}`);
      }

      if (response.statusCode >= 400) {
        console.log(`   ⚠️ Response preview: ${response.body.substring(0, 200)}...`);
      }

      return result;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const result = {
        templateName,
        url: testUrl,
        statusCode: 0,
        responseTime,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.results.push(result);

      console.log(`   ❌ Request failed: ${error.message} (${responseTime}ms)`);
      return result;
    }
  }

  isValidResponse(statusCode) {
    // Valid responses for email template URLs:
    // 200: OK (page loads successfully)
    // 302/303/307/308: Redirects (expected for auth flows)
    // 400: Bad Request (invalid token, but URL is accessible)
    // 401: Unauthorized (expired token, but URL is accessible)
    // 422: Unprocessable Entity (invalid token format, but URL is accessible)
    const validCodes = [200, 302, 303, 307, 308, 400, 401, 422];
    return validCodes.includes(statusCode);
  }

  async runAllTests() {
    console.log('🚀 Email Template Link Validation');
    console.log('=================================');
    console.log(`🌐 Target Environment: ${PRODUCTION_URL}`);
    console.log(`⏰ Timeout: ${TIMEOUT}ms`);
    console.log(`🕐 Started: ${new Date().toISOString()}`);
    console.log('=================================\n');

    // Test environment connectivity first
    console.log('🔧 Testing Environment Connectivity...');
    try {
      const envResult = await this.makeRequest(PRODUCTION_URL);
      console.log(`✅ Production environment accessible: HTTP ${envResult.statusCode}\n`);
    } catch (error) {
      console.log(`❌ Production environment unreachable: ${error.message}\n`);
      return false;
    }

    // Test each email template
    console.log('📧 Testing Email Template URLs...\n');
    
    for (const [templateName, urlPattern] of Object.entries(EMAIL_TEMPLATE_PATTERNS)) {
      await this.testEmailTemplateURL(templateName, urlPattern);
      console.log(''); // Empty line for readability
    }

    // Generate summary
    this.generateSummary();
    
    return this.isOverallSuccess();
  }

  generateSummary() {
    const totalTime = Date.now() - this.startTime;
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;
    const avgResponseTime = totalTests > 0 ? 
      Math.round(this.results.reduce((sum, r) => sum + r.responseTime, 0) / totalTests) : 0;

    console.log('\n📊 EMAIL TEMPLATE VALIDATION SUMMARY');
    console.log('=====================================');
    console.log(`🕐 Total Duration: ${totalTime}ms`);
    console.log(`📋 Total Templates: ${totalTests}`);
    console.log(`✅ Successful: ${successfulTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⚡ Average Response Time: ${avgResponseTime}ms`);
    console.log(`📈 Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);
    console.log('');

    // Detailed results
    console.log('📝 Detailed Results:');
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`   ${status} ${result.templateName}: HTTP ${result.statusCode} (${result.responseTime}ms)`);
      
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
      
      if (result.location) {
        console.log(`      Redirects to: ${result.location}`);
      }
    });

    console.log('');
    console.log('🎯 What These Results Mean:');
    console.log('   ✅ HTTP 200: Page loads successfully (ready for use)');
    console.log('   ✅ HTTP 302/303/307/308: Redirects as expected (auth flow working)');
    console.log('   ✅ HTTP 400/401/422: Invalid token handled gracefully (security working)');
    console.log('   ❌ HTTP 404/500: URL routing or server issues');
    console.log('   ❌ Network errors: Connectivity or DNS issues');
    console.log('');
    console.log('🏁 Test Completed:', new Date().toISOString());
    console.log('=====================================');
  }

  isOverallSuccess() {
    const successfulTests = this.results.filter(r => r.success).length;
    const successRate = (successfulTests / this.results.length) * 100;
    return successRate >= 100; // All tests must pass
  }

  // Export results for CI/CD integration
  exportResults() {
    return {
      timestamp: new Date().toISOString(),
      environment: 'production',
      targetUrl: PRODUCTION_URL,
      totalDuration: Date.now() - this.startTime,
      summary: {
        total: this.results.length,
        successful: this.results.filter(r => r.success).length,
        failed: this.results.filter(r => !r.success).length,
        successRate: ((this.results.filter(r => r.success).length / this.results.length) * 100).toFixed(1),
        avgResponseTime: Math.round(this.results.reduce((sum, r) => sum + r.responseTime, 0) / this.results.length)
      },
      results: this.results
    };
  }
}

// Security test scenarios
async function runSecurityTests(validator) {
  console.log('🛡️ Running Security Tests...\n');

  const securityTestCases = [
    {
      name: 'Empty Token',
      pattern: '/auth/confirm?token_hash=&type=signup&next=/protected/profile'
    },
    {
      name: 'SQL Injection Attempt', 
      pattern: '/auth/confirm?token_hash=' + encodeURIComponent("'; DROP TABLE users; --") + '&type=signup&next=/protected/profile'
    },
    {
      name: 'XSS Attempt',
      pattern: '/auth/confirm?token_hash=' + encodeURIComponent('<script>alert("xss")</script>') + '&type=signup&next=/protected/profile'
    },
    {
      name: 'Path Traversal Attempt',
      pattern: '/auth/confirm?token_hash=' + encodeURIComponent('../../../etc/passwd') + '&type=signup&next=/protected/profile'
    }
  ];

  for (const testCase of securityTestCases) {
    await validator.testEmailTemplateURL(`Security Test: ${testCase.name}`, testCase.pattern);
  }

  console.log('✅ Security tests completed\n');
}

// Main execution
async function main() {
  const validator = new EmailTemplateValidator();
  
  try {
    // Run main email template tests
    const success = await validator.runAllTests();
    
    // Run security tests
    await runSecurityTests(validator);
    
    // Export results for CI/CD if needed
    if (process.env.EXPORT_RESULTS) {
      const results = validator.exportResults();
      const fs = require('fs');
      const filename = `email-template-test-results-${Date.now()}.json`;
      fs.writeFileSync(filename, JSON.stringify(results, null, 2));
      console.log(`📄 Results exported to: ${filename}`);
    }

    // Exit with appropriate code
    process.exit(success ? 0 : 1);

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = { EmailTemplateValidator, EMAIL_TEMPLATE_PATTERNS };

// Run if executed directly
if (require.main === module) {
  main();
}
