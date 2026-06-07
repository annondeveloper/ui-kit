import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const confidenceBarStyles = css`
  @layer components {
    @scope (.ui-lite-confidence-bar) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
      }
      .ui-lite-confidence-bar__label {
        font-size: var(--text-sm, 0.8125rem);
        color: var(--text-secondary, oklch(70% 0 0));
      }
      .ui-lite-confidence-bar__value {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary, oklch(70% 0 0));
        text-align: end;
      }
      .ui-lite-progress {
        inline-size: 100%;
        block-size: 8px;
        background: var(--bg-surface, oklch(12% 0.015 270));
        border-radius: 9999px;
        overflow: hidden;
      }
      .ui-lite-progress__fill {
        block-size: 100%;
        background: var(--brand, oklch(65% 0.2 270));
        border-radius: 9999px;
      }
      :scope[data-size="sm"] .ui-lite-progress { block-size: 6px; }
      :scope[data-size="lg"] .ui-lite-progress { block-size: 12px; }
    }
  }
`

export interface LiteConfidenceBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  label?: ReactNode
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const ConfidenceBar = forwardRef<HTMLDivElement, LiteConfidenceBarProps>(
  ({ value, label, showValue, size = 'md', className, ...rest }, ref) => {
    useStyles('lite-confidence-bar', confidenceBarStyles)
    const clamped = Math.min(100, Math.max(0, value))
    const color = clamped >= 70 ? 'oklch(72% 0.19 145)' : clamped >= 40 ? 'oklch(78% 0.17 85)' : 'oklch(62% 0.22 25)'
    return (
      <div ref={ref} className={`ui-lite-confidence-bar${className ? ` ${className}` : ''}`} data-size={size} {...rest}>
        {label && <span className="ui-lite-confidence-bar__label">{label}</span>}
        <div className="ui-lite-progress" role="meter" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
          <div className="ui-lite-progress__fill" style={{ width: `${clamped}%`, background: color }} />
        </div>
        {showValue && <span className="ui-lite-confidence-bar__value">{clamped}%</span>}
      </div>
    )
  }
)
ConfidenceBar.displayName = 'ConfidenceBar'
