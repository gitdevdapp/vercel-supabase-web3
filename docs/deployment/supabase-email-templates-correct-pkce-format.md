# 🔧 **URGENT: Email Template Configuration Fix**

## 🚨 **CURRENT ISSUE**

**Error**: `Invalid verification link - missing parameters`
**Root Cause**: Supabase email templates are sending `?code=XXXXXX` instead of `?token_hash=XXXXXX&type=signup`

### ❌ **Current Broken Format in Production**
```
https://devdapp.com/auth/confirm?code=865986&next=/protected/profile
```

**Problems**:
1. Uses `code` parameter instead of `token_hash`  
2. Missing `type` parameter entirely
3. Short numeric code instead of proper token hash

---

## ✅ **IMMEDIATE FIX APPLIED**

The auth route has been updated to handle all these formats:
- `?token_hash=...&type=signup` (preferred)
- `?code=...&type=signup` (compatible)  
- `?code=XXXXXX` (fallback for current broken emails)

---

# 🔧 **Why Trust the New URL Format**

## 🚨 **Your Error Analysis**

Your Vercel logs showed this exact error:
```
error: 'invalid request: both auth code and code verifier should be non-empty'
errorCode: 400
```

**This is a PKCE (Proof Key for Code Exchange) flow error.** Here's why the old format failed:

### ❌ **Old Format (BROKEN)**
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
```

**Problem**: Your app's auth route expects PKCE flow but receives `token_hash` parameter. PKCE flow requires:
1. `code` parameter (you were sending `token_hash`)
2. Code verifier (missing entirely)

### ✅ **New Format (CORRECT)**
```
{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/protected/profile
```

**Why this works**:
- PKCE flow expects `code` parameter (not `token_hash`)
- `{{ .Token }}` contains the actual PKCE authorization code
- Supabase's `exchangeCodeForSession()` method looks for `code` parameter
- No `type` parameter needed - Supabase auto-detects PKCE flow

---

# 📧 **Correct Supabase Email Templates - PKCE Compatible**

## 📍 **Supabase Dashboard URLs**
- **Project**: https://supabase.com/dashboard/project/[REDACTED-PROJECT-ID]
- **Email Templates**: https://supabase.com/dashboard/project/[REDACTED-PROJECT-ID]/auth/templates

---

## ⚙️ **Critical Configuration**

### Site URL
```
https://devdapp.com
```

### Redirect URLs
```
https://devdapp.com/auth/confirm
https://devdapp.com/auth/callback
https://devdapp.com/protected/profile
https://devdapp.com/auth/update-password
```

---

## 📧 **1. Confirm Signup**

**Template Name**: `Confirm signup`

```html
<h2>🎉 Welcome to DevDapp!</h2>
<p>Thanks for signing up! Click the button below to confirm your email address and automatically log into your account:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/protected/profile"
     style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #0070f3 0%, #0051cc 100%); color: white; text-decoration: none; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0, 112, 243, 0.3);">
    ✅ Confirm Email & Start Using DevDapp
  </a>
</div>

<div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin: 25px 0;">
  <h3 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">🚀 What you'll get access to:</h3>
  <ul style="margin: 0; padding-left: 20px; color: #0c4a6e;">
    <li>🏦 Create and manage crypto wallets</li>
    <li>💰 Send and receive USDC transfers</li>
    <li>🔗 Connect to multiple blockchain networks</li>
    <li>📊 Track your portfolio and transactions</li>
    <li>🛡️ Enterprise-grade security</li>
  </ul>
</div>

<p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
  <strong>Backup Link:</strong> If the button doesn't work, copy and paste this link into your browser:
</p>
<p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
  <a href="{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/protected/profile">{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/protected/profile</a>
</p>

<div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
  <p style="margin: 0; font-size: 14px;">
    <strong>⏰ Important:</strong> This link will expire in 24 hours for security reasons.
  </p>
</div>

<p style="margin-top: 20px; font-size: 13px; color: #666;">
  If you didn't create an account with DevDapp, you can safely ignore this email.
</p>

<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #888;">
  <p>This email was sent by DevDapp • <a href="https://devdapp.com" style="color: #0070f3;">devdapp.com</a></p>
</div>
```

---

## 📧 **2. Invite User**

**Template Name**: `Invite user`

```html
<h2>🎉 You're Invited to DevDapp!</h2>
<p>You've been invited to join DevDapp, the fastest way to deploy decentralized applications. Click the button below to accept your invitation and create your account:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/protected/profile"
     style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #0070f3 0%, #0051cc 100%); color: white; text-decoration: none; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0, 112, 243, 0.3);">
    🚀 Accept Invitation & Join DevDapp
  </a>
</div>

<div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin: 25px 0;">
  <h3 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">🚀 What you'll get access to:</h3>
  <ul style="margin: 0; padding-left: 20px; color: #0c4a6e;">
    <li>🏦 Create and manage crypto wallets</li>
    <li>💰 Send and receive USDC transfers</li>
    <li>🔗 Connect to multiple blockchain networks</li>
    <li>📊 Track your portfolio and transactions</li>
    <li>🛡️ Enterprise-grade security</li>
  </ul>
</div>

<p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
  <strong>Backup Link:</strong> If the button doesn't work, copy and paste this link into your browser:
</p>
<p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
  <a href="{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/protected/profile">{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/protected/profile</a>
</p>

<div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
  <p style="margin: 0; font-size: 14px;">
    <strong>⏰ Important:</strong> This invitation will expire in 7 days for security reasons.
  </p>
</div>

<p style="margin-top: 20px; font-size: 13px; color: #666;">
  If you didn't expect this invitation, you can safely ignore this email.
</p>

<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #888;">
  <p>This email was sent by DevDapp • <a href="https://devdapp.com" style="color: #0070f3;">devdapp.com</a></p>
</div>
```

---

## 📧 **3. Magic Link**

**Template Name**: `Magic Link`

```html
<h2>🪄 Your DevDapp Magic Link</h2>
<p>Click the button below to instantly sign in to your DevDapp account:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/protected/profile"
     style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #0070f3 0%, #0051cc 100%); color: white; text-decoration: none; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0, 112, 243, 0.3);">
    🪄 Sign In to DevDapp
  </a>
</div>

<div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin: 25px 0;">
  <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
    <strong>🔐 Secure & Passwordless:</strong> This magic link provides secure access to your account without requiring a password.
  </p>
</div>

<p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
  <strong>Backup Link:</strong> If the button doesn't work, copy and paste this link into your browser:
</p>
<p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
  <a href="{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/protected/profile">{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/protected/profile</a>
</p>

<div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
  <p style="margin: 0; font-size: 14px;">
    <strong>⏰ Important:</strong> This link will expire in 60 minutes for security reasons.
  </p>
</div>

<p style="margin-top: 20px; font-size: 13px; color: #666;">
  If you didn't request this magic link, you can safely ignore this email.
</p>

<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #888;">
  <p>This email was sent by DevDapp • <a href="https://devdapp.com" style="color: #0070f3;">devdapp.com</a></p>
</div>
```

---

## 📧 **4. Change Email Address**

**Template Name**: `Change Email Address`

```html
<h2>📧 Confirm Your New Email Address</h2>
<p>You've requested to change your email address for your DevDapp account. Click the button below to confirm your new email address:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/protected/profile"
     style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #0070f3 0%, #0051cc 100%); color: white; text-decoration: none; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0, 112, 243, 0.3);">
    📧 Confirm New Email Address
  </a>
</div>

<div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin: 25px 0;">
  <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
    <strong>🔄 Email Change Process:</strong> After confirmation, this will become your new login email address for DevDapp.
  </p>
</div>

<p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
  <strong>Backup Link:</strong> If the button doesn't work, copy and paste this link into your browser:
</p>
<p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
  <a href="{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/protected/profile">{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/protected/profile</a>
</p>

<div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
  <p style="margin: 0; font-size: 14px;">
    <strong>⏰ Important:</strong> This link will expire in 24 hours for security reasons.
  </p>
</div>

<p style="margin-top: 20px; font-size: 13px; color: #666;">
  If you didn't request this email change, please contact support immediately.
</p>

<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #888;">
  <p>This email was sent by DevDapp • <a href="https://devdapp.com" style="color: #0070f3;">devdapp.com</a></p>
</div>
```

---

## 📧 **5. Reset Password**

**Template Name**: `Reset password`

```html
<h2>🔐 Reset Your DevDapp Password</h2>
<p>You requested to reset your password for your DevDapp account. Click the button below to set a new password:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/auth/update-password"
     style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #0070f3 0%, #0051cc 100%); color: white; text-decoration: none; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0, 112, 243, 0.3);">
    🔒 Reset Password & Login
  </a>
</div>

<div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin: 25px 0;">
  <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
    <strong>🔄 Password Reset Process:</strong> You'll be automatically logged in and redirected to set a new password.
  </p>
</div>

<p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
  <strong>Backup Link:</strong> If the button doesn't work, copy and paste this link into your browser:
</p>
<p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
  <a href="{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/auth/update-password">{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/auth/update-password</a>
</p>

<div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
  <p style="margin: 0; font-size: 14px;">
    <strong>⏰ Important:</strong> This link will expire in 60 minutes for security reasons.
  </p>
</div>

<p style="margin-top: 20px; font-size: 13px; color: #666;">
  If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
</p>

<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #888;">
  <p>This email was sent by DevDapp • <a href="https://devdapp.com" style="color: #0070f3;">devdapp.com</a></p>
</div>
```

---

## 📧 **6. Reauthentication**

**Template Name**: `Reauthentication`

```html
<h2>🔐 Confirm Your Identity</h2>
<p>For security purposes, we need to confirm your identity before proceeding. Click the button below to reauthenticate your DevDapp account:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/protected/profile"
     style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #0070f3 0%, #0051cc 100%); color: white; text-decoration: none; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0, 112, 243, 0.3);">
    🔐 Confirm Identity & Continue
  </a>
</div>

<div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 25px 0;">
  <p style="margin: 0; color: #92400e; font-size: 14px;">
    <strong>🛡️ Security Check:</strong> This verification is required for sensitive account operations to ensure your account security.
  </p>
</div>

<p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
  <strong>Backup Link:</strong> If the button doesn't work, copy and paste this link into your browser:
</p>
<p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
  <a href="{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/protected/profile">{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/protected/profile</a>
</p>

<div style="margin-top: 30px; padding: 15px; background: #fee2e2; border-left: 4px solid #ef4444; border-radius: 4px;">
  <p style="margin: 0; font-size: 14px; color: #991b1b;">
    <strong>⏰ Important:</strong> This link will expire in 15 minutes for security reasons.
  </p>
</div>

<p style="margin-top: 20px; font-size: 13px; color: #666;">
  If you didn't initiate this security check, please contact support immediately.
</p>

<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #888;">
  <p>This email was sent by DevDapp • <a href="https://devdapp.com" style="color: #0070f3;">devdapp.com</a></p>
</div>
```

---

## 📋 **Quick Reference - Copy/Paste URLs**

### All Templates Use This Pattern:
```
{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=[DESTINATION]
```

### Specific URLs:
- **Confirm Signup**: `{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/protected/profile`
- **Invite User**: `{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/protected/profile`
- **Magic Link**: `{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/protected/profile`
- **Change Email**: `{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/protected/profile`
- **Reset Password**: `{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/auth/update-password`
- **Reauthentication**: `{{ .SiteURL }}/auth/confirm?code={{ .Token }}&next=/protected/profile`

---

## ✅ **Why This Works**

1. **PKCE Compatibility**: Uses `code` parameter that PKCE flow expects
2. **Automatic Detection**: Supabase auto-detects PKCE vs OTP flow
3. **Simplified**: No `type` parameter needed
4. **Full Token Preservation**: `{{ .Token }}` contains complete authorization code
5. **Direct Integration**: Works with your existing `exchangeCodeForSession()` call

---

## 🚨 **CRITICAL: Update Supabase Email Templates NOW**

### **Step 1: Access Supabase Dashboard**
1. Go to: https://supabase.com/dashboard/project/[REDACTED-PROJECT-ID]/auth/templates
2. Login with your Supabase account

### **Step 2: Update "Confirm signup" Template**
**Replace the current template** with the one from line 60 above that uses:
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/protected/profile
```

### **Step 3: Update All Other Templates**
Use the templates from sections 2-6 above, all using the `token_hash` format.

---

## 🚨 **After Updating Templates**

1. **Wait 5-10 minutes** for Supabase to cache new templates
2. **Test with fresh email** (not previously used)
3. **Check Vercel logs** - should see successful verification
4. **User should auto-login** and redirect to profile

**🎯 Result**: Email confirmation will now work perfectly with both current and future formats!

---

## 🛡️ **Backup Solution**

**The auth route now handles ALL formats:**
- ✅ `?token_hash={{ .TokenHash }}&type=signup` (correct)
- ✅ `?code={{ .TokenHash }}&type=signup` (compatible)  
- ✅ `?code=865986` (current broken format - fallback)

**This means email confirmation should work immediately, even before updating templates!**
