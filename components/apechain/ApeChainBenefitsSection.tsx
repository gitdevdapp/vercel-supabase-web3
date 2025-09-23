import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Zap, Shield, Rocket, Clock, CheckCircle, TrendingUp } from "lucide-react";

export function ApeChainBenefitsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0 px-4 py-2 text-sm font-medium mb-4">
            🚀 Benefits
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Why choose our
            <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent"> ApeChain network </span>
            starter kit?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Skip months of setup and configuration. Start building on ApeChain with community-driven foundations and gaming-optimized infrastructure
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
                Clone, configure, and deploy your ApeChain dApp in minutes, not weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Pre-configured ApeChain connection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  APE token integration templates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  One-click Vercel deployment
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Community Security */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">99.9%</div>
              <CardTitle className="text-yellow-900 dark:text-yellow-100">Community Security</CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-300">
                Production-grade security patterns with community governance specifically designed for ApeChain applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  BAYC ecosystem security standards
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Community-driven security audits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Gaming-optimized smart contracts
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 10x Development Speed */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">10x</div>
              <CardTitle className="text-orange-900 dark:text-orange-100">Faster Development</CardTitle>
              <CardDescription className="text-orange-700 dark:text-orange-300">
                Skip the complexity of ApeChain integration and focus on building your unique gaming and NFT features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Pre-built APE components
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  NFT marketplace integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Gaming protocol templates
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Section */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Without Template */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">Building from Scratch</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Weeks setting up ApeChain network integration</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Complex APE token contract debugging</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>NFT marketplace development from zero</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Gaming protocol integration challenges</span>
                </li>
              </ul>
            </div>

            {/* With Template */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-orange-600 dark:text-orange-400">With ApeChain Starter Kit</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>5-minute clone and deploy process</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Pre-tested ApeChain connections</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Ready-to-use NFT marketplace templates</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Automatic BAYC ecosystem integration</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
