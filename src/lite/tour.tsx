import { useState, useCallback, type ReactNode } from 'react'

export interface LiteTourStep {
  title: string
  description: ReactNode
}

export interface LiteTourProps {
  steps: LiteTourStep[]
  open?: boolean
  onClose?: () => void
  onFinish?: () => void
  showProgress?: boolean
}

/** Lite tour — simple fixed overlay with step navigation, no spotlight or animation */
export function Tour({ steps, open = false, onClose, onFinish, showProgress = true }: LiteTourProps) {
  const [step, setStep] = useState(0)
  const current = steps[step]
  const isLast = step === steps.length - 1
  const isFirst = step === 0

  const handleNext = useCallback(() => {
    if (isLast) {
      onFinish?.()
      onClose?.()
    } else {
      setStep(s => s + 1)
    }
  }, [isLast, onFinish, onClose])

  const handlePrev = useCallback(() => {
    if (!isFirst) setStep(s => s - 1)
  }, [isFirst])

  if (!open || !current) return null

  return (
    <div
      className="ui-lite-tour"
      role="dialog"
      aria-modal="true"
      aria-label={`Tour step ${step + 1} of ${steps.length}: ${current.title}`}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'oklch(0% 0 0 / 0.5)' }}
    >
      <div style={{ background: 'oklch(22% 0.015 270)', border: '1px solid oklch(100% 0 0 / 0.1)', borderRadius: '0.75rem', padding: '1.5rem', maxWidth: '20rem', color: 'oklch(90% 0 0)' }}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 600 }}>{current.title}</h3>
        <div style={{ fontSize: '0.875rem', color: 'oklch(70% 0 0)', marginBottom: '1rem' }}>{current.description}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          {showProgress && <span style={{ fontSize: '0.75rem', color: 'oklch(55% 0 0)' }}>Step {step + 1} of {steps.length}</span>}
          <div style={{ display: 'flex', gap: '0.25rem', marginInlineStart: 'auto' }}>
            {!isFirst && <button type="button" onClick={handlePrev} style={{ padding: '0.25rem 1rem', border: '1px solid oklch(100% 0 0 / 0.1)', borderRadius: '0.5rem', background: 'transparent', color: 'oklch(70% 0 0)', cursor: 'pointer' }}>Previous</button>}
            <button type="button" onClick={handleNext} style={{ padding: '0.25rem 1rem', borderRadius: '0.5rem', background: 'oklch(65% 0.2 270)', color: 'oklch(100% 0 0)', border: 'none', cursor: 'pointer' }}>{isLast ? 'Finish' : 'Next'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
Tour.displayName = 'Tour'
