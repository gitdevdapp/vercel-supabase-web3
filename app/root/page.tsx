import { GlobalNav } from "@/components/navigation/global-nav";
import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { FinalCtaSection } from "@/components/final-cta-section";
import { RootHero } from "@/components/root/RootHero";
import { TechStackSection } from "@/components/root/TechStackSection";
import { BenefitsSection } from "@/components/root/BenefitsSection";
import type { Metadata } from 'next';

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ROOT Network Starter Kit Template",
  "description": "Production-ready Web3 development stack specifically designed for ROOT network blockchain applications and smart contracts",
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
  title: "ROOT Network Starter Kit | DevDapp",
  description: "Production-ready Web3 development stack for ROOT network. Build and deploy ROOT blockchain apps in minutes with Vercel, Supabase, and native ROOT network integration.",
  keywords: ["ROOT network", "blockchain development", "Web3 starter kit", "ROOT blockchain", "smart contracts", "dApp template", "ROOT ecosystem"],
  openGraph: {
    title: "ROOT Network Starter Kit Template",
    description: "Production-ready Web3 development stack for ROOT network blockchain applications",
    type: "website",
    url: "https://devdapp.com/root",
    images: [
      {
        url: "/images/root-page-og.png",
        width: 1200,
        height: 630,
        alt: "ROOT Network Starter Kit Template"
      }
    ]
  }
};

export default async function RootPage() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <GlobalNav 
          showAuthButton={true} 
          showDeployButton={true} 
          authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
        />
        
        <div className="w-full">
          <RootHero />
          <TechStackSection />
          <BenefitsSection />
          <FinalCtaSection />
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Built for{" "}
            <a
              href="https://rootnetwork.org/"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              ROOT Network
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
