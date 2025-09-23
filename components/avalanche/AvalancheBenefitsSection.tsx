import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Zap, Shield, Rocket, Clock, CheckCircle, TrendingUp } from "lucide-react";

export function AvalancheBenefitsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 px-4 py-2 text-sm font-medium mb-4">
            🚀 Benefits
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Why choose our
            <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent"> Avalanche network </span>
            starter kit?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Skip months of setup and configuration. Start building on Avalanche with enterprise-grade foundations and subnet architecture
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Lightning Fast Start */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">5 mins</div>
              <CardTitle className="text-red-900 dark:text-red-100">Lightning Fast Start</CardTitle>
              <CardDescription className="text-red-700 dark:text-red-300">
                Clone, configure, and deploy your Avalanche dApp in minutes, not weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Pre-configured Avalanche connection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Subnet deployment templates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  One-click Vercel deployment
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Enterprise Security */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">99.9%</div>
              <CardTitle className="text-red-900 dark:text-red-100">Enterprise Security</CardTitle>
              <CardDescription className="text-red-700 dark:text-red-300">
                Production-grade security patterns with enterprise governance specifically designed for Avalanche applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Enterprise-grade consensus security
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Subnet-level security policies
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Sub-second finality guarantees
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 10x Development Speed */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-4">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">10x</div>
              <CardTitle className="text-red-900 dark:text-red-100">Faster Development</CardTitle>
              <CardDescription className="text-red-700 dark:text-red-300">
                Skip the complexity of Avalanche integration and focus on building your unique enterprise features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Pre-built Avalanche components
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Subnet deployment automation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Enterprise integration tools
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
                  <span>Weeks setting up Avalanche network integration</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Complex subnet deployment and configuration</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>EVM compatibility debugging challenges</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Enterprise security implementation</span>
                </li>
              </ul>
            </div>

            {/* With Template */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">With Avalanche Starter Kit</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>5-minute clone and deploy process</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Pre-tested Avalanche connections</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Ready-to-deploy subnet templates</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Automatic enterprise security deployment</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
