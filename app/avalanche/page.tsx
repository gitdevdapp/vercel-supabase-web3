import { GlobalNav } from "@/components/navigation/global-nav";
import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { FinalCtaSection } from "@/components/final-cta-section";
import { AvalancheHero } from "@/components/avalanche/AvalancheHero";
import { AvalancheTechStackSection } from "@/components/avalanche/AvalancheTechStackSection";
import { AvalancheBenefitsSection } from "@/components/avalanche/AvalancheBenefitsSection";
import type { Metadata } from 'next';

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Avalanche Network Starter Kit Template",
  "description": "Production-ready Web3 development stack specifically designed for Avalanche network blockchain applications and smart contracts",
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
  title: "Avalanche Network Starter Kit | DevDapp",
  description: "Production-ready Web3 development stack for Avalanche. Build high-performance dApps with subnet architecture, EVM compatibility, and enterprise features.",
  keywords: ["Avalanche", "AVAX", "subnet development", "EVM compatible", "high throughput", "enterprise blockchain", "dApp template"],
  openGraph: {
    title: "Avalanche Network Starter Kit Template",
    description: "Production-ready Web3 development stack for Avalanche blockchain applications",
    type: "website",
    url: "https://devdapp.com/avalanche",
    images: [
      {
        url: "/images/avalanche-page-og.png",
        width: 1200,
        height: 630,
        alt: "Avalanche Network Starter Kit Template"
      }
    ]
  }
};

export default async function AvalanchePage() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <GlobalNav 
          showAuthButton={true} 
          showDeployButton={true} 
          authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={true} />}
        />
        
        <div className="w-full">
          <AvalancheHero />
          <AvalancheTechStackSection />
          <AvalancheBenefitsSection />
          <FinalCtaSection />
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Built for{" "}
            <a
              href="https://avax.network/"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Avalanche Network
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
