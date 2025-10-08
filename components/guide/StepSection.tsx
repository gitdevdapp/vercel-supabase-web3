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
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-3xl shadow-lg">
              {emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent break-words">
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
        <div className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none break-words overflow-hidden [&>*]:break-words [&_code]:break-all [&_pre]:overflow-x-auto">
          {children}
        </div>
      </div>
    </section>
  )
}