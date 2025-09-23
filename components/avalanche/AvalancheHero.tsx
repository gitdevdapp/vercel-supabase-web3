import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, Rocket, ExternalLink, Github } from "lucide-react";

export function AvalancheHero() {
  return (
    <div className="flex flex-col gap-16 items-center py-20">
      <div className="flex flex-col items-center gap-8 max-w-4xl mx-auto text-center px-4">
        {/* Badge */}
        <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 px-4 py-2 text-sm font-medium">
          🏔️ Avalanche Developer Kit
        </Badge>

        {/* Main Headline */}
        <h1 className="text-4xl lg:text-6xl !leading-tight mx-auto max-w-4xl font-bold mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
          Build on Avalanche
          <br />
          <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
            Ship in Minutes
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl lg:text-2xl mx-auto max-w-3xl text-center text-muted-foreground mb-8 leading-relaxed">
          Production-ready Web3 development stack specifically designed for{" "}
          <span className="font-semibold text-red-600 dark:text-red-400">Avalanche network</span> applications.
          Deploy feature-rich dApps with subnet architecture, EVM compatibility, and enterprise-grade performance.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 px-4 py-2 rounded-full text-sm font-medium">
            <Zap className="h-4 w-4" />
            5-minute setup
          </div>
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 px-4 py-2 rounded-full text-sm font-medium">
            <Shield className="h-4 w-4" />
            Sub-second finality
          </div>
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 px-4 py-2 rounded-full text-sm font-medium">
            <Rocket className="h-4 w-4" />
            Subnet architecture
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            asChild
          >
            <a href="https://github.com/devdapp/vercel-supabase-web3" target="_blank" rel="noreferrer" className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              Get Avalanche Starter Kit
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="border-2 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 px-8 py-3 text-lg font-semibold"
            asChild
          >
            <a href="/wallet" className="flex items-center gap-2">
              View Live Demo
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Open source & free
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            Avalanche verified
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Enterprise ready
          </div>
        </div>
      </div>

      {/* Visual Elements */}
      <div className="relative w-full max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {/* Avalanche Network */}
          <div className="flex flex-col items-center p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 rounded-2xl border border-red-200 dark:border-red-800">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white font-bold text-lg">🏔️</span>
            </div>
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Avalanche Network</h3>
            <p className="text-sm text-red-700 dark:text-red-300 text-center">High-performance subnet architecture</p>
          </div>

          {/* Next.js + Vercel */}
          <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-2xl border border-blue-200 dark:border-blue-800">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white font-bold text-lg">▲</span>
            </div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Next.js + Vercel</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 text-center">Modern full-stack framework</p>
          </div>

          {/* Supabase */}
          <div className="flex flex-col items-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 bg-slate-500 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Supabase</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 text-center">Backend as a service</p>
          </div>
        </div>
      </div>
    </div>
  );
}
