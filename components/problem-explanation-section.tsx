import { CheckCircle, Clock, DollarSign, AlertTriangle, Users, HelpCircle } from "lucide-react";

export function ProblemExplanationSection() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 leading-tight">
            Vibe coding <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent font-bold">apps</span> is <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent font-bold">easy</span>.<br />
            <span className="text-muted-foreground">Vibe coding <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent font-bold text-foreground">dApps</span> is <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent font-bold text-foreground">hard</span>.</span>
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-green-500 to-amber-500 mx-auto rounded-full"></div>
        </div>
        
        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Web2 Card - Positive */}
          <div className="bg-background rounded-lg p-6 lg:p-8 border border-green-200 dark:border-green-800 relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-500/5 rounded-full translate-y-8 -translate-x-8"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Web2 Development</h3>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Simple & Fast</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                  <span className="text-foreground font-medium">1 Day to MVP</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                  <span className="text-foreground">Single &quot;Developer&quot; can make a complete SaaS application</span>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                  <span className="text-foreground">$0 to test idea on production grade infra</span>
                </div>
              </div>
              
              <div className="mt-auto p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300 font-medium text-center">
                  ✨ <span className="font-bold">Ship fast</span>, iterate quickly, scale seamlessly
                </p>
              </div>
            </div>
          </div>

          {/* Web3 Card - Warning */}
          <div className="bg-background rounded-lg p-6 lg:p-8 border border-amber-200 dark:border-amber-800 relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-amber-500/5 rounded-full translate-y-8 -translate-x-8"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Web3 Development</h3>
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Complex & Costly</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                  <span className="text-foreground font-medium">Weeks of Frustration</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                  <span className="text-foreground">Web3 &quot;Experts&quot; Only</span>
                </div>
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                  <span className="text-foreground">$$? How do I &quot;get gas&quot;</span>
                </div>
              </div>
              
              <div className="mt-auto p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-300 font-medium text-center">
                  ⚠️ <span className="font-bold">Steep learning curve</span>, hidden costs, expert dependency
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bridge to Solution */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full">
            <span className="text-lg font-semibold text-primary">
              DevDapp makes Web3 development as easy as Web2
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
