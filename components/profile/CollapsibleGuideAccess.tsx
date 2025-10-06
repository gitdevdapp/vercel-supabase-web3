'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, X } from "lucide-react";
import Link from "next/link";

export function CollapsibleGuideAccess() {
  const [isHidden, setIsHidden] = useState(false);
  
  // Load hidden state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hidden = localStorage.getItem('guideAccessHidden');
      setIsHidden(hidden === 'true');
    }
  }, []);
  
  // Hide banner
  const handleHide = () => {
    setIsHidden(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('guideAccessHidden', 'true');
    }
  };
  
  if (isHidden) return null;
  
  return (
    <div className="w-full bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-2xl p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Content */}
        <div className="flex items-center gap-3 flex-1">
          <Sparkles className="w-6 h-6 text-primary flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-base md:text-lg">
              🎉 Guide Access Available
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Follow our step-by-step guide to deploy your Web3 dApp in under 60 minutes
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 w-full sm:w-auto">
          <Button asChild size="lg" className="flex-1 sm:flex-none">
            <Link href="/guide">
              <BookOpen className="w-5 h-5 mr-2" />
              Access Guide
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleHide}
            className="flex-shrink-0"
            aria-label="Hide guide access banner"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

