import { Wallet, Code, Shield, Zap, Database, Globe } from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Everything You Need to Build Web3 DApps
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From wallet integration to smart contract deployment, our AI-powered template handles it all.
          </p>
        </div>

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

          <div className="bg-background rounded-lg p-6 border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Decentralized Database</h3>
            <p className="text-muted-foreground">
              Store user data securely with blockchain-verified transactions. Full Web3 data management.
            </p>
          </div>

          <div className="bg-background rounded-lg p-6 border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Multi-Chain Support</h3>
            <p className="text-muted-foreground">
              Deploy to Ethereum, Polygon, Arbitrum, and more. One codebase, multiple blockchains.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
