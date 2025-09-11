export function HowItWorksSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Build Web3 DApps in 3 Simple Steps
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered template eliminates complexity. Focus on your vision, not infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-primary-foreground">
              1
            </div>
            <h3 className="text-xl font-semibold mb-4">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-6">
              Link your Web3 wallet and configure your project settings. AI handles the technical setup.
            </p>
            <div className="bg-muted rounded-lg p-4 text-left text-sm font-mono">
              <div className="text-muted-foreground">{`// One-click connection`}</div>
              <div className="text-foreground">await connectWallet(&apos;metamask&apos;)</div>
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-primary-foreground">
              2
            </div>
            <h3 className="text-xl font-semibold mb-4">Choose Your Template</h3>
            <p className="text-muted-foreground mb-6">
              Select from AI-generated templates: NFT marketplace, DeFi dashboard, DAO governance, and more.
            </p>
            <div className="bg-muted rounded-lg p-4 text-left text-sm font-mono">
              <div className="text-muted-foreground">{`// Template selection`}</div>
              <div className="text-foreground">npx create-dapp my-app --template nft</div>
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-primary-foreground">
              3
            </div>
            <h3 className="text-xl font-semibold mb-4">Deploy Instantly</h3>
            <p className="text-muted-foreground mb-6">
              Push to production with one command. Vercel&apos;s global infrastructure handles everything.
            </p>
            <div className="bg-muted rounded-lg p-4 text-left text-sm font-mono">
              <div className="text-muted-foreground">{`// Instant deployment`}</div>
              <div className="text-foreground">vercel --prod</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
