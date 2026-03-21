import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteUtilizationSegment {
  value: number
  color?: string
  label?: string
}

export interface LiteUtilizationBarProps extends HTMLAttributes<HTMLDivElement> {
  segments: LiteUtilizationSegment[]
  max?: number
}

export const UtilizationBar = forwardRef<HTMLDivElement, LiteUtilizationBarProps>(
  ({ segments, max = 100, className, ...rest }, ref) => (
    <div ref={ref} className={`ui-lite-utilization-bar${className ? ` ${className}` : ''}`} role="meter" aria-valuemin={0} aria-valuemax={max} {...rest}>
      <div className="ui-lite-utilization-bar__track">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="ui-lite-utilization-bar__segment"
            style={{ width: `${(seg.value / max) * 100}%`, background: seg.color }}
            title={seg.label ?? `${seg.value}`}
          />
        ))}
      </div>
    </div>
  )
)
UtilizationBar.displayName = 'UtilizationBar'
