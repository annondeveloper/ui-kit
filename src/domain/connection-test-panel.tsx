'use client'

import {
  type HTMLAttributes,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TestStep {
  id: string
  label: string
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped'
  message?: string
  duration?: number
}

export interface ConnectionTestPanelProps extends HTMLAttributes<HTMLDivElement> {
  steps: TestStep[]
  title?: string
  onRetry?: () => void
  onCancel?: () => void
  running?: boolean
  size?: 'sm' | 'md' | 'lg'
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const connectionTestPanelStyles = css`
  @layer components {
    @scope (.ui-connection-test-panel) {
      :scope {
        display: flex;
        flex-direction: column;
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.1));
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(20% 0.02 270));
        overflow: hidden;
      }

      /* Header */
      .ui-connection-test-panel__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-md, 1rem) var(--space-lg, 1.25rem);
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.1));
      }

      :scope[data-size="sm"] .ui-connection-test-panel__header {
        padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
      }
      :scope[data-size="lg"] .ui-connection-test-panel__header {
        padding: var(--space-lg, 1.25rem) var(--space-xl, 1.5rem);
      }

      .ui-connection-test-panel__title {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary, oklch(90% 0 0));
      }

      :scope[data-size="lg"] .ui-connection-test-panel__title {
        font-size: var(--text-base, 1rem);
      }

      .ui-connection-test-panel__actions {
        display: flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
      }

      .ui-connection-test-panel__btn {
        all: unset;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.625rem;
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        border-radius: var(--radius-sm, 0.375rem);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.15));
        color: var(--text-primary, oklch(90% 0 0));
        transition: background 0.15s ease, border-color 0.15s ease;
      }

      .ui-connection-test-panel__btn:hover {
        background: var(--bg-elevated, oklch(100% 0 0 / 0.06));
      }

      .ui-connection-test-panel__btn:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      .ui-connection-test-panel__btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .ui-connection-test-panel__btn--cancel {
        color: var(--text-tertiary, oklch(55% 0 0));
        border-color: transparent;
      }

      /* Step list */
      .ui-connection-test-panel__steps {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
      }

      .ui-connection-test-panel__step {
        display: flex;
        align-items: flex-start;
        gap: var(--space-sm, 0.5rem);
        padding: var(--space-sm, 0.5rem) var(--space-lg, 1.25rem);
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.05));
      }

      :scope[data-size="sm"] .ui-connection-test-panel__step {
        padding: var(--space-2xs, 0.125rem) var(--space-sm, 0.5rem);
        gap: var(--space-xs, 0.25rem);
      }

      .ui-connection-test-panel__step:last-child {
        border-block-end: none;
      }

      /* Stagger entrance */
      :scope:not([data-motion="0"]) .ui-connection-test-panel__step {
        animation: ui-ctp-step-enter 0.3s cubic-bezier(0.34, 1.2, 0.64, 1) both;
      }
      :scope:not([data-motion="0"]) .ui-connection-test-panel__step:nth-child(1) { animation-delay: 0ms; }
      :scope:not([data-motion="0"]) .ui-connection-test-panel__step:nth-child(2) { animation-delay: 60ms; }
      :scope:not([data-motion="0"]) .ui-connection-test-panel__step:nth-child(3) { animation-delay: 120ms; }
      :scope:not([data-motion="0"]) .ui-connection-test-panel__step:nth-child(4) { animation-delay: 180ms; }
      :scope:not([data-motion="0"]) .ui-connection-test-panel__step:nth-child(5) { animation-delay: 240ms; }
      :scope:not([data-motion="0"]) .ui-connection-test-panel__step:nth-child(6) { animation-delay: 300ms; }
      :scope:not([data-motion="0"]) .ui-connection-test-panel__step:nth-child(7) { animation-delay: 360ms; }
      :scope:not([data-motion="0"]) .ui-connection-test-panel__step:nth-child(8) { animation-delay: 420ms; }

      @keyframes ui-ctp-step-enter {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }

      :scope[data-motion="0"] .ui-connection-test-panel__step {
        animation: none;
      }

      /* Step icon */
      .ui-connection-test-panel__icon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 1.5rem;
        block-size: 1.5rem;
        border-radius: 50%;
        font-size: 0.75rem;
        font-weight: 700;
        margin-block-start: 0.0625rem;
      }

      :scope[data-size="sm"] .ui-connection-test-panel__icon {
        inline-size: 1.125rem;
        block-size: 1.125rem;
        font-size: 0.625rem;
      }

      :scope[data-size="lg"] .ui-connection-test-panel__icon {
        inline-size: 1.875rem;
        block-size: 1.875rem;
        font-size: 0.875rem;
      }

      .ui-connection-test-panel__icon[data-status="pending"] {
        background: var(--border-subtle, oklch(100% 0 0 / 0.06));
        color: var(--text-tertiary, oklch(55% 0 0));
        border: 1.5px dashed var(--border-strong, oklch(100% 0 0 / 0.15));
      }

      .ui-connection-test-panel__icon[data-status="running"] {
        background: oklch(65% 0.2 270 / 0.15);
        color: oklch(65% 0.2 270);
        border: 1.5px solid oklch(65% 0.2 270);
        animation: ui-ctp-spin 1s linear infinite;
      }

      .ui-connection-test-panel__icon[data-status="passed"] {
        background: oklch(72% 0.19 155 / 0.15);
        color: oklch(72% 0.19 155);
        border: 1.5px solid oklch(72% 0.19 155);
      }

      .ui-connection-test-panel__icon[data-status="failed"] {
        background: oklch(62% 0.22 25 / 0.15);
        color: oklch(62% 0.22 25);
        border: 1.5px solid oklch(62% 0.22 25);
      }

      .ui-connection-test-panel__icon[data-status="skipped"] {
        background: var(--border-subtle, oklch(100% 0 0 / 0.04));
        color: var(--text-tertiary, oklch(55% 0 0));
        border: 1.5px solid var(--border-default, oklch(100% 0 0 / 0.1));
      }

      @keyframes ui-ctp-spin {
        to { transform: rotate(360deg); }
      }

      :scope[data-motion="0"] .ui-connection-test-panel__icon[data-status="running"] {
        animation: none;
      }

      /* Step content */
      .ui-connection-test-panel__content {
        display: flex;
        flex-direction: column;
        gap: 0.0625rem;
        min-inline-size: 0;
        flex: 1;
      }

      .ui-connection-test-panel__row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-sm, 0.5rem);
      }

      .ui-connection-test-panel__label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.4;
      }

      :scope[data-size="sm"] .ui-connection-test-panel__label {
        font-size: var(--text-xs, 0.75rem);
      }

      .ui-connection-test-panel__badge {
        display: inline-flex;
        align-items: center;
        padding: 0.0625rem 0.375rem;
        font-size: 0.625rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-radius: var(--radius-xs, 0.25rem);
      }

      .ui-connection-test-panel__badge[data-status="pending"] {
        background: oklch(100% 0 0 / 0.06);
        color: var(--text-tertiary, oklch(55% 0 0));
      }
      .ui-connection-test-panel__badge[data-status="running"] {
        background: oklch(65% 0.2 270 / 0.12);
        color: oklch(65% 0.2 270);
      }
      .ui-connection-test-panel__badge[data-status="passed"] {
        background: oklch(72% 0.19 155 / 0.12);
        color: oklch(72% 0.19 155);
      }
      .ui-connection-test-panel__badge[data-status="failed"] {
        background: oklch(62% 0.22 25 / 0.12);
        color: oklch(62% 0.22 25);
      }
      .ui-connection-test-panel__badge[data-status="skipped"] {
        background: oklch(100% 0 0 / 0.04);
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      .ui-connection-test-panel__duration {
        font-size: var(--text-xs, 0.75rem);
        font-variant-numeric: tabular-nums;
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      .ui-connection-test-panel__message {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1.4;
        padding-block-start: 0.125rem;
      }

      .ui-connection-test-panel__step[data-status="failed"] .ui-connection-test-panel__message {
        color: oklch(62% 0.22 25);
      }

      /* Footer summary */
      .ui-connection-test-panel__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-sm, 0.5rem) var(--space-lg, 1.25rem);
        border-block-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.1));
        font-size: var(--text-xs, 0.75rem);
        font-variant-numeric: tabular-nums;
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      :scope[data-size="sm"] .ui-connection-test-panel__footer {
        padding: var(--space-2xs, 0.125rem) var(--space-sm, 0.5rem);
      }

      .ui-connection-test-panel__summary {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
      }

      .ui-connection-test-panel__count--passed { color: oklch(72% 0.19 155); }
      .ui-connection-test-panel__count--failed { color: oklch(62% 0.22 25); }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 1px solid CanvasText;
        }
        .ui-connection-test-panel__icon {
          forced-color-adjust: none;
          border: 1.5px solid CanvasText;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .ui-connection-test-panel__step { animation: none; }
        .ui-connection-test-panel__icon[data-status="running"] { animation: none; }
      }
    }
  }
`

// ─── Status icons ───────────────────────────────────────────────────────────

const STATUS_ICONS: Record<TestStep['status'], string> = {
  pending: '\u2022',  // bullet
  running: '\u25E6',  // circle
  passed: '\u2713',   // check
  failed: '\u2717',   // cross
  skipped: '\u2212',  // minus
}

function formatDurationMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

// ─── Component ──────────────────────────────────────────────────────────────

function ConnectionTestPanelInner({
  steps,
  title = 'Connection Test',
  onRetry,
  onCancel,
  running = false,
  size = 'md',
  motion: motionProp,
  className,
  ...rest
}: ConnectionTestPanelProps) {
  useStyles('connection-test-panel', connectionTestPanelStyles)
  const motionLevel = useMotionLevel(motionProp)

  const passedCount = steps.filter((s) => s.status === 'passed').length
  const failedCount = steps.filter((s) => s.status === 'failed').length
  const skippedCount = steps.filter((s) => s.status === 'skipped').length
  const totalCount = steps.length

  return (
    <div
      className={cn('ui-connection-test-panel', className)}
      data-size={size}
      data-motion={motionLevel}
      role="region"
      aria-label={title}
      {...rest}
    >
      {/* Header */}
      <div className="ui-connection-test-panel__header">
        <span className="ui-connection-test-panel__title">{title}</span>
        <div className="ui-connection-test-panel__actions">
          {onCancel && running && (
            <button
              type="button"
              className="ui-connection-test-panel__btn ui-connection-test-panel__btn--cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          {onRetry && !running && (
            <button
              type="button"
              className="ui-connection-test-panel__btn"
              onClick={onRetry}
            >
              &#8635; Retry
            </button>
          )}
        </div>
      </div>

      {/* Steps */}
      <ol className="ui-connection-test-panel__steps" aria-label="Test steps">
        {steps.map((step) => (
          <li
            key={step.id}
            className="ui-connection-test-panel__step"
            data-status={step.status}
          >
            <span
              className="ui-connection-test-panel__icon"
              data-status={step.status}
              aria-hidden="true"
            >
              {STATUS_ICONS[step.status]}
            </span>
            <div className="ui-connection-test-panel__content">
              <div className="ui-connection-test-panel__row">
                <span className="ui-connection-test-panel__label">
                  {step.label}
                </span>
                <span className="ui-connection-test-panel__badge" data-status={step.status}>
                  {step.status}
                </span>
              </div>
              <div className="ui-connection-test-panel__row">
                {step.duration !== undefined && (
                  <span className="ui-connection-test-panel__duration">
                    {formatDurationMs(step.duration)}
                  </span>
                )}
              </div>
              {step.message && (
                <span className="ui-connection-test-panel__message">
                  {step.message}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>

      {/* Footer */}
      <div className="ui-connection-test-panel__footer">
        <div className="ui-connection-test-panel__summary">
          <span className="ui-connection-test-panel__count--passed">
            {passedCount} passed
          </span>
          {failedCount > 0 && (
            <span className="ui-connection-test-panel__count--failed">
              {failedCount} failed
            </span>
          )}
          {skippedCount > 0 && (
            <span>{skippedCount} skipped</span>
          )}
        </div>
        <span>{totalCount} total</span>
      </div>
    </div>
  )
}

export function ConnectionTestPanel(props: ConnectionTestPanelProps) {
  return (
    <ComponentErrorBoundary>
      <ConnectionTestPanelInner {...props} />
    </ComponentErrorBoundary>
  )
}

ConnectionTestPanel.displayName = 'ConnectionTestPanel'
