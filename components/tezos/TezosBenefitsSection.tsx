import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Zap, Shield, Rocket, Clock, CheckCircle, TrendingUp } from "lucide-react";

export function TezosBenefitsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 px-4 py-2 text-sm font-medium mb-4">
            🚀 Benefits
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Why choose our
            <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent"> Tezos network </span>
            starter kit?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Skip months of setup and configuration. Start building on Tezos network with institutional-grade foundations and formal verification
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Lightning Fast Start */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">5 mins</div>
              <CardTitle className="text-purple-900 dark:text-purple-100">Lightning Fast Start</CardTitle>
              <CardDescription className="text-purple-700 dark:text-purple-300">
                Clone, configure, and deploy your Tezos network dApp in minutes, not weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Pre-configured Tezos network connection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Smart contract templates with formal verification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Ethlink L2 scaling integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  One-click Vercel deployment
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Institutional Security */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">99.9%</div>
              <CardTitle className="text-indigo-900 dark:text-indigo-100">Institutional Security</CardTitle>
              <CardDescription className="text-indigo-700 dark:text-indigo-300">
                Production-grade security patterns with formal verification specifically designed for Tezos applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-indigo-700 dark:text-indigo-300 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Formal verification support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Temple Wallet security standards
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Mathematical proof of correctness
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Ethlink L2 scaling integration
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 10x Development Speed */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">10x</div>
              <CardTitle className="text-purple-900 dark:text-purple-100">Faster Development</CardTitle>
              <CardDescription className="text-purple-700 dark:text-purple-300">
                Skip the complexity of Tezos network integration and focus on building your unique features with governance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Pre-built Tezos components
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  SmartPy/LIGO integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  On-chain governance tools
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Justz DeFi infrastructure ready
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
                  <span>Weeks setting up Tezos network integration</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Complex Taquito SDK configuration and debugging</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Formal verification setup and learning curve</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>On-chain governance integration challenges</span>
                </li>
              </ul>
            </div>

            {/* With Template */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400">With Tezos Starter Kit</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>5-minute clone and deploy process</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Pre-tested Tezos network connections</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Formal verification templates included</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Automatic governance participation tools</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
