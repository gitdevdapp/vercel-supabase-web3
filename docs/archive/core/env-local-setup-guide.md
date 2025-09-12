# 🔧 Creating Your env.local File with Supabase Credentials

## 📋 Overview
This guide provides step-by-step instructions for creating your `env.local` file with the correct Supabase database URL and anonymous key. This is required for local development and must be configured before running the application.

---

## 📁 File Location
Your `env.local` file should be created in the project root directory:
```
/Users/garrettair/Documents/vercel-supabase-web3/.env.local
```

**⚠️ Important:** This file should **NEVER** be committed to Git as it contains sensitive credentials.

---

## 🔑 Step 1: Access Your Supabase Dashboard

### Method 1: Direct URL Access
1. Navigate to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in with your account credentials

### Method 2: Via Project Link
If you have a direct project link, navigate to:
```
https://supabase.com/dashboard/project/YOUR_PROJECT_ID
```

---

## 🔑 Step 2: Find Your Project Credentials

### Navigate to API Settings
```
1. Click on your project name in the dashboard
2. Click "Settings" in the left sidebar
3. Click "API" in the settings menu
```

### Locate Required Credentials
In the API settings page, you'll find the following values:

#### 🔗 Project URL
**Location**: `Project URL` field
**Format**: `https://[your-project-id].supabase.co`
**Example**: `https://abcdefghijk.supabase.co`

#### 🔑 Anonymous Public Key
**Location**: `anon public` field (under "Project API keys")
**Format**: Long string starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
**Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXJwcm9qZWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDU2MzI4MzYsImV4cCI6MTk2MTIwODgzNn0.example-hash-signature`

#### 🔐 Service Role Key (Optional)
**Location**: `service_role` field (under "Project API keys")
**Format**: Long string starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
**Note**: Keep this secret and only use for admin operations

---

## 📝 Step 3: Create the env.local File

### Method 1: Using Terminal
```bash
# Navigate to project directory
cd /Users/garrettair/Documents/vercel-supabase-web3

# Create the env.local file
touch .env.local

# Edit with your preferred editor (nano, vim, code, etc.)
nano .env.local
```

### Method 2: Using Finder/File Explorer
1. Open Finder and navigate to your project directory
2. Right-click in the folder and select "New Text File"
3. Name the file `.env.local` (make sure to include the leading dot)
4. Open the file with a text editor

### Method 3: Using VS Code or Cursor
```bash
# Open the project in your editor
code /Users/garrettair/Documents/vercel-supabase-web3

# Create new file: .env.local
```

---

## 📝 Step 4: Add Your Credentials to env.local

Copy and paste the following template into your `env.local` file, replacing the placeholder values with your actual Supabase credentials:

```bash
# Supabase Configuration
# Get these values from your Supabase dashboard under Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key-here

# Optional: Service Role Key (for admin operations - keep secret!)
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Example with Real Values
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key-here

# Optional: Service Role Key (for admin operations - keep secret!)
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

---

## 🧪 Step 5: Verify Your Configuration

### Test Database Connection
```bash
# Run the application to test connection
npm run dev

# Visit the test endpoint
curl http://localhost:3000/api/test-supabase
```

Expected response:
```json
{
  "message": "Supabase connection successful!",
  "timestamp": "2025-09-12T...",
  "user_count": 0
}
```

### Check for Errors
If you see connection errors:
1. Verify your `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Ensure your `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` is the anon key, not service role
3. Check that there are no extra spaces or characters in your env.local file

---

## 🔒 Step 6: Security Best Practices

### Never Commit Secrets
```bash
# Ensure .env.local is in .gitignore
echo ".env.local" >> .gitignore

# Check that it's properly ignored
git check-ignore .env.local
```

### File Permissions
```bash
# Set proper permissions (read/write for owner only)
chmod 600 .env.local
```

### Environment Variable Naming
- ✅ `NEXT_PUBLIC_*` prefix for client-side variables
- 🔒 No prefix for server-side variables
- 📝 Use descriptive names without special characters

---

## 🆘 Troubleshooting Common Issues

### Issue 1: "Invalid API key" Error
**Cause**: Wrong API key used or incorrect format
**Solution**:
1. Double-check you're using the "anon public" key, not "service_role"
2. Ensure no extra spaces or line breaks
3. Verify the key starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`

### Issue 2: "Project not found" Error
**Cause**: Incorrect project URL
**Solution**:
1. Verify the URL format: `https://[your-project-id].supabase.co`
2. Check that the project ID matches your dashboard URL
3. Ensure no typos in the project ID

### Issue 3: Environment Variables Not Loading
**Cause**: Next.js not picking up .env.local
**Solution**:
1. Restart the development server: `npm run dev`
2. Check file location (must be in project root)
3. Verify file name: `.env.local` (leading dot)
4. Ensure no syntax errors in the file

### Issue 4: Authentication Not Working
**Cause**: Missing or incorrect redirect URLs in Supabase
**Solution**:
1. In Supabase Dashboard → Authentication → URL Configuration
2. Add your local development URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/confirm`
3. Save changes and restart your dev server

---

## 📚 Additional Resources

### Supabase Documentation
- [Supabase API Settings](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs#api-settings)
- [Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

### Project-Specific Setup
- [`env-example.txt`](../../env-example.txt) - Template file
- [`docs/profile/profile-setup.sql`](../profile/profile-setup.sql) - Database setup
- [`docs/deployment/core/`](../deployment/core/) - Full deployment guides

---

## ✅ Success Checklist

### Configuration Complete
- [ ] ✅ Created `.env.local` file in project root
- [ ] ✅ Added correct Supabase URL
- [ ] ✅ Added anon public key (not service role key)
- [ ] ✅ File is in `.gitignore`
- [ ] ✅ Proper file permissions set

### Testing Passed
- [ ] ✅ Application starts without errors
- [ ] ✅ Database connection successful
- [ ] ✅ Authentication flows work locally
- [ ] ✅ Profile functionality operational

### Security Verified
- [ ] ✅ No sensitive data committed to Git
- [ ] ✅ Environment variables properly scoped
- [ ] ✅ Service role key kept secure (if used)

---

## 🚀 Next Steps

With your `env.local` file configured:

1. **Test Authentication**: Try registering a new user
2. **Verify Database**: Check that profiles are created automatically
3. **Test Deployment**: Push to main branch for Vercel auto-deployment
4. **Monitor Logs**: Check Vercel dashboard for successful deployments

---

**🎉 Setup Complete!**  
Your local development environment is now configured with Supabase credentials and ready for development.

---

*Last Updated: September 12, 2025*  
*Guide Version: 1.0*  
*Status: ✅ Ready for Use*
