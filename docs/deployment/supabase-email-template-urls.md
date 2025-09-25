# Supabase Email Template URLs - Copy/Paste Reference

## Confirm Signup
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/protected/profile
```

## Invite User
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/auth/sign-up
```

## Magic Link
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next=/protected/profile
```

## Change Email Address
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change&next=/protected/profile
```

## Reset Password
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password
```

## Reauthentication
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=reauthentication&next=/protected/profile
```
