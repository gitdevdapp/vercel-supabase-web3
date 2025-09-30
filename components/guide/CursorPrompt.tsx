'use client'

import { CopyButton } from './CopyButton'
import { Sparkles } from 'lucide-react'

interface CursorPromptProps {
  prompt: string
  title?: string
}

export function CursorPrompt({ prompt, title = 'Cursor AI Prompt' }: CursorPromptProps) {
  return (
    <div className="group relative my-6 overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-primary/20 bg-background/80 backdrop-blur px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-sm font-bold text-foreground">
            {title}
          </span>
          <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Copy → Paste in Cursor (Cmd/Ctrl+L)
          </span>
        </div>
        <CopyButton text={prompt} />
      </div>

      {/* Prompt */}
      <div className="p-4">
        <div className="rounded-lg bg-muted/50 p-4 font-mono text-sm leading-relaxed text-foreground">
          {prompt}
        </div>
      </div>

      {/* Hint */}
      <div className="border-t border-primary/20 bg-primary/5 px-4 py-2">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-primary" />
          Cursor AI will handle all platform-specific commands automatically
        </p>
      </div>
    </div>
  )
}