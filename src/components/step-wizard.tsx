'use client'

import type React from 'react'
import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Check, ChevronRight, ChevronLeft } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Definition of a single wizard step. */
export interface WizardStep {
  /** Unique step identifier. */
  id: string
  /** Step title displayed in the step indicator. */
  title: string
  /** Optional description below the title. */
  description?: string
  /** Optional icon for the step indicator. */
  icon?: LucideIcon
  /** Step content to render. */
  content: React.ReactNode
  /** Validation function called before advancing. Return true to allow, false to block. */
  validate?: () => boolean | Promise<boolean>
}

/** Props for the StepWizard component. */
export interface StepWizardProps {
  /** Array of steps in order. */
  steps: WizardStep[]
  /** Called when the final step is completed. */
  onComplete: () => void
  /** Called whenever the active step changes. */
  onStepChange?: (step: number) => void
  /** Step indicator layout. Default "horizontal". */
  orientation?: 'horizontal' | 'vertical'
  /** Allow skipping forward to any uncompleted step. Default false. */
  allowSkip?: boolean
  /** Show a summary/completion state after the last step. Default false. */
  showSummary?: boolean
  /** Additional class name for the root container. */
  className?: string
}

const SESSION_KEY_PREFIX = 'ui-kit-wizard-'

// ---------------------------------------------------------------------------
// StepWizard
// ---------------------------------------------------------------------------

/**
 * @description A multi-step form wizard with animated slide transitions, per-step validation,
 * step indicator bar (horizontal or vertical), keyboard navigation, progress percentage,
 * and auto-save to sessionStorage for resilience to page refresh.
 */
export function StepWizard({
  steps,
  onComplete,
  onStepChange,
  orientation = 'horizontal',
  allowSkip = false,
  showSummary = false,
  className,
}: StepWizardProps): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion()
  const sessionKey = useMemo(() => SESSION_KEY_PREFIX + steps.map(s => s.id).join('-'), [steps])

  // Restore state from sessionStorage
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window === 'undefined') return 0
    try {
      const saved = sessionStorage.getItem(sessionKey)
      if (saved) {
        const parsed = JSON.parse(saved) as { step: number; completed: number[] }
        return Math.min(parsed.step, steps.length - 1)
      }
    } catch { /* noop */ }
    return 0
  })

  const [completed, setCompleted] = useState<Set<number>>(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const saved = sessionStorage.getItem(sessionKey)
      if (saved) {
        const parsed = JSON.parse(saved) as { step: number; completed: number[] }
        return new Set(parsed.completed)
      }
    } catch { /* noop */ }
    return new Set()
  })

  const [isValidating, setIsValidating] = useState(false)
  const [direction, setDirection] = useState(1) // 1=forward, -1=backward
  const [isComplete, setIsComplete] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const wizardRef = useRef<HTMLDivElement>(null)
  const validatingRef = useRef(false)

  // Save state to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(sessionKey, JSON.stringify({
        step: currentStep,
        completed: [...completed],
      }))
    } catch { /* noop */ }
  }, [currentStep, completed, sessionKey])

  const totalSteps = steps.length
  const progress = totalSteps === 0 ? 100 : Math.round(((completed.size) / totalSteps) * 100)

  const goToStep = useCallback((idx: number) => {
    setDirection(idx > currentStep ? 1 : -1)
    setCurrentStep(idx)
    onStepChange?.(idx)
  }, [currentStep, onStepChange])

  const handleNext = useCallback(async () => {
    if (validatingRef.current) return
    const step = steps[currentStep]
    if (step?.validate) {
      validatingRef.current = true
      setIsValidating(true)
      try {
        const valid = await step.validate()
        if (!valid) {
          setIsValidating(false)
          validatingRef.current = false
          return
        }
      } catch {
        setIsValidating(false)
        validatingRef.current = false
        return
      }
      setIsValidating(false)
      validatingRef.current = false
    }

    setCompleted(prev => new Set(prev).add(currentStep))

    if (currentStep < totalSteps - 1) {
      goToStep(currentStep + 1)
    } else {
      // Final step completed
      if (showSummary) {
        setIsComplete(true)
      }
      onComplete()
      // Clear session storage
      try { sessionStorage.removeItem(sessionKey) } catch { /* noop */ }
    }
  }, [currentStep, steps, totalSteps, goToStep, onComplete, showSummary, sessionKey])

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1)
    }
  }, [currentStep, goToStep])

  const handleStepClick = useCallback((idx: number) => {
    // Can click on completed steps or if allowSkip
    if (completed.has(idx) || allowSkip || idx < currentStep) {
      goToStep(idx)
    }
  }, [completed, allowSkip, currentStep, goToStep])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!wizardRef.current?.contains(e.target as Node)) return
      if (e.key === 'Enter' && !e.shiftKey && !(e.target instanceof HTMLTextAreaElement)) {
        handleNext()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [handleNext])

  const slideVariants = {
    enter: (dir: number) => ({
      x: prefersReducedMotion ? 0 : dir > 0 ? 40 : -40,
      opacity: prefersReducedMotion ? 1 : 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: prefersReducedMotion ? 0 : dir > 0 ? -40 : 40,
      opacity: prefersReducedMotion ? 1 : 0,
    }),
  }

  const isHorizontal = orientation === 'horizontal'

  return (
    <div ref={wizardRef} className={cn('flex flex-col', className)}>
      {/* Step indicator */}
      <div className={cn(
        'mb-6',
        isHorizontal ? 'flex items-center' : 'flex flex-col gap-1',
      )}>
        {steps.map((step, idx) => {
          const isActive = idx === currentStep
          const isDone = completed.has(idx) || isComplete
          const isClickable = isDone || allowSkip || idx < currentStep
          const Icon = step.icon

          return (
            <div
              key={step.id}
              className={cn(
                isHorizontal ? 'flex items-center flex-1' : 'flex items-center gap-3',
              )}
            >
              {/* Step circle + label */}
              <button
                onClick={() => handleStepClick(idx)}
                disabled={!isClickable}
                className={cn(
                  'flex items-center gap-2 group',
                  isClickable ? 'cursor-pointer' : 'cursor-default',
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full transition-all',
                    'h-8 w-8 text-xs font-semibold shrink-0',
                    isDone
                      ? 'bg-[hsl(var(--status-ok))] text-[hsl(var(--text-on-brand))]'
                      : isActive
                        ? 'bg-[hsl(var(--brand-primary))] text-[hsl(var(--text-on-brand))] ring-4 ring-[hsl(var(--brand-primary)/0.2)]'
                        : 'bg-[hsl(var(--bg-overlay))] text-[hsl(var(--text-tertiary))]',
                    isClickable && !isActive && !isDone && 'group-hover:bg-[hsl(var(--bg-elevated))]',
                  )}
                >
                  {isDone ? (
                    <Check className="h-4 w-4" />
                  ) : Icon ? (
                    <Icon className="h-4 w-4" />
                  ) : (
                    idx + 1
                  )}
                </div>

                <div className={cn(
                  isHorizontal ? 'hidden sm:block' : 'block',
                )}>
                  <div className={cn(
                    'text-xs font-medium leading-tight',
                    isActive ? 'text-[hsl(var(--text-primary))]' : 'text-[hsl(var(--text-secondary))]',
                  )}>
                    {step.title}
                  </div>
                  {step.description && !isHorizontal && (
                    <div className="text-[10px] text-[hsl(var(--text-tertiary))]">
                      {step.description}
                    </div>
                  )}
                </div>
              </button>

              {/* Connector line */}
              {isHorizontal && idx < totalSteps - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 mx-2 rounded-full transition-colors',
                  completed.has(idx) ? 'bg-[hsl(var(--status-ok))]' : 'bg-[hsl(var(--border-subtle))]',
                )} />
              )}
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 rounded-full bg-[hsl(var(--bg-overlay))] mb-4 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-[hsl(var(--brand-primary))]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>

      {/* Step content */}
      <div ref={contentRef} className="relative min-h-[200px]">
        <AnimatePresence mode="wait" custom={direction}>
          {isComplete && showSummary ? (
            <motion.div
              key="summary"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[hsl(var(--status-ok)/0.15)] mb-4">
                <Check className="h-8 w-8 text-[hsl(var(--status-ok))]" />
              </div>
              <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-1">
                All steps completed
              </h3>
              <p className="text-sm text-[hsl(var(--text-secondary))]">
                All {totalSteps} steps have been successfully completed.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25 }}
            >
              {steps[currentStep]?.content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      {!isComplete && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[hsl(var(--border-subtle)/0.5)]">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              'border border-[hsl(var(--border-default))]',
              'text-[hsl(var(--text-primary))]',
              'hover:bg-[hsl(var(--bg-overlay))]',
              'disabled:opacity-40 disabled:pointer-events-none',
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <span className="text-[11px] text-[hsl(var(--text-tertiary))] tabular-nums">
            Step {currentStep + 1} of {totalSteps}
          </span>

          <button
            onClick={handleNext}
            disabled={isValidating}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              'bg-[hsl(var(--brand-primary))] text-[hsl(var(--text-on-brand))]',
              'hover:bg-[hsl(var(--brand-primary))]/90',
              'disabled:opacity-70 disabled:cursor-not-allowed',
            )}
          >
            {isValidating ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-[hsl(var(--text-on-brand))] border-t-transparent animate-spin" />
                Validating...
              </>
            ) : currentStep === totalSteps - 1 ? (
              <>
                Complete
                <Check className="h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
