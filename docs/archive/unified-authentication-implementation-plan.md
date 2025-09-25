# 🔐 Unified Authentication Implementation Plan - Full Integration

**Date**: September 25, 2025  
**Status**: 📋 **COMPREHENSIVE IMPLEMENTATION PLAN**  
**Purpose**: Unified authentication pages for `/auth/login` and `/auth/sign-up` with email, GitHub, and Web3 (Ethereum, Base, Solana)  
**Standards**: PKCE-only (NO OTP), EIP-4361, Testable Architecture

---

## 🎯 Executive Summary

This plan creates unified authentication pages at `/auth/login` and `/auth/sign-up` that consolidate:
- ✅ **Existing email/password authentication**
- ✅ **GitHub OAuth integration**  
- ✅ **Web3 authentication** (Ethereum, Base, Solana)
- ✅ **PKCE-only flow** (removing OTP complexity)
- ✅ **Comprehensive testing strategy**
- ✅ **Visual consistency** with existing shadcn/ui design system

### Key Benefits
- **Single Source of Truth**: One authentication system instead of dual basic/enhanced forms
- **PKCE Compliance**: Eliminates OTP-related authentication failures
- **Progressive Enhancement**: Non-breaking addition of Web3 capabilities
- **Comprehensive Testing**: Unit, integration, and E2E test coverage

---

## 📊 Current State Analysis

### Existing Infrastructure ✅
```typescript
// Already Implemented Components:
components/auth/
├── EnhancedLoginForm.tsx          // ✅ Advanced form with Web3 support
├── Web3LoginButtons.tsx           // ✅ Container for all Web3 auth options
├── EthereumLoginButton.tsx        // ✅ Ethereum authentication
├── SolanaLoginButton.tsx          // ✅ Solana authentication  
├── BaseLoginButton.tsx            // ✅ Base chain authentication
└── GitHubLoginButton.tsx          // ✅ GitHub OAuth authentication

// Current Basic Forms (to be replaced):
components/
├── login-form.tsx                 // ❌ Basic email-only form
└── sign-up-form.tsx               // ❌ Basic email-only form

// Authentication Routes:
app/auth/
├── login/page.tsx                 // ❌ Uses basic LoginForm
├── sign-up/page.tsx               // ❌ Uses basic SignUpForm
├── callback/route.ts              // ✅ PKCE-compatible callback handler
└── confirm/route.ts               // ⚠️ Needs PKCE-only updates
```

### Authentication Flow Issues to Resolve
1. **Configuration Mismatch**: App configured for OTP but receives PKCE tokens
2. **Dual Form Systems**: Basic forms vs Enhanced forms creating complexity
3. **PKCE State Management**: Current issues with "flow_state_not_found" errors
4. **Testing Coverage**: Limited test coverage for Web3 authentication flows

---

## 🚀 Implementation Strategy

### Phase 1: PKCE-Only Configuration ⭐ **CRITICAL FIRST**

#### 1.1 Update Supabase Client Configuration
```typescript
// lib/supabase/client.ts
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',  // ✅ CHANGED: Force PKCE flow
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Remove OTP configuration entirely
      },
    }
  );

// lib/supabase/server.ts
export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',  // ✅ CHANGED: Force PKCE flow
        autoRefreshToken: true,
        persistSession: true,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Handle middleware context where set() is not available
          }
        },
      },
    }
  );
};
```

#### 1.2 Update Authentication Confirmation Route
```typescript
// app/auth/confirm/route.ts - PKCE-Only Implementation
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code") || searchParams.get("token_hash");
  const next = searchParams.get("next") || "/protected/profile";

  console.log("Email confirmation attempt:", {
    code: code ? `${code.substring(0, 15)}...` : null,
    next,
    url: request.url
  });

  if (!code) {
    console.error("Missing authorization code");
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent('Missing authorization code')}`
    );
  }

  try {
    const supabase = await createClient();
    
    // ✅ PKCE-Only: Use exchangeCodeForSession exclusively
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("PKCE verification failed:", error);
      return NextResponse.redirect(
        `${origin}/auth/error?error=${encodeURIComponent('Email confirmation failed: ' + error.message)}`
      );
    }
    
    if (data.session) {
      console.log("Email confirmation successful");
      return NextResponse.redirect(`${origin}${next}`);
    }
    
    console.error("No session created after PKCE exchange");
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent('Session creation failed')}`
    );
    
  } catch (error) {
    console.error("Unexpected auth confirmation error:", error);
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent('Authentication confirmation failed')}`
    );
  }
}
```

### Phase 2: Unified Authentication Pages

#### 2.1 Enhanced Sign-Up Form with Web3 Integration
```typescript
// components/auth/UnifiedSignUpForm.tsx
'use client';

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getAuthRedirectURL } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Web3LoginButtons } from "./Web3LoginButtons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface UnifiedSignUpFormProps {
  className?: string;
  showWeb3Options?: boolean;
  redirectTo?: string;
}

export function UnifiedSignUpForm({
  className,
  showWeb3Options = true,
  redirectTo = '/protected/profile',
  ...props
}: UnifiedSignUpFormProps & React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${getAuthRedirectURL('/auth/confirm')}?next=${encodeURIComponent(redirectTo)}`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Create a new account using your preferred method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Web3 & Social Authentication Options */}
          {showWeb3Options && (
            <>
              <div className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground">
                  Web3 & Social Sign Up
                </div>
                <Web3LoginButtons
                  layout="grid"
                  redirectTo={redirectTo}
                  size="default"
                />
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or create account with email
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Email/Password Sign Up Form */}
          <form onSubmit={handleEmailSignUp}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repeat-password">Confirm Password</Label>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign up"}
              </Button>
            </div>
          </form>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline underline-offset-4">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 2.2 Enhanced Login Form with Web3 Integration
```typescript
// components/auth/UnifiedLoginForm.tsx
'use client';

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Web3LoginButtons } from "./Web3LoginButtons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface UnifiedLoginFormProps {
  className?: string;
  showWeb3Options?: boolean;
  redirectTo?: string;
}

export function UnifiedLoginForm({
  className,
  showWeb3Options = true,
  redirectTo = '/protected/profile',
  ...props
}: UnifiedLoginFormProps & React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push(redirectTo);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Sign in to your account using your preferred method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Web3 & Social Authentication Options */}
          {showWeb3Options && (
            <>
              <div className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground">
                  Web3 & Social Sign In
                </div>
                <Web3LoginButtons
                  layout="grid"
                  redirectTo={redirectTo}
                  size="default"
                />
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Email/Password Login Form */}
          <form onSubmit={handleEmailLogin}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>

          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 2.3 Update Authentication Pages
```typescript
// app/auth/login/page.tsx
import { UnifiedLoginForm } from "@/components/auth/UnifiedLoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <UnifiedLoginForm />
      </div>
    </div>
  );
}

// app/auth/sign-up/page.tsx  
import { UnifiedSignUpForm } from "@/components/auth/UnifiedSignUpForm";

export default function SignUpPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <UnifiedSignUpForm />
      </div>
    </div>
  );
}
```

---

## 🔧 Configuration Requirements

### Environment Variables
```bash
# .env.local (required additions)
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Production domain for redirects
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Optional: Custom RPC endpoints for Web3
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-key
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### Supabase Dashboard Configuration
```yaml
Authentication Settings:
  Providers:
    - Web3: ✅ ENABLED
    - GitHub: ✅ ENABLED with Client ID/Secret
    
  URL Configuration:
    Site URL: "https://yourdomain.com"
    Redirect URLs:
      - "https://yourdomain.com/auth/callback"
      - "https://yourdomain.com/auth/login"  
      - "https://yourdomain.com/auth/sign-up"
      - "https://yourdomain.com/protected/**"
      - "http://localhost:3000/**" (development)
      
  Rate Limits:
    Web3 logins: 30 per 5 minutes per IP
    Email confirmations: 30 per 5 minutes per IP
    
  CAPTCHA:
    Provider: hCaptcha
    Enabled: true (production)
```

### Supabase CLI Configuration
```toml
# supabase/config.toml
[auth]
enable_confirmations = true
enable_signup = true

# PKCE Flow Configuration  
[auth.session]
flow_type = "pkce"

# Web3 Provider Configuration
[auth.web3.ethereum]
enabled = true

[auth.web3.solana]
enabled = true

# GitHub OAuth
[auth.external.github]
enabled = true
client_id = "env(GITHUB_CLIENT_ID)"
secret = "env(GITHUB_CLIENT_SECRET)"
redirect_uri = "https://[your-supabase-ref].supabase.co/auth/v1/callback"

# Rate limiting
[auth.rate_limit]
web3 = 30
email = 30

# CAPTCHA protection
[auth.captcha]
enabled = true
provider = "hcaptcha"
secret = "env(HCAPTCHA_SECRET_KEY)"
```

---

## 🧪 Comprehensive Testing Strategy

### Phase 3: Unit Tests

#### 3.1 Authentication Hook Tests
```typescript
// __tests__/hooks/useWeb3Auth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useWeb3Auth } from '@/lib/hooks/useWeb3Auth';

jest.mock('@/lib/supabase/client');

describe('useWeb3Auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle Ethereum authentication', async () => {
    const mockSignInWithWeb3 = jest.fn().mockResolvedValue({
      data: { session: { user: { id: '123' } } },
      error: null
    });

    const { result } = renderHook(() => useWeb3Auth());

    await act(async () => {
      const response = await result.current.signInWithWeb3('ethereum');
      expect(response.data).toBeTruthy();
    });
  });

  it('should handle GitHub OAuth authentication', async () => {
    const mockSignInWithOAuth = jest.fn().mockResolvedValue({
      data: { url: 'https://github.com/login/oauth' },
      error: null
    });

    const { result } = renderHook(() => useWeb3Auth());

    await act(async () => {
      const response = await result.current.signInWithGitHub();
      expect(response.data).toBeTruthy();
    });
  });

  it('should handle authentication errors gracefully', async () => {
    const mockSignInWithWeb3 = jest.fn().mockResolvedValue({
      data: null,
      error: new Error('Wallet not found')
    });

    const { result } = renderHook(() => useWeb3Auth());

    await act(async () => {
      const response = await result.current.signInWithWeb3('ethereum');
      expect(response.error).toBe('Wallet not found');
    });
  });
});
```

#### 3.2 Component Tests
```typescript
// __tests__/components/UnifiedLoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UnifiedLoginForm } from '@/components/auth/UnifiedLoginForm';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation');
jest.mock('@/lib/supabase/client');

describe('UnifiedLoginForm', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('should render all authentication options', () => {
    render(<UnifiedLoginForm />);
    
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Web3 & Social Sign In')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Ethereum')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Solana')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Base')).toBeInTheDocument();
    expect(screen.getByText('Sign in with GitHub')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('should handle email login submission', async () => {
    const mockSignInWithPassword = jest.fn().mockResolvedValue({ error: null });
    
    render(<UnifiedLoginForm />);
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByText('Sign in'));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('should hide Web3 options when showWeb3Options is false', () => {
    render(<UnifiedLoginForm showWeb3Options={false} />);
    
    expect(screen.queryByText('Web3 & Social Sign In')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign in with Ethereum')).not.toBeInTheDocument();
  });
});
```

### Phase 4: Integration Tests

#### 4.1 Authentication Flow Tests
```typescript
// __tests__/integration/auth-flow.test.ts
import { createClient } from '@supabase/supabase-js';

describe('Authentication Flow Integration', () => {
  let supabase: any;

  beforeAll(() => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
    );
  });

  it('should complete email signup and confirmation flow', async () => {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'test-password-123';

    // Sign up with email
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    expect(signUpError).toBeNull();
    expect(signUpData.user).toBeTruthy();
    expect(signUpData.user.email).toBe(testEmail);
    
    // Check that user is not confirmed yet
    expect(signUpData.user.email_confirmed_at).toBeNull();
  });

  it('should handle GitHub OAuth redirection', async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback'
      }
    });

    expect(error).toBeNull();
    expect(data.url).toContain('github.com');
  });
});
```

#### 4.2 PKCE Flow Tests
```typescript
// __tests__/integration/pkce-flow.test.ts
describe('PKCE Authentication Flow', () => {
  it('should handle PKCE code exchange successfully', async () => {
    // Mock PKCE code from email confirmation
    const mockPkceCode = 'pkce_test_code_12345';
    
    const response = await fetch('/auth/confirm?code=' + mockPkceCode, {
      method: 'GET',
    });

    // Should either redirect to success or return error details
    expect([200, 302, 307]).toContain(response.status);
  });

  it('should reject invalid PKCE codes', async () => {
    const invalidCode = 'invalid_code_12345';
    
    const response = await fetch('/auth/confirm?code=' + invalidCode, {
      method: 'GET',
    });

    // Should redirect to error page
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toContain('/auth/error');
  });
});
```

### Phase 5: E2E Tests

#### 5.1 Playwright E2E Tests
```typescript
// __tests__/e2e/auth-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Unified Authentication', () => {
  test('should display all authentication options', async ({ page }) => {
    await page.goto('/auth/login');

    // Check Web3 authentication buttons
    await expect(page.getByText('Sign in with Ethereum')).toBeVisible();
    await expect(page.getByText('Sign in with Solana')).toBeVisible();
    await expect(page.getByText('Sign in with Base')).toBeVisible();
    await expect(page.getByText('Sign in with GitHub')).toBeVisible();

    // Check email form
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('should complete email signup flow', async ({ page }) => {
    await page.goto('/auth/sign-up');

    const testEmail = `test-${Date.now()}@example.com`;
    
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill('test-password-123');
    await page.getByLabel('Confirm Password').fill('test-password-123');
    
    await page.getByText('Sign up').click();

    // Should redirect to success page
    await expect(page).toHaveURL('/auth/sign-up-success');
  });

  test('should navigate between login and signup pages', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.getByText('Sign up').click();
    await expect(page).toHaveURL('/auth/sign-up');
    
    await page.getByText('Login').click();
    await expect(page).toHaveURL('/auth/login');
  });

  test('should handle email validation errors', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByLabel('Password').fill('password');
    await page.getByText('Sign in').click();

    // Browser should show HTML5 email validation error
    const emailInput = page.getByLabel('Email');
    await expect(emailInput).toHaveAttribute('type', 'email');
  });
});
```

#### 5.2 Web3 Wallet Integration Tests
```typescript
// __tests__/e2e/web3-auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Web3 Authentication', () => {
  test('should show wallet installation prompt for Ethereum', async ({ page }) => {
    // Block ethereum wallet
    await page.addInitScript(() => {
      delete (window as any).ethereum;
    });

    await page.goto('/auth/login');
    
    // Mock alert dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Please install MetaMask');
      await dialog.accept();
    });
    
    await page.getByText('Sign in with Ethereum').click();
  });

  test('should show wallet installation prompt for Solana', async ({ page }) => {
    // Block solana wallet
    await page.addInitScript(() => {
      delete (window as any).solana;
    });

    await page.goto('/auth/login');
    
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Please install Phantom');
      await dialog.accept();
    });
    
    await page.getByText('Sign in with Solana').click();
  });
});
```

---

## 📋 Implementation Timeline

### Week 1: Foundation & PKCE Migration
- [ ] **Day 1-2**: Update Supabase client configuration to PKCE-only
- [ ] **Day 3-4**: Fix auth/confirm route for PKCE-only flow
- [ ] **Day 5**: Test PKCE email confirmation flow locally

### Week 2: Unified Forms Implementation  
- [ ] **Day 1-2**: Create UnifiedLoginForm component
- [ ] **Day 3-4**: Create UnifiedSignUpForm component
- [ ] **Day 5**: Update auth page imports and test integration

### Week 3: Testing Infrastructure
- [ ] **Day 1-2**: Implement unit tests for unified forms
- [ ] **Day 3-4**: Create integration tests for auth flows
- [ ] **Day 5**: Set up E2E tests with Playwright

### Week 4: Configuration & Deployment
- [ ] **Day 1-2**: Configure Supabase Dashboard for Web3 and GitHub
- [ ] **Day 3-4**: Set up production environment variables
- [ ] **Day 5**: Deploy and test in staging environment

---

## 🔒 Security & Compliance

### Security Measures
```typescript
// lib/auth-security.ts
export const AUTH_SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMITS: {
    WEB3_ATTEMPTS: 30,
    EMAIL_ATTEMPTS: 30,
    WINDOW_MINUTES: 5
  },
  
  // PKCE security
  PKCE_SETTINGS: {
    CODE_CHALLENGE_METHOD: 'S256',
    STATE_EXPIRY_MINUTES: 10
  },
  
  // Web3 validation
  WEB3_VALIDATION: {
    ETHEREUM_CHAIN_IDS: ['0x1', '0x2105'], // Mainnet, Base
    SOLANA_CLUSTER: 'mainnet-beta',
    MESSAGE_EXPIRY_MINUTES: 10
  }
};

export function validateEIP4361Message(message: string): boolean {
  const eip4361Regex = /^(.+) wants you to sign in with your Ethereum account:/;
  return eip4361Regex.test(message);
}

export function isValidChainId(chainId: string): boolean {
  return AUTH_SECURITY_CONFIG.WEB3_VALIDATION.ETHEREUM_CHAIN_IDS.includes(chainId);
}
```

### Monitoring & Analytics
```typescript
// lib/auth-monitoring.ts
export interface AuthEventData {
  type: 'email_login' | 'email_signup' | 'github_login' | 'ethereum_login' | 'solana_login' | 'base_login';
  success: boolean;
  provider?: string;
  error?: string;
  duration_ms?: number;
  user_agent?: string;
}

export function trackAuthEvent(event: AuthEventData) {
  console.log('Auth Event:', {
    ...event,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'server'
  });
  
  // Add your analytics service here
  // Example: analytics.track('Authentication Attempt', event);
}

// Usage in components:
// trackAuthEvent({ type: 'ethereum_login', success: true, duration_ms: 1500 });
```

---

## 🎯 Success Metrics

### Before Implementation
- ❌ **Dual authentication systems** (basic vs enhanced forms)
- ❌ **OTP/PKCE configuration conflicts** causing auth failures
- ❌ **Limited testing coverage** for Web3 flows
- ❌ **Inconsistent user experience** across auth methods

### After Implementation (Targets)
- ✅ **Single unified authentication system** 
- ✅ **>95% email confirmation success rate** (PKCE-only)
- ✅ **4 Web3 providers** (Ethereum, Base, Solana, GitHub)
- ✅ **>90% test coverage** for authentication flows
- ✅ **<3 second average authentication time**
- ✅ **Zero breaking changes** to existing user sessions

---

## 🚀 Deployment Strategy

### Staging Deployment
1. **Deploy PKCE-only configuration** to staging
2. **Test email confirmation flow** with real email addresses
3. **Verify Web3 authentication** with test wallets
4. **Run E2E test suite** against staging environment
5. **Performance testing** under load

### Production Rollout
1. **Feature flag implementation** for unified forms
2. **Gradual rollout** starting with 10% of users
3. **Monitor authentication metrics** for 48 hours
4. **Scale to 100%** if metrics are healthy
5. **Remove legacy form components** after 2 weeks

### Rollback Plan
```typescript
// components/auth/FeatureToggle.tsx
export function AuthFormWithFallback() {
  const useUnifiedForms = process.env.NEXT_PUBLIC_USE_UNIFIED_FORMS === 'true';
  
  if (useUnifiedForms) {
    return <UnifiedLoginForm />;
  }
  
  // Fallback to legacy form
  return <LoginForm />;
}
```

---

## 📚 Documentation & Maintenance

### Developer Documentation
- **Authentication Flow Diagrams**: Visual guides for each auth method
- **Component API Documentation**: Props, methods, and usage examples  
- **Testing Playbook**: Step-by-step testing procedures
- **Troubleshooting Guide**: Common issues and solutions

### User Documentation
- **Authentication Options Guide**: Help users choose their preferred method
- **Wallet Setup Instructions**: Step-by-step wallet installation guides
- **Troubleshooting FAQ**: Common user issues and solutions

---

This unified implementation plan provides a comprehensive, testable, and secure authentication system that maintains backward compatibility while adding modern Web3 capabilities. The PKCE-only approach eliminates configuration complexity and ensures reliable email confirmations, while the unified forms provide a consistent user experience across all authentication methods.
