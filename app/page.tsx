import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { FeaturesSection } from "@/components/features-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { PricingSection } from "@/components/pricing-section";
import { FinalCtaSection } from "@/components/final-cta-section";
import { ThemeSwitcher } from "@/components/theme-switcher";
// Tutorial components - currently unused but preserved for future development
// import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
// import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";
import { Button } from "@/components/ui/button";
import { DevDappLogo } from "@/components/ui/images";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "DevDapp.Store",
  "description": "Platform for deploying decentralized applications with enterprise-grade security",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "publisher": {
    "@type": "Organization",
    "name": "DevDapp.Store"
  }
};

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"} className="text-xl font-bold">
                <DevDappLogo priority={true} />
              </Link>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">Deploy</Button>
              </div>
            </div>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </nav>
        {/* Homepage Content */}
        <div className="w-full">
          <Hero />
          <FeaturesSection />
          <HowItWorksSection />
          <TestimonialsSection />
          <PricingSection />
          <FinalCtaSection />
        </div>

        {/* Tutorial Section - Hidden from production homepage but preserved for development */}
        {/* 
        <div className="w-full max-w-5xl p-5">
          <main className="flex flex-col gap-6 px-4">
            <h2 className="font-medium text-xl mb-4">Next steps</h2>
            {hasEnvVars ? <SignUpUserSteps /> : <ConnectSupabaseSteps />}
          </main>
        </div>
        */}

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Built with{" "}
            <a
              href="https://nextjs.org/"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Next.js
            </a>
            {" "}
            and{" "}
            <a
              href="https://supabase.com/"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
