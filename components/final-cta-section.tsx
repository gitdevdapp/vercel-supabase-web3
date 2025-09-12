import { Button } from "./ui/button";
import { Check } from "lucide-react";

export function FinalCtaSection() {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold mb-6">
          Ready to Build Your Web3 dApp?
        </h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
          Join thousands of developers building the decentralized future.
          Start with our free tier and scale as you grow.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button size="lg" variant="secondary" className="px-8 py-3" asChild>
            <a href="https://github.com/gitdevdapp/vercel-supabase-web3" target="_blank" rel="noreferrer">
              Start Building
            </a>
          </Button>
          <Button size="lg" variant="secondary" className="px-8 py-3" asChild>
            <a href="https://calendly.com/git-devdapp" target="_blank" rel="noreferrer">
              Schedule a Call
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm opacity-75 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>5-minute setup</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>Production-ready in 10 minutes</span>
          </div>
        </div>
      </div>
    </section>
  );
}
