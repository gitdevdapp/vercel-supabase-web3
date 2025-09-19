# Vercel Environment Variables Configuration Guide

## Quick Setup (Minimum Required)

To deploy successfully, you only need these two Supabase variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key-here
```

## How to Add Environment Variables in Vercel

1. **Access Project Settings**:
   - Go to your Vercel dashboard
   - Select your project
   - Click "Settings" tab
   - Navigate to "Environment Variables"

2. **Add Variables**:
   - Click "Add New"
   - Enter variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter variable value
   - Select environments (Production, Preview, Development)
   - Click "Save"

3. **Redeploy**:
   - After adding variables, trigger a new deployment
   - Go to "Deployments" tab and click "Redeploy"

## Complete Environment Variables Reference

### 🔴 REQUIRED (For Basic Functionality)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://abcdefghijk.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` | Supabase anonymous/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` |

### 🟡 OPTIONAL (For Advanced Features)

#### Wallet/CDP Features
| Variable | Description | Default |
|----------|-------------|---------|
| `CDP_WALLET_SECRET` | CDP wallet private key | - |
| `CDP_API_KEY_ID` | CDP API key identifier | - |
| `CDP_API_KEY_SECRET` | CDP API secret | - |
| `NETWORK` | Blockchain network | `base-sepolia` |
| `NEXT_PUBLIC_WALLET_NETWORK` | Public wallet network | `base-sepolia` |
| `NEXT_PUBLIC_ENABLE_CDP_WALLETS` | Enable wallet features | `false` |

#### AI Features
| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for chat | - |
| `VERCEL_AI_GATEWAY_KEY` | Vercel AI Gateway key | - |
| `NEXT_PUBLIC_ENABLE_AI_CHAT` | Enable AI chat features | `false` |

#### Admin Features
| Variable | Description | Default |
|----------|-------------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key (server-side only) | - |
| `SELLER_ADDRESS` | Optional seller wallet address | - |

#### Development/Debugging
| Variable | Description | When to Use |
|----------|-------------|-------------|
| `SKIP_ENV_VALIDATION` | Skip environment validation | Deployment troubleshooting |

## Environment-Specific Setup

### Production Deployment
```bash
# Minimum required
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key

# Optional: Enable features
NEXT_PUBLIC_ENABLE_CDP_WALLETS=true
NEXT_PUBLIC_ENABLE_AI_CHAT=true

# Add corresponding API keys if features are enabled
CDP_API_KEY_ID=your-cdp-key-id
CDP_API_KEY_SECRET=your-cdp-secret
OPENAI_API_KEY=your-openai-key
```

### Preview/Staging Deployment
```bash
# Same as production but with staging/test credentials
NEXT_PUBLIC_SUPABASE_URL=https://staging-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=staging-anon-key

# Use test network for crypto features
NETWORK=base-sepolia
NEXT_PUBLIC_WALLET_NETWORK=base-sepolia
```

### Development Environment
```bash
# Local development with test credentials
NEXT_PUBLIC_SUPABASE_URL=https://localhost:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=local-anon-key

# Skip validation for faster local development
SKIP_ENV_VALIDATION=true
```

## Troubleshooting

### Build Fails with Environment Variable Errors

**Solution 1**: Add temporary skip validation
```
SKIP_ENV_VALIDATION=true
```

**Solution 2**: Ensure required Supabase variables are set
- Check variable names are exact (case-sensitive)
- Verify values don't have extra spaces or quotes
- Confirm variables are set for correct environment (Production/Preview)

### Features Not Working After Deployment

1. **Check feature flags**:
   - `NEXT_PUBLIC_ENABLE_CDP_WALLETS` for wallet features
   - `NEXT_PUBLIC_ENABLE_AI_CHAT` for AI features

2. **Verify API keys**:
   - CDP features need `CDP_API_KEY_ID` and `CDP_API_KEY_SECRET`
   - AI features need `OPENAI_API_KEY` or `VERCEL_AI_GATEWAY_KEY`

3. **Check Vercel logs**:
   - Go to Deployments → View Function Logs
   - Look for environment variable related errors

### Supabase Connection Issues

1. **Verify URL format**:
   - Should start with `https://`
   - Should end with `.supabase.co`
   - Example: `https://abcdefghijk.supabase.co`

2. **Check key permissions**:
   - Use "anon/public" key for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
   - Use "service_role" key only for `SUPABASE_SERVICE_ROLE_KEY` (server-side)

3. **Test connection**:
   - Visit `/api/test-supabase` endpoint after deployment
   - Should return connection status

## Security Best Practices

### Public vs Private Variables

**Public variables** (accessible in browser):
- Start with `NEXT_PUBLIC_`
- Safe to expose: URLs, public keys, feature flags
- Examples: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_ENABLE_CDP_WALLETS`

**Private variables** (server-side only):
- No `NEXT_PUBLIC_` prefix
- Keep secret: API keys, private keys, service role keys
- Examples: `CDP_API_KEY_SECRET`, `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### Key Rotation

1. **Regular rotation schedule**:
   - Rotate API keys every 90 days
   - Update both Supabase and Vercel configurations

2. **Emergency rotation**:
   - If keys are compromised, rotate immediately
   - Update Vercel environment variables
   - Redeploy to apply changes

3. **Testing after rotation**:
   - Test all features after key updates
   - Monitor error logs for authentication issues

## Validation and Testing

### Pre-deployment Checklist

- [ ] Supabase URL and key are correct
- [ ] No trailing spaces in variable values
- [ ] Variable names match exactly (case-sensitive)
- [ ] Feature flags match intended configuration
- [ ] API keys are valid and not expired

### Post-deployment Testing

1. **Basic functionality**:
   - Site loads without errors
   - Authentication works
   - Database connections successful

2. **Feature-specific testing**:
   - Test wallet creation if CDP enabled
   - Test AI chat if AI features enabled
   - Verify admin functions if service role key provided

3. **Error monitoring**:
   - Check Vercel function logs
   - Monitor for environment-related errors
   - Verify graceful degradation for missing optional features

