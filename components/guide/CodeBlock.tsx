'use client'

import { CopyButton } from './CopyButton'

interface CodeBlockProps {
  code: string
  language?: string
  title?: string
  platform?: 'mac' | 'windows' | 'linux' | 'all'
}

export function CodeBlock({ code, language = 'bash', title, platform = 'all' }: CodeBlockProps) {
  const platformEmoji = {
    mac: '🍎',
    windows: '🪟',
    linux: '🐧',
    all: '💻'
  }

  return (
    <div className="group relative my-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center gap-2">
          {title && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {platformEmoji[platform]} {title}
            </span>
          )}
          {language && !title && (
            <span className="rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {language}
            </span>
          )}
        </div>
        <CopyButton text={code} />
      </div>

      {/* Code */}
      <div className="overflow-x-auto">
        <pre className="p-4">
          <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
            {code}
          </code>
        </pre>
      </div>
    </div>
  )
}
