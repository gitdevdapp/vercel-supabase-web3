'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";

export function CollapsibleGuideAccess() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Load saved preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('guideAccessOpen');
      if (saved === 'true') {
        setIsOpen(true);
      }
    }
  }, []);
  
  // Save preference when changed
  const toggleOpen = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('guideAccessOpen', newState.toString());
    }
  };
  
  return (
    <div className="w-full bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-2xl overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={toggleOpen}
        className="w-full px-4 py-3 md:px-6 md:py-4 flex items-center justify-between gap-3 hover:bg-primary/5 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
          <span className="font-semibold text-sm md:text-base text-left">
            🎉 You&apos;re in! Click here for exclusive guide access
          </span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-primary flex-shrink-0" />
        )}
      </button>
      
      {/* Content - Expandable */}
      {isOpen && (
        <div className="px-4 pb-4 md:px-6 md:pb-6 pt-2 border-t border-primary/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <p className="text-sm text-muted-foreground flex-1">
              Follow our step-by-step guide to deploy your Web3 dApp in under 60 minutes
            </p>
            <Button asChild size="lg" className="whitespace-nowrap w-full sm:w-auto">
              <Link href="/guide">
                <BookOpen className="w-5 h-5 mr-2" />
                Access Guide
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

