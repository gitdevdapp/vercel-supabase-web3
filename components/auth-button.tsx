import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { ProfileMenu } from "./navigation/profile-menu";

interface AuthButtonProps {
  showGuideButton?: boolean;
}

export async function AuthButton({ showGuideButton = false }: AuthButtonProps) {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    // Unified Profile Menu for all screen sizes
    <ProfileMenu userEmail={user.email} showGuideButton={showGuideButton} />
  ) : (
    // Keep logged out state with responsive text sizes
    <div className="flex gap-1 sm:gap-2">
      <Button asChild size="sm" variant={"outline"} className="text-xs sm:text-sm">
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"} className="text-xs sm:text-sm">
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
