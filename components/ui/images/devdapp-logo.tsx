"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface DevDappLogoProps {
  className?: string;
  priority?: boolean;
}

export function DevDappLogo({ className = "", priority = false }: DevDappLogoProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <Image
      src={isMobile ? "/images/devdapp-sq.png" : "/images/devdapp-horizontal.png"}
      alt="DevDapp.Store"
      width={isMobile ? 40 : 180}
      height={isMobile ? 40 : 40}
      priority={priority}
      className={`h-auto w-auto max-h-8 transition-all duration-200 ${className}`}
    />
  );
}
