export function HowItWorksSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Build dApps in 3 Simple Steps
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
            <h3 className="text-xl font-semibold mb-4">Clone</h3>
            <p className="text-muted-foreground mb-6">
              Start with our production-ready Web3 template. One-click clone from GitHub gets you up and running instantly.
            </p>
            <div className="bg-muted rounded-lg p-4 text-left text-sm font-mono">
              <div className="text-muted-foreground">{`// Clone the template`}</div>
              <div className="text-foreground">git clone vercel-supabase-web3</div>
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-primary-foreground">
              2
            </div>
            <h3 className="text-xl font-semibold mb-4">Configure</h3>
            <p className="text-muted-foreground mb-6">
              Set up Supabase database and configure Web3 credentials. Our AI handles complex integrations automatically.
            </p>
            <div className="bg-muted rounded-lg p-4 text-left text-sm font-mono">
              <div className="text-muted-foreground">{`// Setup environment`}</div>
              <div className="text-foreground">npm run setup-db && vercel env pull</div>
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-primary-foreground">
              3
            </div>
            <h3 className="text-xl font-semibold mb-4">Customize</h3>
            <p className="text-muted-foreground mb-6">
              Use AI-powered Rules and Prompt enhancement to transform your dApp into a production-grade custom application.
            </p>
            <div className="bg-muted rounded-lg p-4 text-left text-sm font-mono">
              <div className="text-muted-foreground">{`// AI customization`}</div>
              <div className="text-foreground">npm run customize && vercel --prod</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
