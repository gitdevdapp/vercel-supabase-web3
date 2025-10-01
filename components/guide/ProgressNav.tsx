'use client'

import { useEffect, useState, useRef } from 'react'
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
  { id: 'fork', title: 'Fork Repository', emoji: '🍴', estimatedTime: '2 min' },
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
  const stepListRef = useRef<HTMLDivElement>(null)

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

  // Auto-scroll sidebar to keep active step visible
  useEffect(() => {
    if (!stepListRef.current) return
    
    const activeButton = stepListRef.current.querySelector(`[data-step-id="${activeStep}"]`)
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      })
    }
  }, [activeStep])

  const progress = ((completedSteps.size / steps.length) * 100).toFixed(0)

  const scrollToStep = (stepId: string) => {
    const element = document.getElementById(stepId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const currentIndex = steps.findIndex(s => s.id === activeStep)
  const nextStep = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null

  return (
    <>
      {/* Desktop Sidebar - Always visible on screens 768px+ */}
      <nav 
        className="progress-nav-desktop hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 border-r border-border bg-background overflow-y-auto z-30"
        style={{
          // Defensive CSS to ensure visibility above 768px
          minHeight: '400px',
          maxHeight: 'calc(100vh - 4rem)',
        }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Setup Guide
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Follow these steps to deploy your Web3 dApp
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                Progress
              </span>
              <span className="text-sm font-bold text-primary">
                {progress}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Current Step Preview */}
          {activeStep && activeStep !== 'welcome' && (
            <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs font-semibold text-primary mb-2">CURRENT STEP</p>
              <p className="text-sm font-medium text-foreground">{steps.find(s => s.id === activeStep)?.title}</p>
              {nextStep && (
                <div className="mt-3 pt-3 border-t border-primary/20">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">UP NEXT</p>
                  <p className="text-sm text-muted-foreground">{nextStep.emoji} {nextStep.title}</p>
                </div>
              )}
            </div>
          )}

          {/* Steps */}
          <div ref={stepListRef} className="space-y-1">
            {steps.map((step) => {
              const isActive = activeStep === step.id
              const isCompleted = completedSteps.has(step.id)
              
              return (
                <button
                  key={step.id}
                  data-step-id={step.id}
                  onClick={() => scrollToStep(step.id)}
                  className={`w-full text-left rounded-lg p-3 transition-all ${
                    isActive 
                      ? 'bg-primary/10 border border-primary/20' 
                      : isCompleted
                      ? 'bg-muted/50 border border-muted'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-primary text-primary-foreground' 
                        : isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
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
                          ? 'text-primary' 
                          : isCompleted
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {step.estimatedTime}
                      </p>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar - Only visible below 768px */}
      <div 
        className="progress-nav-mobile md:hidden fixed top-16 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm"
        style={{
          // Ensure this is hidden above 768px
          maxWidth: '100vw',
        }}
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Setup Guide
            </h2>
            <span className="text-sm font-bold text-primary">
              {progress}%
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Current step info on mobile */}
          <div className="mt-2 text-xs text-muted-foreground">
            {steps.find(s => s.id === activeStep)?.emoji} {steps.find(s => s.id === activeStep)?.title}
            {nextStep && (
              <span className="ml-2">→ {nextStep.emoji} {nextStep.title}</span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}