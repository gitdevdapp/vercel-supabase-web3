"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface DevDappLogoProps {
  className?: string;
  priority?: boolean;
}

export function DevDappLogo({ className = "", priority = false }: DevDappLogoProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`h-8 w-[180px] ${isMobile ? 'w-10' : ''} bg-muted animate-pulse rounded ${className}`} />
    );
  }

  // Determine which logo to use based on theme
  const isDark = resolvedTheme === 'dark';
  const logoSuffix = isDark ? '' : '-black';
  
  const desktopSrc = `/images/devdapp-horizontal${logoSuffix}.png`;
  const mobileSrc = `/images/devdapp-sq${logoSuffix}.png`;

  return (
    <div className={`${!isDark ? 'bg-black p-2 rounded' : ''} inline-flex items-center justify-center transition-all duration-200`}>
      <Image
        src={isMobile ? mobileSrc : desktopSrc}
        alt="DevDapp.Store"
        width={isMobile ? 40 : 180}
        height={isMobile ? 40 : 40}
        priority={priority}
        className={`h-auto w-auto max-h-8 transition-all duration-200 ${className}`}
      />
    </div>
  );
}
