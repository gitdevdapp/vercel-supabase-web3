'use client'

import { Sparkles } from 'lucide-react'

interface EncouragementBadgeProps {
  message: string
  variant?: 'default' | 'success' | 'milestone'
}

export function EncouragementBadge({ message, variant = 'default' }: EncouragementBadgeProps) {
  const variants = {
    default: 'bg-primary/5 border-primary/20 text-foreground',
    success: 'bg-primary/10 border-primary/30 text-foreground',
    milestone: 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 text-foreground'
  }

  return (
    <div className={`my-6 rounded-xl border-2 p-4 ${variants[variant]} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
      <div className="flex items-center gap-3">
        <div className={`flex-shrink-0 ${variant === 'milestone' ? 'animate-pulse' : ''}`}>
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm sm:text-base font-medium">
          {message}
        </p>
      </div>
    </div>
  )
}