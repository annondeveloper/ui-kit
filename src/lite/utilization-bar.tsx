import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

export interface LiteUtilizationSegment {
  value: number
  color?: string
  label?: string
}

export interface LiteUtilizationBarProps extends HTMLAttributes<HTMLDivElement> {
  segments: LiteUtilizationSegment[]
  max?: number
}

const utilizationBarStyles = css`
  @layer components {
    @scope (.ui-lite-utilization-bar) {
      :scope {
        position: relative;
        min-inline-size: 120px;
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
      }

      .ui-lite-utilization-bar__track {
        position: relative;
        display: flex;
        inline-size: 100%;
        block-size: 0.5rem;
        overflow: hidden;
        border-radius: var(--radius-full, 9999px);
        background: var(--bg-muted, oklch(100% 0 0 / 0.06));
      }

      .ui-lite-utilization-bar__segment {
        block-size: 100%;
        background: var(--brand, oklch(65% 0.2 270));
      }

      .ui-lite-utilization-bar__segment:first-child {
        border-start-start-radius: var(--radius-full, 9999px);
        border-end-start-radius: var(--radius-full, 9999px);
      }

      .ui-lite-utilization-bar__segment:last-child {
        border-start-end-radius: var(--radius-full, 9999px);
        border-end-end-radius: var(--radius-full, 9999px);
      }

      @media (forced-colors: active) {
        .ui-lite-utilization-bar__track {
          border: 1px solid GrayText;
        }
        .ui-lite-utilization-bar__segment {
          forced-color-adjust: none;
        }
      }
    }
  }
`

export const UtilizationBar = forwardRef<HTMLDivElement, LiteUtilizationBarProps>(
  ({ segments, max = 100, className, ...rest }, ref) => {
    useStyles('lite-utilization-bar', utilizationBarStyles)
    return (
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
  }
)
UtilizationBar.displayName = 'UtilizationBar'
