import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const progressStyles = css`
  @layer components {
    @scope (.ui-lite-progress) {
      :scope {
        position: relative;
        display: flex;
        align-items: center;
        inline-size: 100%;
        block-size: 8px;
        background: var(--bg-surface, oklch(12% 0.015 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: 9999px;
        overflow: hidden;
      }
      :scope[data-size="xs"] { block-size: 2px; }
      :scope[data-size="sm"] { block-size: 4px; }
      :scope[data-size="md"] { block-size: 8px; }
      :scope[data-size="lg"] { block-size: 12px; }
      :scope[data-size="xl"] { block-size: 16px; }

      .ui-lite-progress__fill {
        block-size: 100%;
        background: var(--brand, oklch(65% 0.2 270));
        border-radius: 9999px;
      }

      :scope[data-indeterminate] .ui-lite-progress__fill {
        inline-size: 40%;
        opacity: 0.6;
      }

      .ui-lite-progress__value {
        position: absolute;
        inset-inline-end: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-secondary, oklch(70% 0 0));
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }

      @media (forced-colors: active) {
        :scope { border: 1px solid ButtonText; }
        .ui-lite-progress__fill { background: Highlight; }
      }
    }
  }
`

export interface LiteProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'success' | 'warning' | 'danger'
  label?: string
  showValue?: boolean
}

export const Progress = forwardRef<HTMLDivElement, LiteProgressProps>(
  ({ value, max = 100, size = 'md', variant = 'default', label, showValue = false, className, ...rest }, ref) => {
    useStyles('lite-progress', progressStyles)
    const isIndeterminate = value === undefined
    const clampedValue = isIndeterminate ? undefined : Math.min(Math.max(0, value), max)
    const percent = isIndeterminate ? undefined : Math.round((clampedValue! / max) * 100)

    const variantColors: Record<string, string> = {
      default: 'var(--brand, oklch(65% 0.2 270))',
      success: 'var(--status-ok, oklch(72% 0.19 155))',
      warning: 'var(--status-warning, oklch(78% 0.17 85))',
      danger: 'var(--status-critical, oklch(62% 0.22 25))',
    }

    return (
      <div
        ref={ref}
        className={`ui-lite-progress${className ? ` ${className}` : ''}`}
        role="progressbar"
        aria-label={label}
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        data-size={size}
        data-variant={variant}
        {...(isIndeterminate ? { 'data-indeterminate': '' } : {})}
        {...rest}
      >
        <div
          className="ui-lite-progress__fill"
          style={!isIndeterminate ? {
            width: `${percent}%`,
            background: variantColors[variant] || variantColors.default,
          } : undefined}
        />
        {showValue && !isIndeterminate && (
          <span className="ui-lite-progress__value">{percent}%</span>
        )}
      </div>
    )
  }
)
Progress.displayName = 'Progress'
