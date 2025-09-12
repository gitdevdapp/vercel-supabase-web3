import { investors, accelerators } from "@/lib/investors";
import { InvestorLogo } from "./investor-logo";

export function BackedBySection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header Content */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Backed By
          </h2>
          <p className="text-lg text-muted-foreground mb-4">
            DevDapp is a graduate of Astar + Sony accelerator and Denarii Labs accelerators
          </p>
          <p className="text-base text-muted-foreground">
            Backed by leading Web3 funds and foundations
          </p>
        </div>

        {/* Investor Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8 items-center justify-items-center mb-16">
          {investors.map((investor) => (
            <InvestorLogo key={investor.id} {...investor} />
          ))}
        </div>

        {/* Accelerator highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="font-semibold mb-2">Astar + Sony Accelerator</h3>
            <p className="text-sm text-muted-foreground">Graduate Program 2024</p>
          </div>
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="font-semibold mb-2">Denarii Labs</h3>
            <p className="text-sm text-muted-foreground">Accelerator Program</p>
          </div>
        </div>
      </div>
    </section>
  );
}
