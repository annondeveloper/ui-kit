import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteConfidenceBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  label?: ReactNode
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const ConfidenceBar = forwardRef<HTMLDivElement, LiteConfidenceBarProps>(
  ({ value, label, showValue, size = 'md', className, ...rest }, ref) => {
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
