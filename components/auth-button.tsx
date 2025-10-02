import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { MobileMenu } from "./navigation/mobile-menu";

interface AuthButtonProps {
  showGuideButton?: boolean;
}

export async function AuthButton({ showGuideButton = false }: AuthButtonProps) {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <>
      {/* Desktop Layout: Keep current design */}
      <div className="hidden md:flex items-center gap-2">
        <span className="text-sm">
          Hey, {user.email}!
        </span>
        <Button asChild size="sm" variant={"outline"}>
          <Link href="/protected/profile">Profile</Link>
        </Button>
        <LogoutButton />
      </div>
      
      {/* Mobile Layout: Hamburger menu only */}
      <MobileMenu userEmail={user.email} showGuideButton={showGuideButton} />
    </>
  ) : (
    // CRITICAL: Keep logged out state exactly as is
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
