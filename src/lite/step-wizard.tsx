import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const stepWizardStyles = css`
  @layer components {
    @scope (.ui-lite-step-wizard) {
      .ui-lite-step-wizard__steps {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin-block-end: 1rem;
        flex-wrap: wrap;
      }

      .ui-lite-step-wizard__step {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.8125rem;
      }

      .ui-lite-step-wizard__number {
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 24px;
        block-size: 24px;
        border-radius: 50%;
        font-size: 0.6875rem;
        font-weight: 600;
        flex-shrink: 0;
        background: oklch(100% 0 0 / 0.06);
        color: var(--text-secondary, oklch(70% 0 0));
      }
      .ui-lite-step-wizard__step[data-state="active"] .ui-lite-step-wizard__number {
        background: var(--brand, oklch(65% 0.2 270));
        color: oklch(100% 0 0);
      }
      .ui-lite-step-wizard__step[data-state="complete"] .ui-lite-step-wizard__number {
        background: oklch(72% 0.19 145 / 0.15);
        color: oklch(72% 0.19 145);
      }

      .ui-lite-step-wizard__label {
        color: var(--text-secondary, oklch(70% 0 0));
      }
      .ui-lite-step-wizard__step[data-state="active"] .ui-lite-step-wizard__label {
        color: var(--text-primary, oklch(97% 0 0));
        font-weight: 500;
      }

      .ui-lite-step-wizard__content {
        color: var(--text-primary, oklch(97% 0 0));
      }
    }
  }
`

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
  ({ steps, activeStep = 0, className, children, ...rest }, ref) => {
    useStyles('lite-step-wizard', stepWizardStyles)
    return (
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
  }
)
StepWizard.displayName = 'StepWizard'
