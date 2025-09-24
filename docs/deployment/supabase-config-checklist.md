# ✅ Supabase Configuration Checklist

## 🚀 Quick Setup Guide (15 minutes)

### Step 1: Login to Supabase Dashboard
- Go to: https://supabase.com/dashboard
- Find project: `[REDACTED-PROJECT-ID]`
- Click to open project

### Step 2: Configure Site URL
**Location**: Authentication → Settings → Site URL
```
Set to: https://devdapp.com
✅ Save
```

### Step 3: Add Redirect URLs
**Location**: Authentication → Settings → Redirect URLs

**Add these URLs** (copy-paste each):
```
https://devdapp.com/auth/confirm
https://devdapp.com/auth/callback
https://devdapp.com/auth/update-password
https://devdapp.com/auth/error
https://devdapp.com/protected/profile
https://devdapp.com/
✅ Save all URLs
```

### Step 4: Update Email Templates
**Location**: Authentication → Email Templates

#### Confirm Signup Template (CRITICAL)
**Replace entire template with**:
```html
<h2>Welcome to DevDapp!</h2>
<p>Thanks for signing up! Click the button below to confirm your email address and start using your account:</p>

<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/protected/profile"
   style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-family: sans-serif;">
   Confirm Email & Login
</a>

<p>If the button doesn't work, copy and paste this link into your browser:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/protected/profile">{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/protected/profile</a></p>

<p><strong>Important:</strong> This link will expire in 24 hours for security reasons.</p>
<p>If you didn't create an account with DevDapp, you can safely ignore this email.</p>
```

#### Reset Password Template
**Replace with**:
```html
<h2>Reset your DevDapp password</h2>
<p>Someone requested a password reset for your DevDapp account. If this was you, click the button below to reset your password:</p>

<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password"
   style="display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-family: sans-serif;">
   Reset Password
</a>

<p>If the button doesn't work, copy and paste this link into your browser:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password">{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password</a></p>

<p><strong>Important:</strong> This link will expire in 24 hours for security reasons.</p>
<p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
```

### Step 5: Enable Authentication Settings
**Location**: Authentication → Settings → Authentication methods

**Ensure these are enabled**:
- ✅ Enable email confirmations
- ✅ Enable email change confirmations
- ✅ Secure email change enabled

### Step 6: TEST IMMEDIATELY

1. **Go to**: https://devdapp.com/auth/sign-up
2. **Create account** with test email (use mailinator.com)
3. **Check email** - verify link points to `devdapp.com/auth/confirm`
4. **Click link** - should auto-login and redirect to profile

### ✅ SUCCESS CRITERIA

**Email links should now point to**:
```
https://devdapp.com/auth/confirm?token_hash=...&type=signup&next=/protected/profile
```

**NOT**:
```
https://[REDACTED-PROJECT-ID].supabase.co/auth/v1/verify?token=...
```

### 🔧 TROUBLESHOOTING

**If still pointing to Supabase domain**:
- Re-save email templates (they cache for 3-5 minutes)
- Wait 5 minutes and test with new email
- Verify Site URL is exactly `https://devdapp.com`

---

## 🎯 Configuration Complete!

After this setup, users will be automatically logged in when they click email confirmation links, eliminating the need for separate login steps.

**Time to complete**: 15 minutes
**Impact**: Immediate fix for email confirmation auto-login
**Risk**: Very low (configuration only)

---

**Next**: Test with a real email address to verify the configuration works correctly.
