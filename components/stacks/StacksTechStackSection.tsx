import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Globe, Zap, Shield, Coins } from "lucide-react";

export function StacksTechStackSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-orange-50/50 to-transparent dark:from-orange-950/50">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 px-4 py-2 text-sm font-medium mb-4">
            ⚡ Tech Stack
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Everything you need to build on
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent"> Bitcoin Layer 2</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our starter kit includes all the tools and integrations you need to build secure, scalable dApps on the Stacks network with Bitcoin-backed security.
          </p>
        </div>

        {/* Tech Stack Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Frontend & Framework */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-orange-900 dark:text-orange-100">Frontend & Framework</CardTitle>
              <CardDescription className="text-orange-700 dark:text-orange-300">
                Modern React with Next.js 14+ and Stacks.js integration for seamless Bitcoin Layer 2 development
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-700 dark:text-orange-300">Next.js 14+ App Router</span>
                  <span className="text-orange-500 font-mono text-xs">Ready</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-700 dark:text-orange-300">Stacks.js SDK</span>
                  <span className="text-orange-500 font-mono text-xs">Ready</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-700 dark:text-orange-300">TypeScript</span>
                  <span className="text-orange-500 font-mono text-xs">Ready</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-700 dark:text-orange-300">Tailwind CSS</span>
                  <span className="text-orange-500 font-mono text-xs">Ready</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Blockchain & Smart Contracts */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-amber-900 dark:text-amber-100">Bitcoin & Smart Contracts</CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300">
                Clarity smart contracts with Bitcoin security and Proof of Transfer consensus mechanism
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-700 dark:text-amber-300">Clarity Language</span>
                  <span className="text-amber-500 font-mono text-xs">Ready</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-700 dark:text-amber-300">Bitcoin Integration</span>
                  <span className="text-amber-500 font-mono text-xs">Ready</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-700 dark:text-amber-300">STX Token Support</span>
                  <span className="text-amber-500 font-mono text-xs">Ready</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-700 dark:text-amber-300">Proof of Transfer</span>
                  <span className="text-amber-500 font-mono text-xs">Ready</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Database & Auth */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-orange-900 dark:text-orange-100">Auth & Infrastructure</CardTitle>
              <CardDescription className="text-orange-700 dark:text-orange-300">
                Secure authentication with Hiro Wallet and robust database management with Supabase
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-700 dark:text-orange-300">Hiro Wallet</span>
                  <span className="text-orange-500 font-mono text-xs">Ready</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-700 dark:text-orange-300">Supabase Auth</span>
                  <span className="text-orange-500 font-mono text-xs">Ready</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-700 dark:text-orange-300">PostgreSQL DB</span>
                  <span className="text-orange-500 font-mono text-xs">Ready</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-700 dark:text-orange-300">Row Level Security</span>
                  <span className="text-orange-500 font-mono text-xs">Ready</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            Ready to build on Bitcoin Layer 2? Get started with our production-ready template.
          </p>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-full font-semibold">
            <Zap className="h-5 w-5" />
            Deploy in 5 minutes
          </div>
        </div>
      </div>
    </section>
  );
}
