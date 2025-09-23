import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Zap, Shield, Rocket, Clock, CheckCircle, TrendingUp } from "lucide-react";

export function StacksBenefitsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 px-4 py-2 text-sm font-medium mb-4">
            🚀 Benefits
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Why choose our
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent"> Stacks network </span>
            starter kit?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Skip months of setup and configuration. Start building on Bitcoin Layer 2 with Bitcoin-secured foundations and Clarity smart contracts
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Lightning Fast Start */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">5 mins</div>
              <CardTitle className="text-orange-900 dark:text-orange-100">Lightning Fast Start</CardTitle>
              <CardDescription className="text-orange-700 dark:text-orange-300">
                Clone, configure, and deploy your Bitcoin Layer 2 dApp in minutes, not weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Pre-configured Stacks network connection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Clarity smart contract templates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  One-click Vercel deployment
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Bitcoin integration ready
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Bitcoin Security */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">₿</div>
              <CardTitle className="text-amber-900 dark:text-amber-100">Bitcoin-Secured Infrastructure</CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300">
                Inherit Bitcoin&apos;s security model through Proof of Transfer consensus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Proof of Transfer (PoX) consensus
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Bitcoin finality anchoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  STX stacking rewards in BTC
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Microblock fast confirmations
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Clarity Advantage */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">100%</div>
              <CardTitle className="text-orange-900 dark:text-orange-100">Predictable Smart Contracts</CardTitle>
              <CardDescription className="text-orange-700 dark:text-orange-300">
                Clarity language prevents runtime errors and provides complete decidability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  No runtime surprises or failures
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Complete static analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Post-conditions and preconditions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Atomic transaction guarantees
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Section */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 rounded-2xl p-8 border border-orange-200 dark:border-orange-800">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-4">
              Why Stacks over other Bitcoin solutions?
            </h3>
            <p className="text-orange-700 dark:text-orange-300">
              Built specifically for Bitcoin Layer 2 with unique advantages
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Native Bitcoin Security</h4>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Only Layer 2 with Proof of Transfer that directly inherits Bitcoin&apos;s security through block production
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Sustainable Economics</h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                STX holders earn Bitcoin rewards through stacking, creating sustainable tokenomics aligned with Bitcoin
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Mature Ecosystem</h4>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                5+ years of development with proven DeFi protocols, NFT marketplaces, and institutional adoption
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-full font-semibold">
              <Clock className="h-5 w-5" />
              Start building on Bitcoin Layer 2 today
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
