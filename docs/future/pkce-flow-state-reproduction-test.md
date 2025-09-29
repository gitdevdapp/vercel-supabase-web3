# PKCE Flow State Error Reproduction Test

**Created**: September 29, 2025  
**Status**: 🚨 **ACTIVE BUG REPRODUCTION**  
**Error Target**: `flow_state_not_found` - PKCE verification failed  
**Goal**: Reproduce the exact error happening in production Vercel builds

## The Problem

The current authentication setup has a fundamental flaw in the PKCE flow:

1. **App Configuration**: Both client and server are configured with `flowType: 'pkce'`
2. **Email Generation**: Supabase generates PKCE tokens (pkce_xxx) in email links
3. **Missing State**: Email confirmation links bypass PKCE authorization request phase
4. **Flow Failure**: `exchangeCodeForSession()` fails with "invalid flow state, no valid flow state found"

## The Error We're Reproducing

```
PKCE verification failed: Error [AuthApiError]: invalid flow state, no valid flow state found
    at br (.next/server/chunks/3146.js:21:30472)
    at async bt (.next/server/chunks/3146.js:21:31446)
    at async bs (.next/server/chunks/3146.js:21:30856)
    at async bN._exchangeCodeForSession (.next/server/chunks/3146.js:21:50569)
    at async (.next/server/chunks/3146.js:21:55944) {
  __isAuthError: true,
  status: 404,
  code: 'flow_state_not_found'
}
```

## Test Strategy

This test will:
1. Create fresh users with cleaned database state
2. Simulate the exact production flow causing errors
3. Capture and validate the specific PKCE error
4. Test both local and production-like environments
5. Prove the issue exists before attempting fixes

## Expected Outcome

The test **WILL FAIL** with the exact error above, proving we can reproduce the production issue.
