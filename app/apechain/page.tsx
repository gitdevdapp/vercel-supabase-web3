import { GlobalNav } from "@/components/navigation/global-nav";
import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { FinalCtaSection } from "@/components/final-cta-section";
import { ApeChainHero } from "@/components/apechain/ApeChainHero";
import { ApeChainTechStackSection } from "@/components/apechain/ApeChainTechStackSection";
import { ApeChainBenefitsSection } from "@/components/apechain/ApeChainBenefitsSection";
import type { Metadata } from 'next';

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ApeChain Network Starter Kit Template",
  "description": "Production-ready Web3 development stack specifically designed for ApeChain network blockchain applications and smart contracts",
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
  title: "ApeChain Network Starter Kit | DevDapp",
  description: "Production-ready Web3 development stack for ApeChain. Build NFT and gaming dApps with APE token integration and BAYC ecosystem support.",
  keywords: ["ApeChain", "APE token", "NFT development", "gaming blockchain", "BAYC ecosystem", "Web3 gaming", "dApp template"],
  openGraph: {
    title: "ApeChain Network Starter Kit Template",
    description: "Production-ready Web3 development stack for ApeChain blockchain applications",
    type: "website",
    url: "https://devdapp.com/apechain",
    images: [
      {
        url: "/images/apechain-page-og.png",
        width: 1200,
        height: 630,
        alt: "ApeChain Network Starter Kit Template"
      }
    ]
  }
};

export default async function ApeChainPage() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <GlobalNav 
          showAuthButton={true} 
          showDeployButton={true} 
          authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
        />
        
        <div className="w-full">
          <ApeChainHero />
          <ApeChainTechStackSection />
          <ApeChainBenefitsSection />
          <FinalCtaSection />
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Built for{" "}
            <a
              href="https://apechain.com/"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              ApeChain Network
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
