'use client'

import {
  forwardRef,
  useCallback,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface StepperStep {
  id: string
  label: ReactNode
  description?: string
  icon?: ReactNode
  optional?: boolean
}

export interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  steps: StepperStep[]
  activeStep: number
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'dots' | 'progress'
  size?: 'sm' | 'md' | 'lg'
  onStepClick?: (step: number) => void
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const stepperStyles = css`
  @layer components {
    @scope (.ui-stepper) {
      :scope {
        display: flex;
        align-items: flex-start;
        gap: 0;
        container-type: inline-size;
      }

      :scope[data-orientation="vertical"] {
        flex-direction: column;
      }

      /* ── Step item ──────────────────────────────────── */

      .ui-stepper__step {
        display: flex;
        align-items: center;
        flex: 1;
        position: relative;
      }

      :scope[data-orientation="vertical"] .ui-stepper__step {
        flex-direction: row;
        align-items: flex-start;
        flex: none;
      }

      /* ── Step content wrapper (indicator + label) ──── */

      .ui-stepper__step-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        position: relative;
        z-index: 1;
        flex-shrink: 0;
      }

      :scope[data-orientation="vertical"] .ui-stepper__step-content {
        flex-direction: row;
        align-items: flex-start;
        gap: var(--space-sm, 0.5rem);
      }

      /* ── Indicator (circle with number/icon/check) ── */

      .ui-stepper__indicator {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-weight: 600;
        font-family: inherit;
        line-height: 1;
        flex-shrink: 0;
        border: 2px solid var(--border-default, oklch(100% 0 0 / 0.12));
        background: var(--bg-surface, oklch(18% 0.01 270));
        color: var(--text-secondary, oklch(70% 0 0));
        transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
      }

      /* Completed step */
      .ui-stepper__step[data-status="completed"] .ui-stepper__indicator {
        background: var(--brand, oklch(65% 0.2 270));
        border-color: var(--brand, oklch(65% 0.2 270));
        color: var(--text-on-brand, oklch(100% 0 0));
      }

      /* Active step */
      .ui-stepper__step[data-status="active"] .ui-stepper__indicator {
        border-color: var(--brand, oklch(65% 0.2 270));
        background: var(--bg-elevated, oklch(28% 0.02 270));
        color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
      }

      /* ── Sizes ──────────────────────────────────────── */

      :scope[data-size="sm"] .ui-stepper__indicator {
        inline-size: 1.5rem;
        block-size: 1.5rem;
        font-size: var(--text-xs, 0.6875rem);
      }
      :scope[data-size="md"] .ui-stepper__indicator {
        inline-size: 2rem;
        block-size: 2rem;
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="lg"] .ui-stepper__indicator {
        inline-size: 2.5rem;
        block-size: 2.5rem;
        font-size: var(--text-base, 1rem);
      }

      /* ── Labels ─────────────────────────────────────── */

      .ui-stepper__label-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.125rem;
        text-align: center;
      }

      :scope[data-orientation="vertical"] .ui-stepper__label-group {
        align-items: flex-start;
        text-align: start;
      }

      .ui-stepper__label {
        font-weight: 500;
        color: var(--text-secondary, oklch(70% 0 0));
        white-space: nowrap;
      }

      .ui-stepper__step[data-status="active"] .ui-stepper__label {
        color: var(--text-primary, oklch(90% 0 0));
        font-weight: 600;
      }
      .ui-stepper__step[data-status="completed"] .ui-stepper__label {
        color: var(--text-primary, oklch(90% 0 0));
      }

      :scope[data-size="sm"] .ui-stepper__label {
        font-size: var(--text-xs, 0.6875rem);
      }
      :scope[data-size="md"] .ui-stepper__label {
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="lg"] .ui-stepper__label {
        font-size: var(--text-base, 1rem);
      }

      .ui-stepper__description {
        font-size: var(--text-xs, 0.6875rem);
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      .ui-stepper__optional {
        font-size: var(--text-xs, 0.6875rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        font-style: italic;
      }

      /* ── Connector line ─────────────────────────────── */

      .ui-stepper__connector {
        flex: 1;
        position: relative;
        align-self: center;
      }

      /* Horizontal connector */
      :scope[data-orientation="horizontal"] .ui-stepper__connector {
        block-size: 2px;
        min-inline-size: var(--space-md, 1rem);
        background: var(--border-default, oklch(100% 0 0 / 0.12));
        margin-inline: var(--space-xs, 0.25rem);
      }

      :scope[data-orientation="horizontal"] .ui-stepper__connector[data-completed="true"] {
        background: var(--brand, oklch(65% 0.2 270));
      }

      /* Vertical connector */
      :scope[data-orientation="vertical"] .ui-stepper__connector {
        inline-size: 2px;
        min-block-size: var(--space-lg, 1.5rem);
        background: var(--border-default, oklch(100% 0 0 / 0.12));
        margin-block: var(--space-xs, 0.25rem);
      }

      :scope[data-orientation="vertical"] .ui-stepper__step-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      :scope[data-orientation="vertical"] .ui-stepper__connector[data-completed="true"] {
        background: var(--brand, oklch(65% 0.2 270));
      }

      /* ── Dots variant ───────────────────────────────── */

      :scope[data-variant="dots"] .ui-stepper__indicator {
        border: none;
        background: var(--border-default, oklch(100% 0 0 / 0.12));
      }

      :scope[data-variant="dots"][data-size="sm"] .ui-stepper__indicator {
        inline-size: 0.5rem;
        block-size: 0.5rem;
      }
      :scope[data-variant="dots"][data-size="md"] .ui-stepper__indicator {
        inline-size: 0.75rem;
        block-size: 0.75rem;
      }
      :scope[data-variant="dots"][data-size="lg"] .ui-stepper__indicator {
        inline-size: 1rem;
        block-size: 1rem;
      }

      :scope[data-variant="dots"] .ui-stepper__step[data-status="active"] .ui-stepper__indicator {
        background: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2);
      }

      :scope[data-variant="dots"] .ui-stepper__step[data-status="completed"] .ui-stepper__indicator {
        background: var(--brand, oklch(65% 0.2 270));
      }

      /* Hide number/icon text in dots variant */
      :scope[data-variant="dots"] .ui-stepper__indicator-content {
        display: none;
      }

      /* ── Progress variant ───────────────────────────── */

      :scope[data-variant="progress"] .ui-stepper__connector {
        block-size: 4px;
        border-radius: var(--radius-full, 9999px);
        background: var(--border-default, oklch(100% 0 0 / 0.12));
        overflow: hidden;
      }

      :scope[data-variant="progress"] .ui-stepper__connector[data-completed="true"] {
        background: var(--brand, oklch(65% 0.2 270));
      }

      :scope[data-variant="progress"][data-orientation="vertical"] .ui-stepper__connector {
        inline-size: 4px;
        block-size: auto;
      }

      /* ── Clickable steps ────────────────────────────── */

      .ui-stepper__step[data-clickable="true"] {
        cursor: pointer;
      }

      .ui-stepper__step[data-clickable="true"]:hover .ui-stepper__indicator {
        border-color: var(--brand, oklch(65% 0.2 270));
        transform: scale(1.05);
      }

      .ui-stepper__step[data-clickable="true"]:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        border-radius: var(--radius-sm, 0.25rem);
      }

      /* ── Motion ─────────────────────────────────────── */

      :scope[data-motion="0"] .ui-stepper__indicator,
      :scope[data-motion="0"] .ui-stepper__connector {
        transition: none;
      }

      :scope:not([data-motion="0"]) .ui-stepper__connector {
        transition: background 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* ── Touch targets ──────────────────────────────── */

      @media (pointer: coarse) {
        .ui-stepper__step[data-clickable="true"] {
          min-block-size: 44px;
          min-inline-size: 44px;
        }
      }

      /* ── Forced colors ──────────────────────────────── */

      @media (forced-colors: active) {
        .ui-stepper__indicator {
          border: 2px solid ButtonText;
        }
        .ui-stepper__step[data-status="active"] .ui-stepper__indicator {
          border-color: Highlight;
          box-shadow: none;
        }
        .ui-stepper__step[data-status="completed"] .ui-stepper__indicator {
          background: Highlight;
          border-color: Highlight;
        }
        .ui-stepper__connector {
          background: ButtonText;
        }
        .ui-stepper__connector[data-completed="true"] {
          background: Highlight;
        }
        .ui-stepper__step[data-clickable="true"]:focus-visible {
          outline: 2px solid Highlight;
        }
      }

      /* ── Print ──────────────────────────────────────── */

      @media print {
        .ui-stepper__indicator {
          box-shadow: none;
          border: 1px solid;
        }
        .ui-stepper__connector {
          background: currentColor;
          opacity: 0.3;
        }
        .ui-stepper__connector[data-completed="true"] {
          opacity: 1;
        }
      }
    }
  }
`

// ─── Checkmark icon ─────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 6L5 8.5L9.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export const Stepper = forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      steps,
      activeStep,
      orientation = 'horizontal',
      variant = 'default',
      size = 'md',
      onStepClick,
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('stepper', stepperStyles)
    const motionLevel = useMotionLevel(motionProp)

    const handleStepClick = useCallback(
      (index: number) => {
        if (onStepClick) {
          onStepClick(index)
        }
      },
      [onStepClick]
    )

    const handleStepKeyDown = useCallback(
      (e: React.KeyboardEvent, index: number) => {
        if (onStepClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onStepClick(index)
        }
      },
      [onStepClick]
    )

    const getStepStatus = (index: number): 'completed' | 'active' | 'pending' => {
      if (index < activeStep) return 'completed'
      if (index === activeStep) return 'active'
      return 'pending'
    }

    const isClickable = !!onStepClick

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        data-orientation={orientation}
        data-variant={variant}
        data-size={size}
        data-motion={motionLevel}
        aria-label="Progress steps"
        role="navigation"
        {...rest}
      >
        {steps.map((step, index) => {
          const status = getStepStatus(index)
          const isLast = index === steps.length - 1

          return orientation === 'horizontal' ? (
            /* Horizontal layout: step-content + connector inline */
            <div
              key={step.id}
              className="ui-stepper__step"
              data-status={status}
              data-clickable={isClickable || undefined}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              aria-current={status === 'active' ? 'step' : undefined}
              onClick={isClickable ? () => handleStepClick(index) : undefined}
              onKeyDown={isClickable ? (e) => handleStepKeyDown(e, index) : undefined}
            >
              <div className="ui-stepper__step-content">
                <span className="ui-stepper__indicator">
                  <span className="ui-stepper__indicator-content">
                    {status === 'completed' && !step.icon ? (
                      <CheckIcon />
                    ) : step.icon ? (
                      step.icon
                    ) : (
                      index + 1
                    )}
                  </span>
                </span>
                <div className="ui-stepper__label-group">
                  <span className="ui-stepper__label">{step.label}</span>
                  {step.description && (
                    <span className="ui-stepper__description">{step.description}</span>
                  )}
                  {step.optional && (
                    <span className="ui-stepper__optional">Optional</span>
                  )}
                </div>
              </div>
              {!isLast && (
                <div
                  className="ui-stepper__connector"
                  data-completed={index < activeStep || undefined}
                  aria-hidden="true"
                />
              )}
            </div>
          ) : (
            /* Vertical layout: step-wrapper with indicator/connector stacked, label aside */
            <div
              key={step.id}
              className="ui-stepper__step"
              data-status={status}
              data-clickable={isClickable || undefined}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              aria-current={status === 'active' ? 'step' : undefined}
              onClick={isClickable ? () => handleStepClick(index) : undefined}
              onKeyDown={isClickable ? (e) => handleStepKeyDown(e, index) : undefined}
            >
              <div className="ui-stepper__step-wrapper">
                <span className="ui-stepper__indicator">
                  <span className="ui-stepper__indicator-content">
                    {status === 'completed' && !step.icon ? (
                      <CheckIcon />
                    ) : step.icon ? (
                      step.icon
                    ) : (
                      index + 1
                    )}
                  </span>
                </span>
                {!isLast && (
                  <div
                    className="ui-stepper__connector"
                    data-completed={index < activeStep || undefined}
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="ui-stepper__label-group">
                <span className="ui-stepper__label">{step.label}</span>
                {step.description && (
                  <span className="ui-stepper__description">{step.description}</span>
                )}
                {step.optional && (
                  <span className="ui-stepper__optional">Optional</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
)
Stepper.displayName = 'Stepper'
