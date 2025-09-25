# 📧 Supabase Email Templates - Correct OTP Flow Configuration

## 📋 Quick Reference

**✅ WINNING SOLUTION**: OTP Flow with `token_hash` parameter  
**✅ VERIFIED WORKING**: Simple, reliable, secure email confirmation  
**⏱️ SETUP TIME**: 10 minutes to configure all 6 templates  

---

## 🎯 **Configuration Overview**

### **Correct URL Format**
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=[TYPE]&next=[DESTINATION]
```

### **Why This Works**
- ✅ **OTP Flow**: Uses `verifyOtp()` method (correct for email confirmation)
- ✅ **token_hash**: Standard Supabase parameter for email tokens
- ✅ **type**: Specifies action (signup, recovery, etc.)
- ✅ **Auto-login**: Users automatically logged in after confirmation

---

## 🚀 **SUPABASE DASHBOARD ACCESS**

### **Direct Links**
- **Project Dashboard**: https://supabase.com/dashboard/project/[REDACTED-PROJECT-ID]
- **Email Templates**: https://supabase.com/dashboard/project/[REDACTED-PROJECT-ID]/auth/templates

### **Navigation Steps**
1. Go to Supabase Dashboard
2. Select your project (`[REDACTED-PROJECT-ID]`)
3. Click **"Authentication"** in sidebar
4. Click **"Email Templates"** 
5. Update each template below

---

## 📧 **EMAIL TEMPLATE CONFIGURATIONS**

### **1. Confirm Signup**

**Template Name**: `Confirm signup`  
**Purpose**: New user email verification

```html
<h2>🎉 Welcome to DevDapp!</h2>
<p>Thanks for signing up! Click the button below to confirm your email and start using DevDapp:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/protected/profile"
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
  <strong>Backup Link:</strong> If the button doesn't work, copy and paste this link:
</p>
<p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
  {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/protected/profile
</p>

<div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
  <p style="margin: 0; font-size: 14px;">
    <strong>⏰ Important:</strong> This link will expire in 24 hours for security.
  </p>
</div>

<p style="margin-top: 20px; font-size: 13px; color: #666;">
  If you didn't create an account, you can safely ignore this email.
</p>

<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #888;">
  <p>DevDapp • <a href="https://devdapp.com" style="color: #0070f3;">devdapp.com</a></p>
</div>
```

---

### **2. Invite User**

**Template Name**: `Invite user`  
**Purpose**: Team invitation emails

```html
<h2>🎉 You're Invited to DevDapp!</h2>
<p>You've been invited to join DevDapp. Click the button below to accept your invitation:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/protected/profile"
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
  <strong>Backup Link:</strong> If the button doesn't work, copy and paste this link:
</p>
<p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
  {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/protected/profile
</p>

<div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
  <p style="margin: 0; font-size: 14px;">
    <strong>⏰ Important:</strong> This invitation will expire in 7 days.
  </p>
</div>

<p style="margin-top: 20px; font-size: 13px; color: #666;">
  If you didn't expect this invitation, you can safely ignore this email.
</p>

<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #888;">
  <p>DevDapp • <a href="https://devdapp.com" style="color: #0070f3;">devdapp.com</a></p>
</div>
```

---

### **3. Magic Link**

**Template Name**: `Magic Link`  
**Purpose**: Passwordless login links

```html
<h2>🪄 Your DevDapp Magic Link</h2>
<p>Click the button below to instantly sign in to your DevDapp account:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next=/protected/profile"
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
  <strong>Backup Link:</strong> If the button doesn't work, copy and paste this link:
</p>
<p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
  {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next=/protected/profile
</p>

<div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
  <p style="margin: 0; font-size: 14px;">
    <strong>⏰ Important:</strong> This link will expire in 60 minutes for security.
  </p>
</div>

<p style="margin-top: 20px; font-size: 13px; color: #666;">
  If you didn't request this magic link, you can safely ignore this email.
</p>

<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #888;">
  <p>DevDapp • <a href="https://devdapp.com" style="color: #0070f3;">devdapp.com</a></p>
</div>
```

---

### **4. Change Email Address**

**Template Name**: `Change Email Address`  
**Purpose**: Email address change confirmation

```html
<h2>📧 Confirm Your New Email Address</h2>
<p>You've requested to change your email address for your DevDapp account. Click the button below to confirm:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change&next=/protected/profile"
     style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #0070f3 0%, #0051cc 100%); color: white; text-decoration: none; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0, 112, 243, 0.3);">
    📧 Confirm New Email Address
  </a>
</div>

<div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin: 25px 0;">
  <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
    <strong>🔄 Email Change:</strong> After confirmation, this will become your new login email address.
  </p>
</div>

<p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
  <strong>Backup Link:</strong> If the button doesn't work, copy and paste this link:
</p>
<p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
  {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change&next=/protected/profile
</p>

<div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
  <p style="margin: 0; font-size: 14px;">
    <strong>⏰ Important:</strong> This link will expire in 24 hours for security.
  </p>
</div>

<p style="margin-top: 20px; font-size: 13px; color: #666;">
  If you didn't request this email change, please contact support immediately.
</p>

<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #888;">
  <p>DevDapp • <a href="https://devdapp.com" style="color: #0070f3;">devdapp.com</a></p>
</div>
```

---

### **5. Reset Password**

**Template Name**: `Reset Password`  
**Purpose**: Password reset requests

```html
<h2>🔐 Reset Your DevDapp Password</h2>
<p>You requested to reset your password. Click the button below to set a new password:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password"
     style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; text-decoration: none; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
    🔒 Reset Password & Login
  </a>
</div>

<div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin: 25px 0;">
  <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
    <strong>🔄 Password Reset:</strong> You'll be automatically logged in and redirected to set a new password.
  </p>
</div>

<p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
  <strong>Backup Link:</strong> If the button doesn't work, copy and paste this link:
</p>
<p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
  {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password
</p>

<div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
  <p style="margin: 0; font-size: 14px;">
    <strong>⏰ Important:</strong> This link will expire in 60 minutes for security.
  </p>
</div>

<p style="margin-top: 20px; font-size: 13px; color: #666;">
  If you didn't request a password reset, you can safely ignore this email.
</p>

<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #888;">
  <p>DevDapp • <a href="https://devdapp.com" style="color: #0070f3;">devdapp.com</a></p>
</div>
```

---

### **6. Reauthentication**

**Template Name**: `Reauthentication`  
**Purpose**: Security verification for sensitive operations

```html
<h2>🔐 Confirm Your Identity</h2>
<p>For security purposes, we need to confirm your identity before proceeding. Click the button below to reauthenticate:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=reauthenticate&next=/protected/profile"
     style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #0070f3 0%, #0051cc 100%); color: white; text-decoration: none; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0, 112, 243, 0.3);">
    🔐 Confirm Identity & Continue
  </a>
</div>

<div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 25px 0;">
  <p style="margin: 0; color: #92400e; font-size: 14px;">
    <strong>🛡️ Security Check:</strong> This verification is required for sensitive account operations.
  </p>
</div>

<p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
  <strong>Backup Link:</strong> If the button doesn't work, copy and paste this link:
</p>
<p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
  {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=reauthenticate&next=/protected/profile
</p>

<div style="margin-top: 30px; padding: 15px; background: #fee2e2; border-left: 4px solid #ef4444; border-radius: 4px;">
  <p style="margin: 0; font-size: 14px; color: #991b1b;">
    <strong>⏰ Important:</strong> This link will expire in 15 minutes for security.
  </p>
</div>

<p style="margin-top: 20px; font-size: 13px; color: #666;">
  If you didn't initiate this security check, please contact support immediately.
</p>

<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #888;">
  <p>DevDapp • <a href="https://devdapp.com" style="color: #0070f3;">devdapp.com</a></p>
</div>
```

---

## 📋 **Quick Copy-Paste URLs**

For easy configuration, here are the exact URLs to use:

```
Confirm Signup:     {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/protected/profile
Invite User:        {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/protected/profile  
Magic Link:         {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next=/protected/profile
Change Email:       {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change&next=/protected/profile
Reset Password:     {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password
Reauthentication:   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=reauthenticate&next=/protected/profile
```

---

## ✅ **Post-Configuration Checklist**

### **After updating templates:**
- [ ] Wait 5-10 minutes for Supabase to cache new templates
- [ ] Test with a real email signup (not test tokens)
- [ ] Verify users auto-login after email confirmation
- [ ] Check Vercel logs for "Email confirmation successful" messages

### **Expected Results:**
1. ✅ User clicks email link
2. ✅ Automatic login (no manual login required)  
3. ✅ Redirect to profile or appropriate page
4. ✅ No "missing parameters" errors

---

## 🛡️ **Security Notes**

- ✅ **Time-limited tokens**: All links expire (15 minutes to 24 hours)
- ✅ **Single-use tokens**: Can't be reused after successful verification
- ✅ **Domain-restricted**: Only work with configured site URL
- ✅ **Type-specific**: Each token only works for its intended purpose

---

**🎯 Bottom Line**: Copy the templates above into your Supabase dashboard exactly as shown. These use the proven OTP flow that works reliably for email confirmation with automatic login.
