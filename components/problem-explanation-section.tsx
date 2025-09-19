import { CheckCircle, AlertTriangle } from "lucide-react";

export function ProblemExplanationSection() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-green-500 to-amber-500 bg-clip-text text-transparent leading-tight">
            Vibe coding apps is easy.<br />
            <span className="text-muted-foreground bg-gradient-to-r from-muted-foreground to-muted-foreground bg-clip-text">Vibe coding Dapps is hard.</span>
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-green-500 to-amber-500 mx-auto rounded-full"></div>
        </div>
        
        {/* Simplified Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Web2 - Simple */}
          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-8 border-2 border-green-200 dark:border-green-800 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">Web2 Apps</h3>
            <p className="text-lg text-green-600 dark:text-green-400">1 Day to MVP</p>
            <p className="text-green-600 dark:text-green-400">$0 to test</p>
          </div>

          {/* Web3 - Simple */}
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-8 border-2 border-amber-200 dark:border-amber-800 text-center">
            <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-300 mb-2">Web3 Dapps</h3>
            <p className="text-lg text-amber-600 dark:text-amber-400">Weeks of frustration</p>
            <p className="text-amber-600 dark:text-amber-400">Expert dependency</p>
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
