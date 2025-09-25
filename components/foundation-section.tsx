import { Zap, TrendingUp, Heart } from "lucide-react";

export function FoundationSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Are You a Foundation?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            With our 0 cost AI starter framework, new users can scale to million+ user production dApps for free, growing the utilization of underlying Web3 infrastructure.
            This is the no. 1 metric to grow your chain and increase your Electric Capital report ranking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          <div className="bg-background rounded-lg p-6 border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Zero Cost Infrastructure</h3>
            <p className="text-muted-foreground">
              Deploy production-ready Dapps with Vercel&apos;s global CDN and Supabase&apos;s robust database - completely free for foundation testing.
            </p>
          </div>

          <div className="bg-background rounded-lg p-6 border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Boost Your Chain Ranking</h3>
            <p className="text-muted-foreground">
              Active dApp deployments are the #1 metric for Electric Capital reports. Help developers = grow your ecosystem ranking.
            </p>
          </div>

          <div className="bg-background rounded-lg p-6 border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">100% Open Source</h3>
            <p className="text-muted-foreground">
              Our commitment to open source means your foundation&apos;s investment grows the entire Web3 ecosystem sustainably.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
