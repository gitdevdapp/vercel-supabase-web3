import { investors } from "@/lib/investors";
import { InvestorLogo } from "./investor-logo";
import { Check } from "lucide-react";

export function BackedBySection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header Content */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-8">
            Backed By
          </h2>
        </div>

        {/* Investor Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8 items-center justify-items-center mb-12">
          {investors.map((investor) => (
            <InvestorLogo key={investor.id} {...investor} />
          ))}
        </div>

        {/* Accelerator Credentials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Sony + Astar Accelerator (2023)</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Denarii Labs Accelerator (2024)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
