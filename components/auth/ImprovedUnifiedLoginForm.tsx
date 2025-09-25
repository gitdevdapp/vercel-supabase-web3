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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { GitHubLoginButton } from "./GitHubLoginButton";
import { Web3LoginButtons } from "./Web3LoginButtons";
import { isWeb3AuthEnabled } from "@/lib/utils/feature-flags";

interface ImprovedUnifiedLoginFormProps {
  className?: string;
  redirectTo?: string;
}

export function ImprovedUnifiedLoginForm({
  className,
  redirectTo = '/protected/profile',
  ...props
}: ImprovedUnifiedLoginFormProps & React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isClientMounted, setIsClientMounted] = useState(false);
  const router = useRouter();

  // Ensure client-side hydration is complete before showing Web3 options
  useEffect(() => {
    setIsClientMounted(true);
  }, []);

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

  const Web3OptionsSection = () => {
    if (!isClientMounted) return null;

    const web3Enabled = isWeb3AuthEnabled();

    return (
      <div className="space-y-3">
        <div className="text-sm font-medium text-muted-foreground">
          Alternative Sign In Methods
        </div>
        <div className="space-y-2">
          <GitHubLoginButton
            size="default"
            redirectTo={redirectTo}
            className="w-full"
          />
          {web3Enabled && (
            <Web3LoginButtons 
              layout="stack" 
              className="w-full"
              redirectTo={redirectTo}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Sign in to your account using email or social authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Email/Password Form */}
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
                {isLoading ? "Signing in..." : "Sign in with Email"}
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
                {showAdvanced ? 'Show fewer options' : 'More sign in options'}
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
