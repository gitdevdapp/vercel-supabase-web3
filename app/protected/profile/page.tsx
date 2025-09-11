import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile } from "@/lib/profile";
import { ProfileForm } from "@/components/profile-form";
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
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          Manage your profile information below. Changes will be saved to your account.
        </div>
      </div>
      
      <div className="flex flex-col gap-8 items-center">
        <div className="w-full">
          <h1 className="font-bold text-3xl mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Update your profile information and preferences.
          </p>
        </div>
        
        <ProfileForm profile={profile} userEmail={userEmail} />
      </div>
    </div>
  );
}
