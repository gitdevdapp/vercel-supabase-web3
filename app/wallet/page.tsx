import { ThemeSwitcher } from "@/components/theme-switcher";
import { GlobalNav } from "@/components/navigation/global-nav";
import { WalletManager } from "@/components/wallet/WalletManager";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "DevDapp Wallet",
  "description": "X402 wallet interface for managing cryptocurrency and digital assets",
  "applicationCategory": "FinanceApplication",
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

export default function WalletPage() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <GlobalNav 
          showAuthButton={false} 
          showHomeButton={true}
          customActions={undefined}
        />

        {/* X402 Wallet Manager - REAL FUNCTIONALITY! */}
        <div className="w-full max-w-7xl px-5">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">
                X402 Wallet Manager
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Create and manage your cryptocurrency wallets, transfer USDC, and interact with the Coinbase Developer Platform.
              </p>
            </div>

            {/* Real Wallet Manager Component */}
            <WalletManager />
          </div>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            X402 Wallet powered by{" "}
            <a
              href="https://www.coinbase.com/developer-platform"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Coinbase Developer Platform
            </a>
            {" "}
            and{" "}
            <a
              href="https://nextjs.org/"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Next.js
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

