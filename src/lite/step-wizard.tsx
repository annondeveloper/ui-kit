import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteStep {
  id: string
  label: string
  description?: string
}

export interface LiteStepWizardProps extends HTMLAttributes<HTMLDivElement> {
  steps: LiteStep[]
  activeStep?: number
  children: ReactNode
}

export const StepWizard = forwardRef<HTMLDivElement, LiteStepWizardProps>(
  ({ steps, activeStep = 0, className, children, ...rest }, ref) => (
    <div ref={ref} className={`ui-lite-step-wizard${className ? ` ${className}` : ''}`} {...rest}>
      <div className="ui-lite-step-wizard__steps" role="list">
        {steps.map((step, i) => (
          <div
            key={step.id}
            className="ui-lite-step-wizard__step"
            data-state={i < activeStep ? 'complete' : i === activeStep ? 'active' : 'pending'}
            role="listitem"
          >
            <span className="ui-lite-step-wizard__number">{i < activeStep ? '\u2713' : i + 1}</span>
            <span className="ui-lite-step-wizard__label">{step.label}</span>
          </div>
        ))}
      </div>
      <div className="ui-lite-step-wizard__content">{children}</div>
    </div>
  )
)
StepWizard.displayName = 'StepWizard'
