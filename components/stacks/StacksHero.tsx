import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, Rocket, ExternalLink, Github } from "lucide-react";

export function StacksHero() {
  return (
    <div className="flex flex-col gap-16 items-center py-20">
      <div className="flex flex-col items-center gap-8 max-w-4xl mx-auto text-center px-4">
        {/* Badge */}
        <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 px-4 py-2 text-sm font-medium">
          ₿ Stacks Developer Kit
        </Badge>

        {/* Main Headline */}
        <h1 className="text-4xl lg:text-6xl !leading-tight mx-auto max-w-4xl font-bold mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
          Build on Bitcoin Layer 2
          <br />
          <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Ship in Minutes
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl lg:text-2xl mx-auto max-w-3xl text-center text-muted-foreground mb-8 leading-relaxed">
          Production-ready Web3 development stack specifically designed for{" "}
          <span className="font-semibold text-orange-600 dark:text-orange-400">Stacks network</span> blockchain applications.
          Deploy Bitcoin-secured dApps with Clarity smart contracts, Proof of Transfer consensus, and STX stacking rewards.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-full text-sm font-medium">
            <Zap className="h-4 w-4" />
            5-minute setup
          </div>
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-full text-sm font-medium">
            <Shield className="h-4 w-4" />
            Bitcoin security
          </div>
          <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-full text-sm font-medium">
            <Rocket className="h-4 w-4" />
            Clarity contracts
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            asChild
          >
            <a href="https://github.com/vercel/next.js" target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-5 w-5" />
              Get Started
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950 px-8 py-3 text-lg font-semibold"
            asChild
          >
            <a href="https://docs.stacks.co/" target="_blank" rel="noopener noreferrer">
              View Documentation
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Bitcoin Layer 2 Secure
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            Proof of Transfer
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            STX Stacking Rewards
          </div>
        </div>
      </div>

      {/* Visual Element */}
      <div className="relative w-full max-w-5xl mx-auto px-4">
        <div className="relative bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-2xl p-8 backdrop-blur-sm border border-orange-200/20 dark:border-orange-800/20">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-2xl"></div>
          <div className="relative text-center">
            <h3 className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-4">
              Build the Bitcoin Economy
            </h3>
            <p className="text-orange-700 dark:text-orange-300 text-lg">
              Leverage Bitcoin&apos;s security model to build decentralized applications with predictable smart contracts and sustainable economics through STX stacking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
