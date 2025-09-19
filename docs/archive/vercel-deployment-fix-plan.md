# Vercel Deployment Fix Plan

## Issue Analysis

The Vercel deployment was failing during the build step due to environment variable validation issues. The build logs showed it was getting past dependency installation but failing during the `npm run build` phase.

### Root Causes Identified

1. **Missing zod dependency**: The `@t3-oss/env-nextjs` package requires `zod` as a peer dependency, but it wasn't explicitly listed in `package.json`
2. **Strict environment variable validation**: The `lib/env.ts` configuration was requiring all CDP and AI-related environment variables as mandatory, causing build failures when they weren't provided
3. **Missing client-side environment variable definitions**: Public environment variables weren't properly defined in the validation schema

## Implemented Fixes

### 1. Added Missing zod Dependency

**File:** `package.json`
**Change:** Added `"zod": "^3.25.76"` to dependencies

**Rationale:** While zod was installed as a transitive dependency through other packages, having it explicitly listed ensures version consistency and prevents potential resolution issues during Vercel builds.

### 2. Updated Environment Variable Schema

**File:** `lib/env.ts`
**Changes:**
- Made all CDP-related variables optional (`z.string().optional()`)
- Made AI Gateway and OpenAI API keys optional
- Added client-side environment variable validation
- Added `SKIP_ENV_VALIDATION` option for deployment flexibility
- Enhanced URL fallback logic for better Vercel compatibility

**Key improvements:**
```typescript
// Before: Required variables causing build failures
CDP_WALLET_SECRET: z.string(),
CDP_API_KEY_ID: z.string(),
CDP_API_KEY_SECRET: z.string(),

// After: Optional variables with graceful fallback
CDP_WALLET_SECRET: z.string().optional(),
CDP_API_KEY_ID: z.string().optional(),
CDP_API_KEY_SECRET: z.string().optional(),
```

### 3. Added Client-Side Variable Validation

Added proper validation for public environment variables:
```typescript
client: {
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: z.string(),
  NEXT_PUBLIC_WALLET_NETWORK: z.enum(["base-sepolia", "base"]).default("base-sepolia"),
  NEXT_PUBLIC_ENABLE_CDP_WALLETS: z.string().default("false"),
  NEXT_PUBLIC_ENABLE_AI_CHAT: z.string().default("false"),
}
```

## Vercel Environment Variable Configuration

### Required Variables (Minimum for deployment)

1. **Supabase Configuration** (REQUIRED):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key-here
   ```

2. **Build Configuration** (OPTIONAL for troubleshooting):
   ```
   SKIP_ENV_VALIDATION=true
   ```

### Optional Variables (Feature-specific)

3. **CDP/Wallet Features** (optional):
   ```
   CDP_WALLET_SECRET=your-wallet-secret
   CDP_API_KEY_ID=your-api-key-id
   CDP_API_KEY_SECRET=your-api-key-secret
   NETWORK=base-sepolia
   ```

4. **AI Features** (optional):
   ```
   OPENAI_API_KEY=your-openai-key
   VERCEL_AI_GATEWAY_KEY=your-vercel-ai-key
   ```

5. **Feature Flags** (optional):
   ```
   NEXT_PUBLIC_ENABLE_CDP_WALLETS=false
   NEXT_PUBLIC_ENABLE_AI_CHAT=false
   NEXT_PUBLIC_WALLET_NETWORK=base-sepolia
   ```

## Deployment Steps

### Step 1: Update Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the required Supabase variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
4. Optionally add `SKIP_ENV_VALIDATION=true` for initial deployment
5. Add any feature-specific variables as needed

### Step 2: Deploy Changes

1. Commit the package.json and lib/env.ts changes
2. Push to your main branch
3. Vercel should automatically trigger a new deployment
4. Monitor the build logs for success

### Step 3: Gradual Feature Enablement

After successful deployment with minimal variables:
1. Add CDP variables if wallet features are needed
2. Add AI variables if chat features are needed
3. Update feature flags to enable specific functionality
4. Remove `SKIP_ENV_VALIDATION` once all required variables are configured

## Testing

### Local Testing
```bash
# Test with minimal environment
SKIP_ENV_VALIDATION=true npm run build

# Test with full environment validation
npm run build
```

### Vercel Testing
1. Deploy with minimal configuration first
2. Verify site loads without errors
3. Gradually add features and test each deployment

## Fallback Strategy

If deployment still fails:

1. **Emergency deployment**: Set `SKIP_ENV_VALIDATION=true` in Vercel
2. **Minimal configuration**: Only set Supabase variables
3. **Progressive enhancement**: Add features incrementally after basic deployment works

## Monitoring

Watch for these indicators:
- Build completion without environment variable errors
- Successful page rendering
- No runtime errors in Vercel function logs
- Proper handling of missing optional features

## Future Improvements

1. **Environment validation refinement**: Fine-tune which variables are truly required vs optional
2. **Feature detection**: Add runtime checks for feature availability based on environment variables
3. **Documentation**: Update deployment guides with the new environment variable requirements
4. **CI/CD**: Add environment variable validation to the CI pipeline

## Success Criteria

✅ Build completes successfully on Vercel
✅ Site deploys and loads without errors
✅ All required Supabase functionality works
✅ Optional features degrade gracefully when not configured
✅ Environment variable validation provides clear error messages when needed

