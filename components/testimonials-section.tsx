export function TestimonialsSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Trusted by Web3 Developers
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of developers building the decentralized future
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-background rounded-lg p-6 border">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                <span className="text-primary font-semibold">SJ</span>
              </div>
              <div>
                <div className="font-semibold">Sarah Johnson</div>
                <div className="text-sm text-muted-foreground">DeFi Protocol Lead</div>
              </div>
            </div>
            <p className="text-muted-foreground italic">
              &quot;DevDapp.Store cut our development time by 80%. From concept to production in days, not months.&quot;
            </p>
          </div>

          <div className="bg-background rounded-lg p-6 border">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                <span className="text-primary font-semibold">MR</span>
              </div>
              <div>
                <div className="font-semibold">Marcus Rodriguez</div>
                <div className="text-sm text-muted-foreground">NFT Marketplace Founder</div>
              </div>
            </div>
            <p className="text-muted-foreground italic">
              &quot;The wallet integration is flawless. Our users love the seamless Web3 experience.&quot;
            </p>
          </div>

          <div className="bg-background rounded-lg p-6 border">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                <span className="text-primary font-semibold">AK</span>
              </div>
              <div>
                <div className="font-semibold">Alex Kim</div>
                <div className="text-sm text-muted-foreground">Web3 Startup CTO</div>
              </div>
            </div>
            <p className="text-muted-foreground italic">
              &quot;Enterprise-grade security without the enterprise price tag. Perfect for fast-moving Web3 teams.&quot;
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
            <div className="text-muted-foreground">Dapps Deployed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">50,000+</div>
            <div className="text-muted-foreground">Active Developers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
            <div className="text-muted-foreground">Uptime</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">$0</div>
            <div className="text-muted-foreground">Setup Cost</div>
          </div>
        </div>
      </div>
    </section>
  );
}
