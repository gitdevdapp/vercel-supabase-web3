'use client'

import { CopyButton } from './CopyButton'
import { Sparkles } from 'lucide-react'

interface CursorPromptProps {
  prompt: string
  title?: string
}

export function CursorPrompt({ prompt, title = 'Cursor AI Prompt' }: CursorPromptProps) {
  return (
    <div className="group relative my-6 overflow-hidden rounded-xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50 dark:border-blue-700 dark:from-blue-950/30 dark:to-purple-950/30 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-blue-200 bg-white/80 backdrop-blur dark:border-blue-800 dark:bg-gray-950/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" />
          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
            {title}
          </span>
          <span className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            Copy → Paste in Cursor (Cmd/Ctrl+L)
          </span>
        </div>
        <CopyButton text={prompt} />
      </div>

      {/* Prompt */}
      <div className="p-4">
        <div className="rounded-lg bg-white/50 dark:bg-gray-900/50 p-4 font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200">
          {prompt}
        </div>
      </div>

      {/* Hint */}
      <div className="border-t border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 px-4 py-2">
        <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
          <Sparkles className="h-3 w-3" />
          Cursor AI will handle all platform-specific commands automatically
        </p>
      </div>
    </div>
  )
}
