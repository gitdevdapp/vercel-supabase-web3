import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile } from "@/lib/profile";
import { SimpleProfileForm } from "@/components/simple-profile-form";
import { InfoIcon, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
    <div className="flex-1 w-full flex flex-col gap-6 md:gap-12">
      {/* Guide Access CTA Banner */}
      <div className="w-full">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-2xl p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">
                  🎉 You&apos;re in! Click here for exclusive access to the copy-paste setup guide
                </h2>
                <p className="text-sm text-muted-foreground">
                  Follow our step-by-step guide to deploy your Web3 dApp in under 60 minutes
                </p>
              </div>
            </div>
            <Button asChild size="lg" className="whitespace-nowrap w-full sm:w-auto">
              <Link href="/guide">
                <BookOpen className="w-5 h-5 mr-2" />
                Access Guide
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is your personal profile page. You can update your &quot;About Me&quot; section below.
        </div>
      </div>
      
      <div className="flex flex-col gap-8 items-center">
        <div className="w-full">
          <h1 className="font-bold text-3xl mb-2">Welcome, {profile.username || 'User'}!</h1>
          <p className="text-muted-foreground">
            Update your profile information to tell others about yourself.
          </p>
        </div>
        
        <SimpleProfileForm profile={profile} userEmail={userEmail} />
      </div>
    </div>
  );
}
