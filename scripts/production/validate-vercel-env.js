/**
 * Vercel Environment Variables Validation Script
 * 
 * This script validates that your vercel-env-variables.txt file contains
 * all required variables with correct naming and format before uploading to Vercel.
 * 
 * Run with: node scripts/production/validate-vercel-env.js
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset}  ${msg}`),
  step: (msg) => console.log(`\n${colors.cyan}${colors.bright}=== ${msg} ===${colors.reset}`),
};

// Parse environment file
function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) return;
    
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return env;
}

// Required variables based on lib/env.ts
const REQUIRED_VARS = {
  // Supabase (Required for core functionality)
  'NEXT_PUBLIC_SUPABASE_URL': {
    type: 'url',
    required: true,
    description: 'Supabase project URL',
  },
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY': {
    type: 'string',
    required: true,
    description: 'Supabase anonymous/public key',
  },
  
  // CDP Credentials (Required for wallet features)
  'CDP_API_KEY_ID': {
    type: 'uuid',
    required: true,
    description: 'CDP API Key ID',
  },
  'CDP_API_KEY_SECRET': {
    type: 'base64',
    required: true,
    description: 'CDP API Key Secret',
  },
  'CDP_WALLET_SECRET': {
    type: 'base64',
    required: true,
    description: 'CDP Wallet Secret',
  },
  
  // Network Configuration
  'NETWORK': {
    type: 'enum',
    enum: ['base-sepolia', 'base'],
    required: true,
    description: 'Blockchain network (server-side)',
  },
  'NEXT_PUBLIC_WALLET_NETWORK': {
    type: 'enum',
    enum: ['base-sepolia', 'base'],
    required: true,
    description: 'Blockchain network (client-side)',
  },
  
  // Feature Flags
  'NEXT_PUBLIC_ENABLE_CDP_WALLETS': {
    type: 'boolean',
    required: true,
    description: 'Enable CDP wallet features',
  },
};

// Optional but recommended variables
const OPTIONAL_VARS = {
  'SUPABASE_SERVICE_ROLE_KEY': 'Service role key for admin operations',
  'OPENAI_API_KEY': 'OpenAI API key for AI features',
  'NEXT_PUBLIC_ENABLE_AI_CHAT': 'Enable AI chat features',
  'NEXT_PUBLIC_ENABLE_WEB3_AUTH': 'Enable Web3 authentication',
};

// Deprecated variable names (common mistakes)
const DEPRECATED_VARS = {
  'CDP_API_KEY_NAME': 'Use CDP_API_KEY_ID instead',
  'CDP_PRIVATE_KEY': 'Use CDP_API_KEY_SECRET instead',
};

function validateUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validateUuid(value) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

function validateBase64(value) {
  // Basic base64 check - should be long and contain base64 characters
  return value.length > 20 && /^[A-Za-z0-9+/=]+$/.test(value);
}

function validateBoolean(value) {
  return value === 'true' || value === 'false';
}

function validateEnum(value, enumValues) {
  return enumValues.includes(value);
}

async function validateVercelEnv() {
  try {
    log.step('Step 1: Reading vercel-env-variables.txt');
    
    const filePath = path.join(process.cwd(), 'vercel-env-variables.txt');
    
    if (!fs.existsSync(filePath)) {
      log.error('vercel-env-variables.txt not found in project root');
      process.exit(1);
    }
    
    const env = parseEnvFile(filePath);
    const envKeys = Object.keys(env);
    
    log.success(`Found ${envKeys.length} environment variables`);
    
    log.step('Step 2: Checking for Deprecated Variable Names');
    
    let hasDeprecated = false;
    for (const [deprecatedKey, message] of Object.entries(DEPRECATED_VARS)) {
      if (env[deprecatedKey]) {
        log.error(`Deprecated: ${deprecatedKey} - ${message}`);
        hasDeprecated = true;
      }
    }
    
    if (!hasDeprecated) {
      log.success('No deprecated variable names found');
    }
    
    log.step('Step 3: Validating Required Variables');
    
    let allValid = true;
    let validCount = 0;
    
    for (const [key, config] of Object.entries(REQUIRED_VARS)) {
      if (!env[key]) {
        log.error(`Missing required variable: ${key} (${config.description})`);
        allValid = false;
        continue;
      }
      
      const value = env[key];
      let isValid = true;
      let errorMsg = '';
      
      // Validate based on type
      switch (config.type) {
        case 'url':
          isValid = validateUrl(value);
          errorMsg = 'Invalid URL format';
          break;
        case 'uuid':
          isValid = validateUuid(value);
          errorMsg = 'Invalid UUID format';
          break;
        case 'base64':
          isValid = validateBase64(value);
          errorMsg = 'Invalid base64 format or too short';
          break;
        case 'boolean':
          isValid = validateBoolean(value);
          errorMsg = 'Must be "true" or "false"';
          break;
        case 'enum':
          isValid = validateEnum(value, config.enum);
          errorMsg = `Must be one of: ${config.enum.join(', ')}`;
          break;
      }
      
      if (!isValid) {
        log.error(`${key}: ${errorMsg}`);
        log.info(`  Current value: ${value.substring(0, 50)}...`);
        allValid = false;
      } else {
        const displayValue = value.length > 30 
          ? `${value.substring(0, 30)}...` 
          : value;
        log.success(`${key} = ${displayValue}`);
        validCount++;
      }
    }
    
    log.step('Step 4: Checking Optional Variables');
    
    for (const [key, description] of Object.entries(OPTIONAL_VARS)) {
      if (env[key] && env[key] !== 'your-openai-key' && env[key] !== 'your-signing-secret-here') {
        log.success(`${key} (optional) - present`);
      } else {
        log.info(`${key} (optional) - not configured (${description})`);
      }
    }
    
    log.step('Step 5: Critical Checks');
    
    // Check network consistency
    if (env.NETWORK && env.NEXT_PUBLIC_WALLET_NETWORK) {
      if (env.NETWORK === env.NEXT_PUBLIC_WALLET_NETWORK) {
        log.success('Network configuration is consistent');
      } else {
        log.error(`Network mismatch: NETWORK=${env.NETWORK}, NEXT_PUBLIC_WALLET_NETWORK=${env.NEXT_PUBLIC_WALLET_NETWORK}`);
        allValid = false;
      }
    }
    
    // Check if CDP wallets are enabled
    if (env.NEXT_PUBLIC_ENABLE_CDP_WALLETS === 'true') {
      log.success('CDP Wallets are ENABLED');
      
      // Verify all CDP credentials are present
      const cdpCreds = ['CDP_API_KEY_ID', 'CDP_API_KEY_SECRET', 'CDP_WALLET_SECRET'];
      const missingCdp = cdpCreds.filter(key => !env[key]);
      
      if (missingCdp.length > 0) {
        log.error(`CDP Wallets enabled but missing credentials: ${missingCdp.join(', ')}`);
        allValid = false;
      }
    } else {
      log.warning('CDP Wallets are DISABLED - set NEXT_PUBLIC_ENABLE_CDP_WALLETS=true to enable');
    }
    
    log.step('Validation Summary');
    
    if (hasDeprecated) {
      log.error('Found deprecated variable names - please update them');
      allValid = false;
    }
    
    if (allValid) {
      log.success('🎉 All validations passed!');
      log.info('');
      log.info('Your environment variables are ready for Vercel!');
      log.info('');
      log.info('Next steps:');
      log.info('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
      log.info('2. Copy each line from vercel-env-variables.txt (skip comment lines)');
      log.info('3. Add as: NAME=value');
      log.info('4. Select all environments: Production, Preview, Development');
      log.info('5. Redeploy your application');
      log.info('');
      log.info(`Valid variables: ${validCount}/${Object.keys(REQUIRED_VARS).length} required`);
    } else {
      log.error('❌ Validation failed!');
      log.info('');
      log.info('Please fix the errors above before uploading to Vercel.');
      log.info('Check CDP-VERCEL-SETUP-GUIDE.md for detailed instructions.');
      process.exit(1);
    }
    
  } catch (error) {
    log.error('Validation failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run validation
console.log('\n' + colors.bright + colors.cyan + '═══════════════════════════════════════════════════════' + colors.reset);
console.log(colors.bright + colors.cyan + '     Vercel Environment Variables Validation           ' + colors.reset);
console.log(colors.bright + colors.cyan + '═══════════════════════════════════════════════════════' + colors.reset + '\n');

validateVercelEnv();

