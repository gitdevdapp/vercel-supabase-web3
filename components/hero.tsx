import { NextLogo } from "./next-logo";
import { SupabaseLogo } from "./supabase-logo";
import { Button } from "./ui/button";
import { Check } from "lucide-react";

export function Hero() {
  return (
    <section className="flex flex-col gap-16 items-center py-20">
      <div className="flex gap-8 justify-center items-center">
        <a
          href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
          target="_blank"
          rel="noreferrer"
        >
          <SupabaseLogo />
        </a>
        <span className="border-l rotate-45 h-6" />
        <a href="https://nextjs.org/" target="_blank" rel="noreferrer">
          <NextLogo />
        </a>
      </div>

      <h1 className="sr-only">AI Starter Kit Template for Web3 DApp Development</h1>

      <div className="text-center max-w-4xl">
        <h2 className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center font-bold mb-6">
          Vercel + Supabase + Web3
        </h2>
        <p className="text-lg lg:text-xl mx-auto max-w-2xl text-center text-muted-foreground mb-8">
          An AI Starter Kit Template for Web3 that uses an Incentived per Blockchain repository to make building Dapps with Vibe Coding as easy as Apps
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button size="lg" className="px-8 py-3">Start Building Free</Button>
          <Button size="lg" variant="outline" className="px-8 py-3">View Demo</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Zero Setup Required</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Production Ready</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>AI-Powered Development</span>
          </div>
        </div>
      </div>

      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
    </section>
  );
}
