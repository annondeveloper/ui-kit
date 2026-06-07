import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const ringChartStyles = css`
  @layer components {
    @scope (.ui-lite-ring-chart) {
      :scope {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--text-primary, oklch(97% 0 0));
      }
      :scope svg { display: block; }
      :scope > span {
        position: absolute;
        font-size: 0.75rem;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        color: var(--text-primary, oklch(97% 0 0));
      }
    }
  }
`

export interface LiteRingChartProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  size?: number
  thickness?: number
  color?: string
  label?: ReactNode
  showValue?: boolean
}

/** Lite ring chart — simple SVG donut, no animation */
export const RingChart = forwardRef<HTMLDivElement, LiteRingChartProps>(
  ({ value, max = 100, size = 64, thickness = 6, color = 'var(--brand, oklch(65% 0.2 270))', label, showValue, className, style, ...rest }, ref) => {
    useStyles('lite-ring-chart', ringChartStyles)
    const pct = Math.min(100, Math.max(0, (value / max) * 100))
    const r = (size - thickness) / 2
    const circ = 2 * Math.PI * r
    const offset = circ - (pct / 100) * circ

    return (
      <div
        ref={ref}
        className={`ui-lite-ring-chart${className ? ` ${className}` : ''}`}
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, ...style }}
        {...rest}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="oklch(100% 0 0 / 0.06)" strokeWidth={thickness} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={thickness} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        {(showValue || label) && (
          <span style={{ position: 'absolute', fontSize: '0.75rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {label ?? `${Math.round(pct)}%`}
          </span>
        )}
      </div>
    )
  }
)
RingChart.displayName = 'RingChart'
