import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Globe, Zap, Shield, Layers } from "lucide-react";

export function FlowTechStackSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/50">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-gradient-to-r from-blue-500 to-teal-500 text-white border-0 px-4 py-2 text-sm font-medium mb-4">
            ⚡ Tech Stack
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Everything you need to build on
            <span className="bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent"> Flow blockchain</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our starter kit includes all the tools and integrations you need to build scalable, mainstream-ready dApps on Flow with resource-oriented programming.
          </p>
        </div>

        {/* Tech Stack Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Frontend & Framework */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-blue-900 dark:text-blue-100">Frontend & Framework</CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Modern React with Next.js 14+ and Flow Client Library (FCL) for seamless blockchain integration
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700 dark:text-blue-300">Next.js 14+ App Router</span>
                  <span className="text-blue-500 font-mono text-xs">Ready</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700 dark:text-blue-300">Flow Client Library (FCL)</span>
                  <span className="text-blue-500 font-mono text-xs">Ready</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700 dark:text-blue-300">TypeScript</span>
                  <span className="text-blue-500 font-mono text-xs">Ready</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700 dark:text-blue-300">Tailwind CSS</span>
                  <span className="text-blue-500 font-mono text-xs">Ready</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Blockchain & Smart Contracts */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 border-teal-200 dark:border-teal-800 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-teal-900 dark:text-teal-100">Cadence & Smart Contracts</CardTitle>
              <CardDescription className="text-teal-700 dark:text-teal-300">
                Cadence 1.5 resource-oriented programming with multi-role architecture and safety guarantees
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-teal-700 dark:text-teal-300">Cadence 1.5 Language</span>
                  <span className="text-teal-500 font-mono text-xs">Ready</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-teal-700 dark:text-teal-300">Resource-Oriented Programming</span>
                  <span className="text-teal-500 font-mono text-xs">Ready</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-teal-700 dark:text-teal-300">Flow CLI</span>
                  <span className="text-teal-500 font-mono text-xs">Ready</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-teal-700 dark:text-teal-300">Multi-Role Architecture</span>
                  <span className="text-teal-500 font-mono text-xs">Ready</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Database & Auth */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-blue-900 dark:text-blue-100">Auth & Infrastructure</CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Flow wallet authentication with built-in account model and robust database management
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700 dark:text-blue-300">Flow Wallet Authentication</span>
                  <span className="text-blue-500 font-mono text-xs">Ready</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700 dark:text-blue-300">Supabase Auth</span>
                  <span className="text-blue-500 font-mono text-xs">Ready</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700 dark:text-blue-300">PostgreSQL DB</span>
                  <span className="text-blue-500 font-mono text-xs">Ready</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700 dark:text-blue-300">Row Level Security</span>
                  <span className="text-blue-500 font-mono text-xs">Ready</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            Ready to build with resource-oriented programming? Get started with our production-ready template.
          </p>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-full font-semibold">
            <Zap className="h-5 w-5" />
            Deploy in 5 minutes
          </div>
        </div>
      </div>
    </section>
  );
}
