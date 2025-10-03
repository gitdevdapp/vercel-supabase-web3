import { GlobalNav } from "@/components/navigation/global-nav";
import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { FinalCtaSection } from "@/components/final-cta-section";
import { StacksHero } from "@/components/stacks/StacksHero";
import { StacksTechStackSection } from "@/components/stacks/StacksTechStackSection";
import { StacksBenefitsSection } from "@/components/stacks/StacksBenefitsSection";
import type { Metadata } from 'next';

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Stacks Network Starter Kit Template",
  "description": "Production-ready Web3 development stack specifically designed for Stacks Bitcoin Layer 2 blockchain applications and smart contracts",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "creator": {
    "@type": "Organization",
    "name": "DevDapp"
  }
};

export const metadata: Metadata = {
  title: "Stacks Network Starter Kit | DevDapp",
  description: "Production-ready Web3 development stack for Stacks Bitcoin Layer 2. Build Bitcoin-secured dApps with Clarity smart contracts, Proof of Transfer consensus, and STX stacking rewards.",
  keywords: ["Stacks", "Bitcoin Layer 2", "Clarity language", "Proof of Transfer", "STX stacking", "Bitcoin DeFi", "dApp template", "Bitcoin smart contracts"],
  openGraph: {
    title: "Stacks Network Starter Kit Template",
    description: "Production-ready Web3 development stack for Stacks Bitcoin Layer 2 blockchain applications",
    type: "website",
    url: "https://devdapp.com/stacks",
    images: [
      {
        url: "/images/stacks-page-og.png",
        width: 1200,
        height: 630,
        alt: "Stacks Network Starter Kit Template"
      }
    ]
  }
};

export default async function StacksPage() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <GlobalNav 
          showAuthButton={true} 
          showGuideButton={true}
          showDeployButton={true} 
          authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={true} />}
        />
        
        <div className="w-full">
          <StacksHero />
          <StacksTechStackSection />
          <StacksBenefitsSection />
          <FinalCtaSection />
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Built for{" "}
            <a
              href="https://stacks.co/"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Stacks Network
            </a>
            {" "}
            with{" "}
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
