'use client'

import { Sparkles } from 'lucide-react'

interface EncouragementBadgeProps {
  message: string
  variant?: 'default' | 'success' | 'milestone'
}

export function EncouragementBadge({ message, variant = 'default' }: EncouragementBadgeProps) {
  const variants = {
    default: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300',
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300',
    milestone: 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-800 dark:from-purple-950/30 dark:to-pink-950/30 dark:border-purple-800 dark:text-purple-300'
  }

  return (
    <div className={`my-6 rounded-xl border-2 p-4 ${variants[variant]} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
      <div className="flex items-center gap-3">
        <div className={`flex-shrink-0 ${variant === 'milestone' ? 'animate-pulse' : ''}`}>
          <Sparkles className="w-5 h-5" />
        </div>
        <p className="text-sm sm:text-base font-medium">
          {message}
        </p>
      </div>
    </div>
  )
}
