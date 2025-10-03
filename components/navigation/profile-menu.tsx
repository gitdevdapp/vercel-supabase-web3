"use client";

import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ProfileMenuProps {
  userEmail?: string;
  showGuideButton?: boolean;
}

export function ProfileMenu({ userEmail, showGuideButton = false }: ProfileMenuProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2"
          aria-label="Open profile menu"
        >
          {/* Show hamburger icon on mobile, user icon with text on desktop */}
          <Menu className="h-5 w-5 md:hidden" />
          <User className="h-4 w-4 hidden md:block" />
          <span className="hidden md:inline text-xs lg:text-sm max-w-[120px] lg:max-w-[180px] truncate">
            {userEmail}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {userEmail && (
          <>
            <div className="px-2 py-1.5 text-sm text-muted-foreground md:hidden">
              {userEmail}
            </div>
            <DropdownMenuSeparator className="md:hidden" />
          </>
        )}
        
        {showGuideButton && (
          <DropdownMenuItem asChild>
            <Link href="/guide" className="cursor-pointer">
              Guide
            </Link>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem asChild>
          <Link href="/protected/profile" className="cursor-pointer">
            Profile
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Keep the old export name for backward compatibility
export { ProfileMenu as MobileMenu };
