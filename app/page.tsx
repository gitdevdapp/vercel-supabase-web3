import { Hero } from "@/components/hero";
import { ProblemExplanationSection } from "@/components/problem-explanation-section";
import { FeaturesSection } from "@/components/features-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { BackedBySection } from "@/components/backed-by-section";
import { FoundationSection } from "@/components/foundation-section";
import { FinalCtaSection } from "@/components/final-cta-section";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { GlobalNav } from "@/components/navigation/global-nav";
import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { OAuthCodeHandler } from "@/components/OAuthCodeHandler";
import { hasEnvVars } from "@/lib/utils";
import { Suspense } from "react";
// Tutorial components - currently unused but preserved for future development
// import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
// import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "DevDapp",
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
    "name": "DevDapp"
  }
};

export default async function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <Suspense fallback={null}>
        <OAuthCodeHandler />
      </Suspense>
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <GlobalNav 
          showAuthButton={true} 
          showGuideButton={true} 
          authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={true} />}
        />
        {/* Homepage Content */}
        <div className="w-full">
          <Hero />
          <ProblemExplanationSection />
          <HowItWorksSection />
          <FeaturesSection />
          <FoundationSection />
          <FinalCtaSection />
          <BackedBySection />
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
