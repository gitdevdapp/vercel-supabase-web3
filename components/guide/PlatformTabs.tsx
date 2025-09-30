'use client'

import { useState } from 'react'
import { CodeBlock } from './CodeBlock'

interface PlatformCommand {
  mac?: string
  windows?: string
  linux?: string
}

interface PlatformTabsProps {
  commands: PlatformCommand
  title?: string
}

export function PlatformTabs({ commands, title }: PlatformTabsProps) {
  const [activeTab, setActiveTab] = useState<'mac' | 'windows' | 'linux'>('mac')

  const tabs = [
    { id: 'mac' as const, label: '🍎 macOS', show: !!commands.mac },
    { id: 'windows' as const, label: '🪟 Windows', show: !!commands.windows },
    { id: 'linux' as const, label: '🐧 Linux', show: !!commands.linux },
  ].filter(tab => tab.show)

  return (
    <div className="my-6">
      {/* Platform Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white shadow-lg scale-105'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Command Display */}
      {commands[activeTab] && (
        <CodeBlock
          code={commands[activeTab]!}
          platform={activeTab}
          title={title}
        />
      )}
    </div>
  )
}
