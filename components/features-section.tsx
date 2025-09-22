import { Wallet, Code, Shield, Zap, Coins, Globe } from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-background rounded-lg p-6 border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Wallet Integration</h3>
            <p className="text-muted-foreground">
              Seamless connection with MetaMask, WalletConnect, and Coinbase Wallet. One-click authentication for Web3 users.
            </p>
          </div>

          <div className="bg-background rounded-lg p-6 border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI-Powered Templates</h3>
            <p className="text-muted-foreground">
              Pre-built components and smart contract templates. Let AI handle the boilerplate while you focus on innovation.
            </p>
          </div>

          <div className="bg-background rounded-lg p-6 border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Enterprise Security</h3>
            <p className="text-muted-foreground">
              Bank-grade security with Supabase&apos;s PostgreSQL and Row Level Security. Deploy with confidence.
            </p>
          </div>

          <div className="bg-background rounded-lg p-6 border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Instant Deployment</h3>
            <p className="text-muted-foreground">
              Deploy to production in minutes with Vercel&apos;s global CDN. Zero configuration, maximum performance.
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-lg p-6 border-2 border-orange-200 dark:border-orange-800 relative overflow-hidden">
            {/* Coming Soon Badge */}
            <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Coming Soon
            </div>
            
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
              <Coins className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-orange-900 dark:text-orange-100">Onchain Incentives</h3>
            <p className="text-orange-700 dark:text-orange-300">
              Earn rewards for making AI Starter Kits better.
            </p>
          </div>

          <div className="bg-background rounded-lg p-6 border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Multi-Chain Support</h3>
            <p className="text-muted-foreground">
              Deploy to Ethereum, Polygon, Base, Chainlink, and more. One codebase, multiple blockchains.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
