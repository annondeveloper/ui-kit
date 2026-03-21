import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteThresholdGaugeProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  thresholds?: { warning: number; critical: number }
  label?: ReactNode
  showValue?: boolean
}

/** Lite threshold gauge — falls back to a progress bar with colored thresholds */
export const ThresholdGauge = forwardRef<HTMLDivElement, LiteThresholdGaugeProps>(
  ({ value, max = 100, thresholds = { warning: 60, critical: 80 }, label, showValue, className, ...rest }, ref) => {
    const percent = Math.min(100, Math.max(0, (value / max) * 100))
    const color = percent >= thresholds.critical ? 'oklch(62% 0.22 25)' : percent >= thresholds.warning ? 'oklch(78% 0.17 85)' : 'oklch(72% 0.19 145)'
    return (
      <div ref={ref} className={`ui-lite-threshold-gauge${className ? ` ${className}` : ''}`} {...rest}>
        {label && <span className="ui-lite-threshold-gauge__label">{label}</span>}
        <div className="ui-lite-progress" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
          <div className="ui-lite-progress__fill" style={{ width: `${percent}%`, background: color }} />
        </div>
        {showValue && <span className="ui-lite-threshold-gauge__value">{value}/{max}</span>}
      </div>
    )
  }
)
ThresholdGauge.displayName = 'ThresholdGauge'
