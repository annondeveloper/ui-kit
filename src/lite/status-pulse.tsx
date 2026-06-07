import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const statusPulseStyles = css`
  @layer components {
    @scope (.ui-lite-status-pulse) {
      :scope {
        display: inline-block;
        inline-size: 10px;
        block-size: 10px;
        border-radius: 50%;
      }

      :scope[data-size="sm"] { inline-size: 6px; block-size: 6px; }
      :scope[data-size="lg"] { inline-size: 14px; block-size: 14px; }

      :scope[data-status="ok"] { background: oklch(72% 0.19 145); }
      :scope[data-status="warning"] { background: oklch(78% 0.17 85); }
      :scope[data-status="critical"] { background: oklch(62% 0.22 25); }
      :scope[data-status="info"] { background: oklch(70% 0.17 250); }

      @media (forced-colors: active) {
        :scope { border: 1px solid CanvasText; }
      }
    }
  }
`

export interface LiteStatusPulseProps extends HTMLAttributes<HTMLSpanElement> {
  status: 'ok' | 'warning' | 'critical' | 'info'
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export const StatusPulse = forwardRef<HTMLSpanElement, LiteStatusPulseProps>(
  ({ status, size = 'md', label, className, ...rest }, ref) => {
    useStyles('lite-status-pulse', statusPulseStyles)
    return (
      <span
        ref={ref}
        className={`ui-lite-status-pulse${className ? ` ${className}` : ''}`}
        data-status={status}
        data-size={size}
        aria-label={label ?? status}
        {...rest}
      />
    )
  }
)
StatusPulse.displayName = 'StatusPulse'
