import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Zap, Shield, Rocket, Clock, CheckCircle, TrendingUp } from "lucide-react";

export function FlowBenefitsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-gradient-to-r from-blue-500 to-teal-500 text-white border-0 px-4 py-2 text-sm font-medium mb-4">
            🚀 Benefits
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Why choose our
            <span className="bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent"> Flow blockchain </span>
            starter kit?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Skip months of setup and configuration. Start building on Flow with resource-oriented programming foundations and multi-role architecture
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Lightning Fast Start */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">5 mins</div>
              <CardTitle className="text-blue-900 dark:text-blue-100">Lightning Fast Start</CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Clone, configure, and deploy your Flow dApp in minutes, not weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Pre-configured Flow network connection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Cadence 1.5 smart contract templates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  One-click Vercel deployment
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  FCL authentication ready
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Resource-Oriented Safety */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 border-teal-200 dark:border-teal-800 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">🔒</div>
              <CardTitle className="text-teal-900 dark:text-teal-100">Resource-Oriented Safety</CardTitle>
              <CardDescription className="text-teal-700 dark:text-teal-300">
                Cadence&apos;s resource model prevents duplication and ensures asset safety at the language level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-teal-700 dark:text-teal-300 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Resource cannot be copied or lost
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Linear type system for assets
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Capability-based access control
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Pre and post-conditions
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Proven at Scale */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">14M+</div>
              <CardTitle className="text-blue-900 dark:text-blue-100">Proven at Scale</CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Battle-tested by NBA Top Shot with millions of users and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  NBA Top Shot success story
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  14M+ accounts created
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Multi-role architecture
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Mainstream adoption ready
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Section */}
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950 dark:to-teal-950 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4">
              Why Flow over other smart contract platforms?
            </h3>
            <p className="text-blue-700 dark:text-blue-300">
              Built specifically for mainstream adoption with unique architectural advantages
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Resource-Oriented Programming</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Cadence 1.5&apos;s linear type system ensures digital assets cannot be copied, lost, or accidentally destroyed
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-teal-900 dark:text-teal-100 mb-2">Multi-Role Architecture</h4>
              <p className="text-sm text-teal-700 dark:text-teal-300">
                Separation of consensus, computation, verification, and storage enables horizontal scaling
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Developer Experience</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Built-in account model, upgradeable contracts, and human-readable transaction signatures
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-full font-semibold">
              <Clock className="h-5 w-5" />
              Start building for mainstream adoption today
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
