"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface DevDappLogoProps {
  className?: string;
  priority?: boolean;
}

export function DevDappLogo({ className = "", priority = false }: DevDappLogoProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch with transparent placeholder
  if (!mounted) {
    return (
      <div className="h-8 w-[180px] bg-transparent" />
    );
  }

  const isDark = resolvedTheme === 'dark';
  const logoSrc = `/images/devdapp-horizontal${isDark ? '' : '-black'}.png`;

  return (
    <div className={`${!isDark ? 'bg-black p-2 rounded' : ''} inline-flex items-center justify-center transition-all duration-200`}>
      <Image
        src={logoSrc}
        alt="DevDapp.Store"
        width={180}
        height={40}
        priority={priority}
        className={`h-8 w-auto object-contain max-w-[180px] md:max-w-[180px] transition-all duration-200 ${className}`}
      />
    </div>
  );
}
