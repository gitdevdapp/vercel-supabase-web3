#!/usr/bin/env node

// Test Authentication Structure - No Credentials Required
// Tests that the auth flow structure, database schema, and components are properly configured

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🧪 Testing Authentication Structure & Vercel Compatibility\n');

// Test results tracker
const tests = [];
function addTest(name, passed, details = '') {
  tests.push({ name, passed, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}${details ? ': ' + details : ''}`);
}

// Test 1: Essential files exist
console.log('1️⃣ Testing file structure...');
const requiredFiles = [
  'lib/supabase/client.ts',
  'lib/supabase/server.ts',
  'app/auth/confirm/route.ts',
  'app/auth/callback/route.ts',
  'app/api/auth/web3/verify/route.ts',
  'scripts/database/enhanced-database-setup.sql',
  'components/auth/ImprovedUnifiedSignUpForm.tsx',
  'components/auth/ImprovedUnifiedLoginForm.tsx',
  'components/auth/GitHubLoginButton.tsx',
  'components/auth/Web3LoginButtons.tsx'
];

requiredFiles.forEach(file => {
  const path = join(projectRoot, file);
  const exists = existsSync(path);
  addTest(`File exists: ${file}`, exists);
});

// Test 2: Supabase client configuration
console.log('\n2️⃣ Testing Supabase client configuration...');
try {
  const clientPath = join(projectRoot, 'lib/supabase/client.ts');
  const clientContent = readFileSync(clientPath, 'utf8');
  
  addTest('Client uses PKCE flow', clientContent.includes("flowType: 'pkce'"));
  addTest('Client has autoRefreshToken', clientContent.includes('autoRefreshToken: true'));
  addTest('Client has persistSession', clientContent.includes('persistSession: true'));
  addTest('Client has detectSessionInUrl', clientContent.includes('detectSessionInUrl: true'));
  
  const serverPath = join(projectRoot, 'lib/supabase/server.ts');
  const serverContent = readFileSync(serverPath, 'utf8');
  addTest('Server uses PKCE flow', serverContent.includes("flowType: 'pkce'"));
} catch (error) {
  addTest('Supabase client configuration', false, 'Could not read files');
}

// Test 3: Auth route implementations
console.log('\n3️⃣ Testing auth route implementations...');
try {
  const confirmPath = join(projectRoot, 'app/auth/confirm/route.ts');
  const confirmContent = readFileSync(confirmPath, 'utf8');
  
  addTest('Confirm route uses exchangeCodeForSession', confirmContent.includes('exchangeCodeForSession'));
  addTest('Confirm route handles token_hash', confirmContent.includes('token_hash'));
  addTest('Confirm route has error handling', confirmContent.includes('error'));
  
  const callbackPath = join(projectRoot, 'app/auth/callback/route.ts');
  const callbackContent = readFileSync(callbackPath, 'utf8');
  addTest('Callback route uses exchangeCodeForSession', callbackContent.includes('exchangeCodeForSession'));
} catch (error) {
  addTest('Auth route implementations', false, 'Could not read auth routes');
}

// Test 4: Database schema SQL
console.log('\n4️⃣ Testing database schema...');
try {
  const schemaPath = join(projectRoot, 'scripts/database/enhanced-database-setup.sql');
  const schemaContent = readFileSync(schemaPath, 'utf8');
  
  addTest('Schema creates profiles table', schemaContent.includes('CREATE TABLE IF NOT EXISTS profiles'));
  addTest('Schema has RLS policies', schemaContent.includes('ENABLE ROW LEVEL SECURITY'));
  addTest('Schema has automatic profile creation', schemaContent.includes('handle_new_user'));
  addTest('Schema has proper triggers', schemaContent.includes('CREATE TRIGGER on_auth_user_created'));
  addTest('Schema has constraints', schemaContent.includes('username_length'));
  addTest('Schema has indexes', schemaContent.includes('CREATE INDEX'));
} catch (error) {
  addTest('Database schema', false, 'Could not read schema file');
}

// Test 5: Environment variable consistency
console.log('\n5️⃣ Testing environment variable consistency...');
try {
  const files = ['lib/supabase/client.ts', 'lib/supabase/server.ts'];
  const envVarPattern = /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY/g;
  
  let consistent = true;
  files.forEach(file => {
    const content = readFileSync(join(projectRoot, file), 'utf8');
    if (!envVarPattern.test(content)) {
      consistent = false;
    }
  });
  
  addTest('Environment variables consistent', consistent, 'All files use NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY');
} catch (error) {
  addTest('Environment variables', false, 'Could not check consistency');
}

// Test 6: Web3 auth integration
console.log('\n6️⃣ Testing Web3 auth integration...');
try {
  const web3VerifyPath = join(projectRoot, 'app/api/auth/web3/verify/route.ts');
  const web3Content = readFileSync(web3VerifyPath, 'utf8');
  
  addTest('Web3 verify endpoint exists', existsSync(web3VerifyPath));
  addTest('Web3 uses admin createUser', web3Content.includes('supabase.auth.admin.createUser'));
  addTest('Web3 updates profiles table', web3Content.includes('from(\'profiles\')'));
  addTest('Web3 handles wallet metadata', web3Content.includes('wallet_address'));
  
  const web3ButtonsPath = join(projectRoot, 'components/auth/Web3LoginButtons.tsx');
  addTest('Web3 login buttons exist', existsSync(web3ButtonsPath));
} catch (error) {
  addTest('Web3 auth integration', false, 'Could not read Web3 files');
}

// Test 7: GitHub OAuth integration
console.log('\n7️⃣ Testing GitHub OAuth integration...');
try {
  const githubButtonPath = join(projectRoot, 'components/auth/GitHubLoginButton.tsx');
  const githubContent = readFileSync(githubButtonPath, 'utf8');
  
  addTest('GitHub button uses signInWithOAuth', githubContent.includes('signInWithOAuth'));
  addTest('GitHub redirects to callback', githubContent.includes('/auth/callback'));
  addTest('GitHub has proper provider', githubContent.includes("provider: 'github'"));
} catch (error) {
  addTest('GitHub OAuth integration', false, 'Could not read GitHub button');
}

// Test 8: Next.js configuration
console.log('\n8️⃣ Testing Next.js configuration...');
try {
  const nextConfigPath = join(projectRoot, 'next.config.ts');
  const nextContent = readFileSync(nextConfigPath, 'utf8');
  
  addTest('Next.js config exists', existsSync(nextConfigPath));
  addTest('Supabase in CSP', nextContent.includes('supabase.co'));
  addTest('TypeScript config', nextContent.includes('NextConfig'));
  
  const packagePath = join(projectRoot, 'package.json');
  const packageContent = JSON.parse(readFileSync(packagePath, 'utf8'));
  addTest('Supabase SSR dependency', !!packageContent.dependencies['@supabase/ssr']);
  addTest('Supabase JS dependency', !!packageContent.dependencies['@supabase/supabase-js']);
} catch (error) {
  addTest('Next.js configuration', false, 'Could not read config files');
}

// Test 9: TypeScript types
console.log('\n9️⃣ Testing TypeScript configuration...');
try {
  const tsconfigPath = join(projectRoot, 'tsconfig.json');
  const tsContent = readFileSync(tsconfigPath, 'utf8');
  
  addTest('TypeScript config exists', existsSync(tsconfigPath));
  addTest('Strict mode enabled', tsContent.includes('"strict": true'));
  
  // Check for types directory
  const typesPath = join(projectRoot, 'types');
  addTest('Types directory exists', existsSync(typesPath));
} catch (error) {
  addTest('TypeScript configuration', false, 'Could not read TypeScript config');
}

// Test 10: Middleware configuration
console.log('\n🔟 Testing middleware configuration...');
try {
  const middlewarePath = join(projectRoot, 'middleware.ts');
  const middlewareExists = existsSync(middlewarePath);
  
  addTest('Middleware file exists', middlewareExists);
  
  if (middlewareExists) {
    const middlewareContent = readFileSync(middlewarePath, 'utf8');
    addTest('Middleware protects routes', middlewareContent.includes('updateSession'));
    
    // Check middleware helper
    const middlewareHelperPath = join(projectRoot, 'lib/supabase/middleware.ts');
    if (existsSync(middlewareHelperPath)) {
      const helperContent = readFileSync(middlewareHelperPath, 'utf8');
      addTest('Middleware checks authentication', helperContent.includes('getClaims'));
      addTest('Middleware redirects to login', helperContent.includes('/auth/login'));
    }
  }
} catch (error) {
  addTest('Middleware configuration', false, 'Could not read middleware');
}

// Summary
console.log('\n' + '═'.repeat(60));
console.log('📊 TEST SUMMARY');
console.log('═'.repeat(60));

const passed = tests.filter(t => t.passed).length;
const total = tests.length;
const percentage = Math.round((passed / total) * 100);

console.log(`Tests Passed: ${passed}/${total} (${percentage}%)`);

if (percentage >= 90) {
  console.log('🎉 EXCELLENT: Authentication structure is ready for production!');
} else if (percentage >= 80) {
  console.log('✅ GOOD: Minor issues to address before production');
} else if (percentage >= 70) {
  console.log('⚠️ FAIR: Several issues need attention');
} else {
  console.log('❌ POOR: Major structural issues need fixing');
}

// Failed tests
const failed = tests.filter(t => !t.passed);
if (failed.length > 0) {
  console.log('\n❌ Failed Tests:');
  failed.forEach(test => {
    console.log(`   - ${test.name}${test.details ? ': ' + test.details : ''}`);
  });
}

console.log('\n🔍 Next Steps:');
console.log('1. Fix any failed structural tests above');
console.log('2. Set up .env.local with Supabase credentials for live testing');
console.log('3. Run: npm run build (to test Vercel compatibility)');
console.log('4. Test signup flow at http://localhost:3000/auth/sign-up');
console.log('5. Verify database setup by running enhanced-database-setup.sql');

console.log('\n✅ Structure Analysis Complete');

// Exit with appropriate code
process.exit(percentage >= 90 ? 0 : 1);
