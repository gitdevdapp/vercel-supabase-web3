# 📧 Supabase Email Templates Configuration

## 🚨 Critical: PKCE Token Preservation

All email templates MUST use the exact URLs below to ensure **full 128-character PKCE tokens** are preserved. Incorrect templates cause token truncation and "Authentication verification failed" errors.

## 📍 Supabase Dashboard URLs

- **Project Dashboard**: https://supabase.com/dashboard/project/[REDACTED-PROJECT-ID]
- **Email Templates**: https://supabase.com/dashboard/project/[REDACTED-PROJECT-ID]/auth/templates
- **Auth Settings**: https://supabase.com/dashboard/project/[REDACTED-PROJECT-ID]/auth/settings

## ⚙️ Required Configuration

### Site URL
```
https://devdapp.com
```

### Redirect URLs
```
https://devdapp.com/auth/confirm
https://devdapp.com/auth/callback
https://devdapp.com/auth/update-password
https://devdapp.com/auth/error
https://devdapp.com/protected/profile
```

---

## 📧 Email Template Configurations

### 1. Confirm Signup

**Template Name**: `Confirm signup`

```html
<h2>🎉 Welcome to DevDapp!</h2>
<p>Thanks for signing up! Click the button below to confirm your email address and automatically log into your account:</p>

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
  <strong>Backup Link:</strong> If the button doesn't work, copy and paste this link into your browser:
</p>
<p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/protected/profile">{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/protected/profile</a>
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

### 2. Invite User

**Template Name**: `Invite user`

```html
<h2>🎉 You're Invited to DevDapp!</h2>
<p>You've been invited to join DevDapp, the fastest way to deploy decentralized applications. Click the button below to accept your invitation and create your account:</p>

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
  <strong>Backup Link:</strong> If the button doesn't work, copy and paste this link into your browser:
</p>
<p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/protected/profile">{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/protected/profile</a>
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

### 3. Magic Link

**Template Name**: `Magic Link`

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
  <strong>Backup Link:</strong> If the button doesn't work, copy and paste this link into your browser:
</p>
<p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next=/protected/profile">{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next=/protected/profile</a>
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

### 4. Change Email Address

**Template Name**: `Change Email Address`

```html
<h2>📧 Confirm Your New Email Address</h2>
<p>You've requested to change your email address for your DevDapp account. Click the button below to confirm your new email address:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change&next=/protected/profile"
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
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change&next=/protected/profile">{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change&next=/protected/profile</a>
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

### 5. Reset Password

**Template Name**: `Reset password for user`

```html
<h2>🔐 Reset Your DevDapp Password</h2>
<p>You requested to reset your password for your DevDapp account. Click the button below to set a new password:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password"
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
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password">{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password</a>
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

### 6. Reauthentication

**Template Name**: `Reauthentication`

```html
<h2>🔐 Confirm Your Identity</h2>
<p>For security purposes, we need to confirm your identity before proceeding. Click the button below to reauthenticate your DevDapp account:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=reauthentication&next=/protected/profile"
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
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=reauthentication&next=/protected/profile">{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=reauthentication&next=/protected/profile</a>
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

## 🔧 Critical URL Components

### Base Pattern
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=[TYPE]&next=[REDIRECT]
```

### Token Types by Template
- **Confirm signup**: `type=signup`
- **Invite user**: `type=invite`
- **Magic Link**: `type=magiclink`
- **Change Email**: `type=email_change`
- **Reset Password**: `type=recovery`
- **Reauthentication**: `type=reauthentication`

### Redirect Destinations
- **Default**: `&next=/protected/profile`
- **Password Reset**: `&next=/auth/update-password`

## ✅ Success Verification

After updating templates, verify:

1. **PKCE Token Length**: Should be 43-128 characters
2. **URL Format**: `devdapp.com/auth/confirm?token_hash=pkce_[FULL_TOKEN]...`
3. **Auto-Login**: Clicking email link auto-logs user in
4. **Proper Redirect**: User lands on intended page

## 🚨 Troubleshooting

If tokens are still truncated:
1. Wait 10 minutes (Supabase caches templates)
2. Clear browser cache
3. Test with completely new email
4. Verify Site URL is exactly `https://devdapp.com`
5. Check server logs for detailed error messages

---

**🎯 Result**: Perfect email confirmation flow with full PKCE token preservation and seamless auto-login experience.
