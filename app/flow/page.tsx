import { GlobalNav } from "@/components/navigation/global-nav";
import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { FinalCtaSection } from "@/components/final-cta-section";
import { FlowHero } from "@/components/flow/FlowHero";
import { FlowTechStackSection } from "@/components/flow/FlowTechStackSection";
import { FlowBenefitsSection } from "@/components/flow/FlowBenefitsSection";
import type { Metadata } from 'next';

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Flow Network Starter Kit Template",
  "description": "Production-ready Web3 development stack specifically designed for Flow blockchain applications with Cadence 1.5 and resource-oriented programming",
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
  title: "Flow Network Starter Kit | DevDapp",
  description: "Production-ready Web3 development stack for Flow blockchain. Build mainstream-ready dApps with Cadence 1.5 resource-oriented programming, multi-role architecture, and proven scalability.",
  keywords: ["Flow", "Cadence 1.5", "resource-oriented programming", "multi-role architecture", "NBA Top Shot", "mainstream adoption", "dApp template", "Flow blockchain"],
  openGraph: {
    title: "Flow Network Starter Kit Template",
    description: "Production-ready Web3 development stack for Flow blockchain applications with Cadence 1.5",
    type: "website",
    url: "https://devdapp.com/flow",
    images: [
      {
        url: "/images/flow-page-og.png",
        width: 1200,
        height: 630,
        alt: "Flow Network Starter Kit Template"
      }
    ]
  }
};

export default async function FlowPage() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <GlobalNav 
          showAuthButton={true} 
          showDeployButton={true} 
          authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
        />
        
        <div className="w-full">
          <FlowHero />
          <FlowTechStackSection />
          <FlowBenefitsSection />
          <FinalCtaSection />
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Built for{" "}
            <a
              href="https://flow.com/"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Flow Network
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
