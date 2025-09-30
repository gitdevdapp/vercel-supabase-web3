'use client'

import { ReactNode } from 'react'

interface StepSectionProps {
  id: string
  title: string
  emoji: string
  estimatedTime: string
  children: ReactNode
}

export function StepSection({ id, title, emoji, estimatedTime, children }: StepSectionProps) {
  return (
    <section 
      id={id}
      className="pt-32 pb-12 lg:pt-24 lg:pb-16 scroll-mt-32"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-3xl shadow-lg">
              {emoji}
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {title}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Estimated time: {estimatedTime}
              </p>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {children}
        </div>
      </div>
    </section>
  )
}