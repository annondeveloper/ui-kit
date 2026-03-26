'use client'

import {
  useState,
  useCallback,
  Children,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Step {
  id: string
  label: string
  description?: string
  icon?: ReactNode
  validate?: () => boolean | Promise<boolean>
}

export interface StepWizardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  steps: Step[]
  activeStep?: number
  defaultStep?: number
  onChange?: (step: number) => void
  orientation?: 'horizontal' | 'vertical'
  allowSkip?: boolean
  children: ReactNode
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const stepWizardStyles = css`
  @layer components {
    @scope (.ui-step-wizard) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg, 1.25rem);
        container-type: inline-size;
      }

      /* ── Step list ─────────────────────────────────────── */

      .ui-step-wizard__steps {
        display: flex;
        align-items: flex-start;
        gap: 0;
        list-style: none;
        margin: 0;
        padding: 0;
      }

      :scope[data-orientation="vertical"] .ui-step-wizard__steps {
        flex-direction: column;
      }

      /* ── Step item ─────────────────────────────────────── */

      .ui-step-wizard__step {
        display: flex;
        align-items: center;
        flex: 1;
        min-inline-size: 0;
      }

      :scope[data-orientation="vertical"] .ui-step-wizard__step {
        flex-direction: row;
        align-items: flex-start;
        flex: none;
      }

      .ui-step-wizard__step-button {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        background: none;
        border: none;
        padding: var(--space-xs, 0.25rem);
        cursor: default;
        font-family: inherit;
        outline: none;
        text-align: start;
      }

      .ui-step-wizard__step-button[data-clickable="true"] {
        cursor: pointer;
      }
      .ui-step-wizard__step-button[data-clickable="true"]:hover .ui-step-wizard__indicator {
        border-color: var(--brand, oklch(65% 0.2 270));
      }
      .ui-step-wizard__step-button:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        border-radius: var(--radius-sm, 0.25rem);
      }

      /* ── Indicator (circle) ────────────────────────────── */

      .ui-step-wizard__indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 2rem;
        block-size: 2rem;
        border-radius: var(--radius-full, 9999px);
        border: 2px solid var(--border-default, oklch(100% 0 0 / 0.12));
        background: transparent;
        color: var(--text-secondary, oklch(70% 0 0));
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        flex-shrink: 0;
        transition: all 0.2s var(--ease-out, ease-out);
      }

      .ui-step-wizard__indicator[data-state="active"] {
        background: var(--brand, oklch(65% 0.2 270));
        border-color: var(--brand, oklch(65% 0.2 270));
        color: var(--text-on-brand, oklch(100% 0 0));
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2);
      }

      .ui-step-wizard__indicator[data-state="completed"] {
        background: var(--brand, oklch(65% 0.2 270));
        border-color: var(--brand, oklch(65% 0.2 270));
        color: var(--text-on-brand, oklch(100% 0 0));
      }

      .ui-step-wizard__indicator[data-state="upcoming"] {
        background: transparent;
        border-color: var(--border-default, oklch(100% 0 0 / 0.12));
        color: var(--text-secondary, oklch(70% 0 0));
      }

      /* Motion 0: no transitions */
      :scope[data-motion="0"] .ui-step-wizard__indicator {
        transition: none;
      }

      .ui-step-wizard__indicator svg {
        inline-size: 1em;
        block-size: 1em;
      }

      /* ── Label ─────────────────────────────────────────── */

      .ui-step-wizard__label {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
        min-inline-size: 0;
      }

      .ui-step-wizard__label-text {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-secondary, oklch(70% 0 0));
        white-space: nowrap;
        text-wrap: balance;
      }

      .ui-step-wizard__step[aria-current="step"] .ui-step-wizard__label-text {
        color: var(--text-primary, oklch(90% 0 0));
        font-weight: 600;
      }

      .ui-step-wizard__label-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary, oklch(70% 0 0));
      }

      /* ── Connector line ────────────────────────────────── */

      .ui-step-wizard__connector {
        flex: 1;
        block-size: 2px;
        min-inline-size: 1.5rem;
        background: var(--border-default, oklch(100% 0 0 / 0.12));
        margin-block-start: 1rem;
        margin-inline: var(--space-xs, 0.25rem);
        border-radius: 1px;
        transition: background 0.3s var(--ease-out, ease-out);
      }

      .ui-step-wizard__connector[data-filled="true"] {
        background: var(--brand, oklch(65% 0.2 270));
      }

      :scope[data-orientation="vertical"] .ui-step-wizard__connector {
        inline-size: 2px;
        block-size: 1.5rem;
        min-inline-size: auto;
        margin-block: var(--space-xs, 0.25rem);
        margin-inline-start: calc(1rem - 1px);
        margin-inline-end: 0;
        flex: none;
      }

      :scope[data-motion="0"] .ui-step-wizard__connector {
        transition: none;
      }

      /* ── Content ───────────────────────────────────────── */

      .ui-step-wizard__content {
        min-inline-size: 0;
      }

      /* Content transition — motion 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-step-wizard__content {
        animation: ui-step-wizard-slide-in 0.25s var(--ease-out, ease-out);
      }

      /* ── Touch targets ─────────────────────────────────── */

      @media (pointer: coarse) {
        .ui-step-wizard__step-button {
          min-block-size: 44px;
        }
      }

      /* ── Responsive: compact on narrow ─────────────────── */

      @container (max-width: 400px) {
        .ui-step-wizard__label {
          display: none;
        }
        .ui-step-wizard__connector {
          min-inline-size: 0.75rem;
        }
      }

      /* ── Forced colors ─────────────────────────────────── */

      @media (forced-colors: active) {
        .ui-step-wizard__indicator {
          border: 2px solid ButtonText;
        }
        .ui-step-wizard__indicator[data-state="active"],
        .ui-step-wizard__indicator[data-state="completed"] {
          background: Highlight;
          border-color: Highlight;
          color: HighlightText;
        }
        .ui-step-wizard__connector {
          background: ButtonText;
        }
        .ui-step-wizard__connector[data-filled="true"] {
          background: Highlight;
        }
      }

      /* ── Print ─────────────────────────────────────────── */

      @media print {
        .ui-step-wizard__indicator {
          box-shadow: none;
        }
      }
    }

    @keyframes ui-step-wizard-slide-in {
      from { opacity: 0; transform: translateX(8px); }
      to { opacity: 1; transform: translateX(0); }
    }
  }
`

// ─── Check Icon (inline SVG) ────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3 7L6 10L11 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export function StepWizard({
  steps,
  activeStep: controlledStep,
  defaultStep = 0,
  onChange,
  orientation = 'horizontal',
  allowSkip = false,
  children,
  motion: motionProp,
  className,
  ...rest
}: StepWizardProps) {
  const cls = useStyles('step-wizard', stepWizardStyles)
  const motionLevel = useMotionLevel(motionProp)

  const isControlled = controlledStep !== undefined
  const [internalStep, setInternalStep] = useState(defaultStep)
  const currentStep = isControlled ? controlledStep : internalStep

  // Collect children by index
  const childArray = Children.toArray(children)

  const handleStepClick = useCallback(
    async (targetIdx: number) => {
      if (targetIdx === currentStep) return

      // Only allow clicking completed steps or skip-enabled
      const isCompleted = targetIdx < currentStep
      if (!isCompleted && !allowSkip) return

      // If moving forward, validate current step
      if (targetIdx > currentStep) {
        const currentStepDef = steps[currentStep]
        if (currentStepDef?.validate) {
          const result = await currentStepDef.validate()
          if (!result) return
        }
      }

      if (!isControlled) {
        setInternalStep(targetIdx)
      }
      onChange?.(targetIdx)
    },
    [currentStep, allowSkip, steps, isControlled, onChange]
  )

  return (
    <div
      className={cn(cls('root'), className)}
      data-orientation={orientation}
      data-motion={motionLevel}
      {...rest}
    >
      <ol className="ui-step-wizard__steps" role="list">
        {steps.map((step, idx) => {
          const state = idx < currentStep ? 'completed' : idx === currentStep ? 'active' : 'upcoming'
          const isClickable = allowSkip || state === 'completed'
          const showConnector = idx < steps.length - 1

          return (
            <li
              key={step.id}
              className="ui-step-wizard__step"
              role="listitem"
              aria-current={state === 'active' ? 'step' : undefined}
            >
              <button
                type="button"
                className="ui-step-wizard__step-button"
                data-clickable={isClickable || undefined}
                onClick={() => handleStepClick(idx)}
                tabIndex={isClickable ? 0 : -1}
              >
                <span
                  className="ui-step-wizard__indicator"
                  data-state={state}
                >
                  {state === 'completed' ? (
                    <CheckIcon />
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    idx + 1
                  )}
                </span>
                <span className="ui-step-wizard__label">
                  <span className="ui-step-wizard__label-text">{step.label}</span>
                  {step.description && (
                    <span className="ui-step-wizard__label-desc">{step.description}</span>
                  )}
                </span>
              </button>
              {showConnector && (
                <span
                  className="ui-step-wizard__connector"
                  data-filled={idx < currentStep ? 'true' : undefined}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>

      <div className="ui-step-wizard__content" key={currentStep}>
        {childArray[currentStep]}
      </div>
    </div>
  )
}

StepWizard.displayName = 'StepWizard'
