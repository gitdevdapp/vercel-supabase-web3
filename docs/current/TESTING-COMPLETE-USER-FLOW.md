# Complete User Flow Testing Guide

This document explains how to test the complete user authentication and profile management flow.

## Overview

The system includes comprehensive tests that verify:
1. User signup and auth.users table creation
2. Automatic profile creation and synchronization
3. Email confirmation flow
4. User login and session management
5. Profile page access
6. Profile editing functionality (about me section)

## Test Files Created

### 1. Integration Test Suite
**File:** `__tests__/integration/complete-user-flow.integration.test.ts`

This Jest-based test suite provides automated testing of the complete user lifecycle. It includes:
- User creation and database synchronization tests
- Email confirmation simulation
- Profile access and editing tests
- Data validation and constraint testing

### 2. Automated Flow Script
**File:** `scripts/test-complete-user-flow.js`

This Node.js script provides automated testing without manual intervention:
- Suitable for CI/CD pipelines
- Includes health checks and system validation
- Provides detailed logging and error reporting

### 3. Real Email Confirmation Script
**File:** `scripts/test-real-email-confirmation.js`

This interactive script tests the complete flow with real email confirmation:
- Creates real test users
- Generates actual confirmation URLs
- Guides through manual confirmation testing
- Tests profile editing after confirmation

## Required Environment Variables

To run these tests, you need proper Supabase configuration in `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-actual-anon-key-here

# Optional: For advanced testing (admin operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Running the Tests

### Prerequisites
1. **Valid Supabase Configuration**: Replace placeholder values in `.env.local` with actual Supabase project keys
2. **Database Setup**: Ensure the enhanced database schema is installed (run `scripts/enhanced-database-setup.sql`)
3. **Email Configuration**: For real email testing, configure email in Supabase dashboard

### Test Commands

```bash
# Run comprehensive Jest integration tests
npm run test:complete-flow

# Run automated flow script (no manual intervention)
npm run test:complete-flow:script

# Run real email confirmation test (interactive)
npm run test:email-confirmation

# Run all user flow tests
npm run test:user-flow:all
```

### Expected Results

When properly configured, all tests should pass and verify:

✅ **User Signup**: New users are created in auth.users table
✅ **Profile Creation**: Profiles are automatically created via database trigger
✅ **Data Synchronization**: auth.users and profiles tables stay in sync
✅ **Email Confirmation**: Email confirmation URLs work correctly
✅ **Profile Access**: Confirmed users can access their profile page
✅ **Profile Editing**: Users can update their "about me" section
✅ **Data Persistence**: Profile changes are saved and persist across sessions
✅ **Input Validation**: Character limits and constraints are enforced

## Test Results Summary

### Current Environment Status

⚠️ **Configuration Required**: The current `.env.local` contains placeholder values that need to be replaced with actual Supabase API keys.

Current configuration issues:
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` contains placeholder value
- Service role key not configured (optional for basic testing)

### Test Coverage

The test suite covers:

1. **Database Schema Validation**
   - Profiles table structure
   - Required constraints and indexes
   - Row Level Security policies

2. **User Registration Flow**
   - Account creation in auth.users
   - Automatic profile creation via trigger
   - Email confirmation token generation

3. **Authentication System**
   - PKCE flow implementation
   - Session management
   - User login/logout

4. **Profile Management**
   - Profile data retrieval
   - Profile editing functionality
   - Data validation and constraints

5. **System Integration**
   - End-to-end user flow
   - Data consistency checks
   - Error handling and recovery

## Troubleshooting

### Common Issues

1. **"Invalid API key" Error**
   - **Cause**: Placeholder values in `.env.local`
   - **Solution**: Replace with actual Supabase project credentials

2. **"Database connection failed"**
   - **Cause**: Incorrect Supabase URL or missing database setup
   - **Solution**: Verify URL and run database setup script

3. **"Profile creation failed"**
   - **Cause**: Database trigger not installed
   - **Solution**: Execute `scripts/enhanced-database-setup.sql`

4. **"Email confirmation not working"**
   - **Cause**: Email not configured in Supabase
   - **Solution**: Configure email settings in Supabase dashboard

### Environment Validation

Run environment validation before testing:

```bash
npm run verify-env
```

This will check:
- Supabase URL configuration
- API key presence and format
- Project ID validation
- Additional configuration status

## Manual Testing Steps

For manual verification of the complete flow:

1. **Visit signup page**: `http://localhost:3000/auth/sign-up`
2. **Create test account**: Use a real email address
3. **Check email**: Confirm you receive the confirmation email
4. **Click confirmation link**: Should redirect to profile page
5. **Edit profile**: Update the "about me" section
6. **Verify persistence**: Refresh page and confirm changes saved

## Production Readiness

When all tests pass, the system is ready for production deployment. The test suite verifies:

- All authentication flows work correctly
- Database synchronization is reliable
- Email confirmation system is operational
- Profile management functions properly
- Data integrity is maintained

## Next Steps

1. **Configure Environment**: Add real Supabase credentials to `.env.local`
2. **Run Tests**: Execute the complete test suite
3. **Verify Results**: Ensure all tests pass
4. **Deploy**: System is ready for production if tests pass
5. **Monitor**: Set up monitoring for ongoing verification

For production deployment, ensure all environment variables are properly configured in your hosting platform (Vercel, etc.).
