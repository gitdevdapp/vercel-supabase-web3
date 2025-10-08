'use client'

import { CopyButton } from './CopyButton'
import { Sparkles } from 'lucide-react'

interface CursorPromptProps {
  prompt: string
  title?: string
}

export function CursorPrompt({ prompt, title = 'Cursor AI Prompt' }: CursorPromptProps) {
  return (
    <div className="group relative my-6 w-full max-w-full overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b-2 border-primary/20 bg-background/80 backdrop-blur px-3 sm:px-4 py-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Sparkles className="h-5 w-5 text-primary animate-pulse flex-shrink-0" />
          <span className="text-sm font-bold text-foreground whitespace-nowrap hidden sm:inline">
            {title}
          </span>
          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary whitespace-nowrap overflow-hidden text-ellipsis">
            Copy → Paste
          </span>
        </div>
        <CopyButton text={prompt} />
      </div>

      {/* Prompt */}
      <div className="p-4 w-full overflow-hidden">
        <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs sm:text-sm leading-relaxed text-foreground break-words whitespace-pre-wrap overflow-wrap-anywhere max-w-full">
          {prompt}
        </div>
      </div>

      {/* Hint */}
      <div className="border-t border-primary/20 bg-primary/5 px-3 sm:px-4 py-2 w-full overflow-hidden">
        <p className="text-xs text-muted-foreground flex items-center gap-2 break-words">
          <Sparkles className="h-3 w-3 text-primary flex-shrink-0" />
          <span className="break-words">Cursor AI will handle all platform-specific commands automatically</span>
        </p>
      </div>
    </div>
  )
}