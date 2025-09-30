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
  showProfileButton?: boolean;
  customActions?: React.ReactNode;
  authButtonComponent?: React.ReactNode;
}

export function GlobalNav({ 
  showAuthButton = true,
  showDeployButton = false,
  showHomeButton = false,
  showGuideButton = false,
  showProfileButton = false,
  customActions,
  authButtonComponent
}: GlobalNavProps) {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <Link href={"/"} className="text-xl font-bold">
            <DevDappLogo priority={true} />
          </Link>
          <div className="flex items-center gap-2">
            {showHomeButton && (
              <Button size="sm" variant="outline" asChild>
                <Link href="/">Home</Link>
              </Button>
            )}
            {showGuideButton && (
              <Button size="sm" variant="outline" asChild>
                <Link href="/guide">Guide</Link>
              </Button>
            )}
            {showProfileButton && (
              <Button size="sm" variant="outline" asChild>
                <Link href="/protected/profile">Profile</Link>
              </Button>
            )}
            {showDeployButton && (
              <Button size="sm" variant="outline">Deploy</Button>
            )}
            {customActions}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          {showAuthButton && authButtonComponent}
        </div>
      </div>
    </nav>
  );
}
