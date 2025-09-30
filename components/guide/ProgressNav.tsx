'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronRight } from 'lucide-react'

interface Step {
  id: string
  title: string
  emoji: string
  estimatedTime: string
}

const steps: Step[] = [
  { id: 'welcome', title: 'Welcome', emoji: '👋', estimatedTime: '2 min' },
  { id: 'git', title: 'Install Git', emoji: '📦', estimatedTime: '10 min' },
  { id: 'github', title: 'Setup GitHub', emoji: '🐙', estimatedTime: '3 min' },
  { id: 'node', title: 'Install Node.js', emoji: '⚡', estimatedTime: '5 min' },
  { id: 'cursor', title: 'Install Cursor', emoji: '🧠', estimatedTime: '5 min' },
  { id: 'clone', title: 'Clone Repository', emoji: '📥', estimatedTime: '2 min' },
  { id: 'vercel', title: 'Deploy to Vercel', emoji: '▲', estimatedTime: '10 min' },
  { id: 'supabase', title: 'Setup Supabase', emoji: '🗄️', estimatedTime: '5 min' },
  { id: 'env', title: 'Environment Variables', emoji: '🔐', estimatedTime: '5 min' },
  { id: 'database', title: 'Setup Database', emoji: '🗃️', estimatedTime: '10 min' },
  { id: 'email', title: 'Configure Email', emoji: '📧', estimatedTime: '5 min' },
  { id: 'test', title: 'Test Everything', emoji: '✅', estimatedTime: '5 min' },
  { id: 'next', title: "What's Next", emoji: '🚀', estimatedTime: 'Ongoing' },
]

export function ProgressNav() {
  const [activeStep, setActiveStep] = useState('welcome')
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepId = entry.target.id
            setActiveStep(stepId)
            
            // Mark previous steps as completed
            const currentIndex = steps.findIndex(s => s.id === stepId)
            const completed = new Set<string>()
            steps.slice(0, currentIndex).forEach(s => completed.add(s.id))
            setCompletedSteps(completed)
          }
        })
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      }
    )

    steps.forEach(step => {
      const element = document.getElementById(step.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  const progress = ((completedSteps.size / steps.length) * 100).toFixed(0)

  const scrollToStep = (stepId: string) => {
    const element = document.getElementById(stepId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden lg:block fixed left-0 top-0 h-screen w-80 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Setup Guide
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Follow these steps to deploy your Web3 dApp
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progress
              </span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {progress}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-800">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-1">
            {steps.map((step) => {
              const isActive = activeStep === step.id
              const isCompleted = completedSteps.has(step.id)
              
              return (
                <button
                  key={step.id}
                  onClick={() => scrollToStep(step.id)}
                  className={`w-full text-left rounded-lg p-3 transition-all ${
                    isActive 
                      ? 'bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-800' 
                      : isCompleted
                      ? 'bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="text-sm">{step.emoji}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        isActive 
                          ? 'text-blue-700 dark:text-blue-300' 
                          : isCompleted
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {step.estimatedTime}
                      </p>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 dark:bg-gray-950 dark:border-gray-800">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Setup Guide
            </h2>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {progress}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-800">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
