'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Lock, Sparkles, Rocket, CheckCircle2, ArrowRight } from 'lucide-react'

export function GuideLockedView() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 mb-6">
            <Lock className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Complete Setup Guide
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Deploy a production-ready multi-chain Web3 dApp in under 60 minutes using Cursor AI. 
            Copy-paste prompts, no coding required.
          </p>

          {/* Sign Up CTA */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-2xl p-8 mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Create Your Free Account</h2>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Get instant access to our step-by-step copy-paste builder guide
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/auth/sign-up">
                  <Rocket className="w-5 h-5 mr-2" />
                  Sign Up Free
                </Link>
              </Button>
              
              <Button asChild size="lg" variant="outline" className="text-lg px-8">
                <Link href="/auth/login">
                  Already have an account? Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* What You'll Get */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">What You&apos;ll Build</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-border bg-card rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Full-Stack Web3 App</h3>
                  <p className="text-muted-foreground text-sm">
                    Complete authentication system with user profiles and image upload
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-border bg-card rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">6+ Blockchain Networks</h3>
                  <p className="text-muted-foreground text-sm">
                    Support for Avalanche, Flow, Tezos, ApeChain, Stacks, and ROOT
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-border bg-card rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Live on the Internet</h3>
                  <p className="text-muted-foreground text-sm">
                    Deployed on Vercel with Supabase backend - production ready
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-border bg-card rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">AI-Powered Setup</h3>
                  <p className="text-muted-foreground text-sm">
                    Cursor AI handles all commands - just copy, paste, and approve
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Preview */}
        <div className="mb-12 bg-muted/50 border border-border rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">How Our Guide Works</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <p className="font-medium text-foreground">Copy Cursor AI Prompts</p>
                <p className="text-sm text-muted-foreground">Each step shows a prompt in a blue box - just click &quot;Copy&quot;</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <p className="font-medium text-foreground">Paste in Cursor AI</p>
                <p className="text-sm text-muted-foreground">Open Cursor chat (Cmd/Ctrl+L) and paste the prompt</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <p className="font-medium text-foreground">Cursor Does the Work</p>
                <p className="text-sm text-muted-foreground">AI executes platform-specific commands - you just approve</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <p className="font-medium text-foreground">Move to Next Step</p>
                <p className="text-sm text-muted-foreground">Progress bar tracks your journey from 0% to 100%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Prerequisites */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">What You&apos;ll Need</h2>
          
          <div className="bg-card border border-border rounded-xl p-6">
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-foreground"><strong>Cursor AI</strong> - <a href="https://cursor.sh" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Download free</a></span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-foreground"><strong>Mac</strong> (preferred OS)</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-foreground"><strong>GitHub Account</strong> (free)</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-foreground"><strong>Vercel Account</strong> (free)</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-foreground"><strong>Supabase Account</strong> (free)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div className="inline-block bg-gradient-to-r from-primary to-primary/60 p-1 rounded-2xl">
            <div className="bg-background rounded-xl px-12 py-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Build Your Web3 App?</h2>
              <p className="text-muted-foreground mb-6">
                Join developers building production-ready dApps in under 60 minutes
              </p>
              
              <Button asChild size="lg" className="text-lg px-10">
                <Link href="/auth/sign-up">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              
              <p className="text-sm text-muted-foreground mt-4">
                Already have an account? <Link href="/auth/login" className="underline hover:text-primary">Sign in here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
