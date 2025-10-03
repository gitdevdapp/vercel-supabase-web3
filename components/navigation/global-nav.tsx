"use client";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { DevDappLogo } from "@/components/ui/images";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface GlobalNavProps {
  showAuthButton?: boolean;
  showDeployButton?: boolean;
  showHomeButton?: boolean;
  showGuideButton?: boolean;
  customActions?: React.ReactNode;
  authButtonComponent?: React.ReactNode;
}

export function GlobalNav({ 
  showAuthButton = true,
  showDeployButton = false,
  showHomeButton = false,
  showGuideButton = false,
  customActions,
  authButtonComponent
}: GlobalNavProps) {
  return (
    <nav 
      className="sticky top-0 z-50 w-full flex justify-center border-b border-b-foreground/10 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{
        // iOS safe area support for notch/dynamic island
        paddingTop: 'max(0px, env(safe-area-inset-top))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
      }}
    >
      <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-2 sm:gap-5 items-center font-semibold">
          <Link href={"/"} className="text-xl font-bold flex-shrink-0">
            <DevDappLogo priority={true} />
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            {showHomeButton && (
              <Button size="sm" variant="outline" asChild className="text-xs sm:text-sm">
                <Link href="/">Home</Link>
              </Button>
            )}
            {/* Hide Guide button on mobile - it's in hamburger menu */}
            {showGuideButton && (
              <Button size="sm" variant="outline" asChild className="hidden md:inline-flex text-xs sm:text-sm">
                <Link href="/guide">Guide</Link>
              </Button>
            )}
            {/* Profile button not shown here - it's in AuthButton */}
            {showDeployButton && (
              <Button size="sm" variant="outline" className="text-xs sm:text-sm">Deploy</Button>
            )}
            {customActions}
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <ThemeSwitcher />
          {showAuthButton && authButtonComponent}
        </div>
      </div>
    </nav>
  );
}
