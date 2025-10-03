import { GlobalNav } from "@/components/navigation/global-nav";
import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { FinalCtaSection } from "@/components/final-cta-section";
import { TezosHero } from "@/components/tezos/TezosHero";
import { TezosTechStackSection } from "@/components/tezos/TezosTechStackSection";
import { TezosBenefitsSection } from "@/components/tezos/TezosBenefitsSection";
import type { Metadata } from 'next';

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Tezos Network Starter Kit Template",
  "description": "Production-ready Web3 development stack specifically designed for Tezos network blockchain applications and smart contracts",
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
  title: "Tezos Network Starter Kit | DevDapp",
  description: "Production-ready Web3 development stack for Tezos network. Build and deploy Tezos dApps with formal verification, on-chain governance, and institutional security.",
  keywords: ["Tezos", "blockchain development", "formal verification", "on-chain governance", "smart contracts", "dApp template", "Tezos ecosystem"],
  openGraph: {
    title: "Tezos Network Starter Kit Template",
    description: "Production-ready Web3 development stack for Tezos network blockchain applications",
    type: "website",
    url: "https://devdapp.com/tezos",
    images: [
      {
        url: "/images/tezos-page-og.png",
        width: 1200,
        height: 630,
        alt: "Tezos Network Starter Kit Template"
      }
    ]
  }
};

export default async function TezosPage() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <GlobalNav 
          showAuthButton={true} 
          showDeployButton={true} 
          authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={true} />}
        />
        
        <div className="w-full">
          <TezosHero />
          <TezosTechStackSection />
          <TezosBenefitsSection />
          <FinalCtaSection />
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Built for{" "}
            <a
              href="https://tezos.com/"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Tezos Network
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
