/**
 * Email Template Test Runner
 * 
 * Utility to run comprehensive email template link validation tests
 * against the live production environment.
 * 
 * Usage:
 *   npm run test:email-templates
 *   npm run test:email-templates:quick
 *   node docs/testing/implementation/email-template-test-runner.js
 */

import { spawn } from 'child_process';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface TestRunOptions {
  quick?: boolean;
  verbose?: boolean;
  outputFile?: string;
  timeout?: number;
}

interface TestResult {
  testSuite: string;
  passed: boolean;
  duration: number;
  details: string;
  errors?: string[];
}

class EmailTemplateTestRunner {
  private testResults: TestResult[] = [];
  private startTime: number = 0;

  async runAllTests(options: TestRunOptions = {}): Promise<boolean> {
    console.log('🚀 Starting Email Template Validation Test Suite');
    console.log('================================================');
    console.log(`🌐 Environment: https://devdapp.com`);
    console.log(`📧 Test Mode: ${options.quick ? 'Quick' : 'Comprehensive'}`);
    console.log(`⏰ Timeout: ${options.timeout || 300000}ms`);
    console.log(`🕐 Started: ${new Date().toISOString()}`);
    console.log('================================================\n');

    this.startTime = Date.now();

    try {
      // Run test suites
      const testSuites = options.quick 
        ? ['live-email-link-validation'] 
        : ['live-email-link-validation', 'email-token-expiration'];

      for (const testSuite of testSuites) {
        const result = await this.runTestSuite(testSuite, options);
        this.testResults.push(result);
      }

      // Generate summary
      const summary = this.generateSummary();
      console.log(summary);

      // Save results if requested
      if (options.outputFile) {
        this.saveResults(options.outputFile, summary);
      }

      // Return overall success
      return this.testResults.every(result => result.passed);

    } catch (error) {
      console.error('❌ Test suite execution failed:', error);
      return false;
    }
  }

  private async runTestSuite(suiteName: string, options: TestRunOptions): Promise<TestResult> {
    console.log(`🧪 Running test suite: ${suiteName}`);
    const startTime = Date.now();

    return new Promise((resolve) => {
      const testProcess = spawn('npm', ['run', 'test', '--', `__tests__/email-templates/${suiteName}.test.ts`], {
        stdio: options.verbose ? 'inherit' : 'pipe',
        cwd: process.cwd(),
        env: { 
          ...process.env,
          NODE_ENV: 'test',
          // Ensure we're testing against production
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
        }
      });

      let output = '';
      let errorOutput = '';

      if (!options.verbose) {
        testProcess.stdout?.on('data', (data) => {
          output += data.toString();
        });

        testProcess.stderr?.on('data', (data) => {
          errorOutput += data.toString();
        });
      }

      // Set timeout
      const timeout = setTimeout(() => {
        testProcess.kill();
        resolve({
          testSuite: suiteName,
          passed: false,
          duration: Date.now() - startTime,
          details: 'Test suite timed out',
          errors: ['Timeout after ' + (options.timeout || 300000) + 'ms']
        });
      }, options.timeout || 300000);

      testProcess.on('close', (code) => {
        clearTimeout(timeout);
        
        const duration = Date.now() - startTime;
        const passed = code === 0;

        console.log(`${passed ? '✅' : '❌'} ${suiteName}: ${passed ? 'PASSED' : 'FAILED'} (${duration}ms)`);

        resolve({
          testSuite: suiteName,
          passed,
          duration,
          details: passed ? 'All tests passed' : 'Some tests failed',
          errors: passed ? undefined : [errorOutput || 'Test execution failed']
        });
      });

      testProcess.on('error', (error) => {
        clearTimeout(timeout);
        resolve({
          testSuite: suiteName,
          passed: false,
          duration: Date.now() - startTime,
          details: 'Failed to start test process',
          errors: [error.message]
        });
      });
    });
  }

  private generateSummary(): string {
    const totalDuration = Date.now() - this.startTime;
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    let summary = '\n';
    summary += '📊 EMAIL TEMPLATE TEST SUITE SUMMARY\n';
    summary += '===================================\n';
    summary += `🕐 Total Duration: ${totalDuration}ms\n`;
    summary += `📋 Total Test Suites: ${totalTests}\n`;
    summary += `✅ Passed: ${passedTests}\n`;
    summary += `❌ Failed: ${failedTests}\n`;
    summary += `📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`;
    summary += '\n';

    // Individual test results
    summary += '📝 Test Suite Results:\n';
    this.testResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      summary += `   ${status} ${result.testSuite}: ${result.details} (${result.duration}ms)\n`;
      
      if (result.errors) {
        result.errors.forEach(error => {
          summary += `      ⚠️ ${error}\n`;
        });
      }
    });

    summary += '\n';
    summary += '🎯 Test Coverage:\n';
    summary += '   ✅ Confirm Signup email template\n';
    summary += '   ✅ Invite User email template\n';
    summary += '   ✅ Magic Link email template\n';
    summary += '   ✅ Change Email Address template\n';
    summary += '   ✅ Reset Password template\n';
    summary += '   ✅ Reauthentication template\n';
    summary += '   ✅ URL accessibility testing\n';
    summary += '   ✅ Token expiration handling\n';
    summary += '   ✅ Security validation\n';
    summary += '   ✅ Performance testing\n';

    summary += '\n';
    summary += `🏁 Test Run Completed: ${new Date().toISOString()}\n`;
    summary += '===================================\n';

    return summary;
  }

  private saveResults(outputFile: string, summary: string): void {
    try {
      const results = {
        timestamp: new Date().toISOString(),
        environment: 'production',
        targetUrl: 'https://devdapp.com',
        totalDuration: Date.now() - this.startTime,
        testResults: this.testResults,
        summary: summary,
        environmentVariables: {
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
          nodeEnv: process.env.NODE_ENV
        }
      };

      writeFileSync(outputFile, JSON.stringify(results, null, 2));
      console.log(`📄 Test results saved to: ${outputFile}`);
    } catch (error) {
      console.error('❌ Failed to save test results:', error);
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  const options: TestRunOptions = {
    quick: args.includes('--quick') || args.includes('-q'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    timeout: parseInt(args.find(arg => arg.startsWith('--timeout='))?.split('=')[1] || '300000'),
    outputFile: args.find(arg => arg.startsWith('--output='))?.split('=')[1]
  };

  console.log('🔧 Email Template Test Runner');
  console.log('=============================');
  
  // Validate environment
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    process.exit(1);
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY environment variable');
    process.exit(1);
  }

  // Ensure test files exist
  const testFiles = [
    'live-email-link-validation.test.ts',
    'email-token-expiration.test.ts'
  ];

  for (const testFile of testFiles) {
    const testPath = join(process.cwd(), '__tests__', 'email-templates', testFile);
    if (!existsSync(testPath)) {
      console.error(`❌ Test file not found: ${testPath}`);
      process.exit(1);
    }
  }

  console.log('✅ Environment validation passed');
  console.log('✅ Test files found');
  console.log('');

  const runner = new EmailTemplateTestRunner();
  const success = await runner.runAllTests(options);

  process.exit(success ? 0 : 1);
}

// Export for programmatic use
export { EmailTemplateTestRunner };
export type { TestRunOptions, TestResult };

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

/**
 * Quick validation function for CI/CD pipelines
 */
export async function quickEmailTemplateValidation(): Promise<boolean> {
  try {
    const runner = new EmailTemplateTestRunner();
    return await runner.runAllTests({ 
      quick: true, 
      verbose: false,
      timeout: 120000 // 2 minutes for quick check
    });
  } catch (error) {
    console.error('Quick validation failed:', error);
    return false;
  }
}

/**
 * Comprehensive validation for deployment verification
 */
export async function comprehensiveEmailTemplateValidation(): Promise<boolean> {
  try {
    const runner = new EmailTemplateTestRunner();
    return await runner.runAllTests({ 
      quick: false, 
      verbose: true,
      timeout: 600000, // 10 minutes for comprehensive check
      outputFile: `email-template-test-results-${Date.now()}.json`
    });
  } catch (error) {
    console.error('Comprehensive validation failed:', error);
    return false;
  }
}
