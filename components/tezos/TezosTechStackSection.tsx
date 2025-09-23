import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Database, Wallet, Github, ExternalLink } from "lucide-react";

export function TezosTechStackSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 px-4 py-2 text-sm font-medium mb-4">
            🛠 Tech Stack
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Battle-tested tools for
            <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent"> Tezos network </span>
            development
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Carefully selected technologies optimized for Tezos blockchain applications with formal verification and on-chain governance
          </p>
        </div>

        {/* Three Main Stack Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Frontend & Hosting */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <Badge className="bg-blue-500 text-white text-xs">Frontend</Badge>
              </div>
              <CardTitle className="text-blue-900 dark:text-blue-100">Next.js + Vercel</CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Modern React framework with optimized deployment for Tezos network dApps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <li>• App Router with server components</li>
                <li>• Tailwind CSS + Shadcn/ui</li>
                <li>• TypeScript for type safety</li>
                <li>• Optimized for Web3 interactions</li>
              </ul>
            </CardContent>
          </Card>

          {/* Backend & Database */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <Badge className="bg-green-500 text-white text-xs">Backend</Badge>
              </div>
              <CardTitle className="text-green-900 dark:text-green-100">Supabase</CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Instant Postgres database with authentication and real-time features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-2">
                <li>• PostgreSQL with instant APIs</li>
                <li>• Built-in authentication system</li>
                <li>• Real-time subscriptions</li>
                <li>• ROW-level security policies</li>
              </ul>
            </CardContent>
          </Card>

          {/* Tezos Integration */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <Badge className="bg-purple-500 text-white text-xs">Web3</Badge>
              </div>
              <CardTitle className="text-purple-900 dark:text-purple-100">Tezos Network</CardTitle>
              <CardDescription className="text-purple-700 dark:text-purple-300">
                Native Tezos blockchain integration with smart contract and governance support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-2">
                <li>• Taquito SDK for smart contracts</li>
                <li>• Temple Wallet integration</li>
                <li>• SmartPy/LIGO development tools</li>
                <li>• On-chain governance participation</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Reference Repository Card */}
        <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-700 dark:bg-slate-300 rounded-xl flex items-center justify-center">
                  <Github className="h-6 w-6 text-white dark:text-slate-700" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Tezos Network Starter Template</h3>
                  <p className="text-muted-foreground">
                    Complete example implementation with Tezos network integration, smart contracts, formal verification, and production deployment
                  </p>
                </div>
              </div>
              <Button 
                className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 font-medium"
                asChild
              >
                <a href="https://github.com/devdapp/vercel-supabase-web3" target="_blank" rel="noreferrer" className="flex items-center gap-2">
                  View on GitHub
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
