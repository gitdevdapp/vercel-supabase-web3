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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { GitHubLoginButton } from "./GitHubLoginButton";

interface ImprovedUnifiedSignUpFormProps {
  className?: string;
  redirectTo?: string;
}

export function ImprovedUnifiedSignUpForm({
  className,
  redirectTo = '/protected/profile',
  ...props
}: ImprovedUnifiedSignUpFormProps & React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isClientMounted, setIsClientMounted] = useState(false);
  const router = useRouter();

  // Ensure client-side hydration is complete before showing Web3 options
  useEffect(() => {
    setIsClientMounted(true);
  }, []);

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

    // Basic password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
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

  const Web3OptionsSection = () => {
    if (!isClientMounted) return null;

    return (
      <div className="space-y-3">
        <div className="text-sm font-medium text-muted-foreground">
          Alternative Sign Up Methods
        </div>
        <div className="space-y-2">
          <GitHubLoginButton
            size="default"
            redirectTo={redirectTo}
            className="w-full"
          />
        </div>
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Create a new account using email or social authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Email/Password Form */}
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
                  placeholder="At least 6 characters"
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
                  placeholder="Repeat your password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign up with Email"}
              </Button>
            </div>
          </form>

          {/* Progressive Disclosure for Advanced Options */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="bg-background px-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showAdvanced ? 'Show fewer options' : 'More sign up options'}
              </button>
            </div>
          </div>

          {/* Advanced Authentication Options (Progressive Disclosure) */}
          {showAdvanced && (
            <div className="space-y-4 animate-in slide-in-from-top-2">
              <Web3OptionsSection />
            </div>
          )}

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline underline-offset-4">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
