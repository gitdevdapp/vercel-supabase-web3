import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile } from "@/lib/profile";
import { SimpleProfileForm } from "@/components/simple-profile-form";
import { ProfileWalletCard } from "@/components/profile-wallet-card";
import { CollapsibleGuideAccess } from "@/components/profile/CollapsibleGuideAccess";
import { InfoIcon } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();

  // Check authentication
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const userEmail = data.claims.email as string;
  const userId = data.claims.sub;

  // Get or create user profile
  const profile = await getOrCreateProfile(userId, userEmail);

  if (!profile) {
    return (
      <div className="flex-1 w-full flex flex-col gap-12">
        <div className="w-full">
          <div className="bg-destructive/10 border border-destructive/20 text-sm p-3 px-5 rounded-md text-destructive-foreground flex gap-3 items-center">
            <InfoIcon size="16" strokeWidth={2} />
            Unable to load profile. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      {/* Collapsible Guide Access Banner */}
      <CollapsibleGuideAccess />
      
      {/* Desktop: Two-column layout, Mobile: Stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
        {/* Left Column: Profile (Desktop sidebar, Mobile top) */}
        <div className="w-full">
          <SimpleProfileForm profile={profile} userEmail={userEmail} />
        </div>
        
        {/* Right Column: Wallet (Desktop main area, Mobile below profile) */}
        <div className="w-full">
          <ProfileWalletCard />
        </div>
      </div>
    </div>
  );
}
