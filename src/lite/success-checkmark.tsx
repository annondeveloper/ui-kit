import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const successCheckmarkStyles = css`
  @layer components {
    @scope (.ui-lite-success-checkmark) {
      :scope {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: oklch(72% 0.19 145 / 0.12);
        color: oklch(72% 0.19 145);
        font-weight: 700;
        line-height: 1;
      }

      :scope[data-size="sm"] { inline-size: 24px; block-size: 24px; font-size: 0.75rem; }
      :scope:not([data-size]),
      :scope[data-size="md"] { inline-size: 36px; block-size: 36px; font-size: 1.125rem; }
      :scope[data-size="lg"] { inline-size: 48px; block-size: 48px; font-size: 1.5rem; }

      @media (forced-colors: active) {
        :scope { border: 1px solid CanvasText; }
      }
    }
  }
`

export interface LiteSuccessCheckmarkProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg'
  /** Trigger CSS animation (accepted for API parity; Lite uses CSS only) */
  animated?: boolean
  /** Overrides the default aria-label */
  label?: string
}

/** Lite success checkmark — static checkmark, no JS animation */
export const SuccessCheckmark = forwardRef<HTMLSpanElement, LiteSuccessCheckmarkProps>(
  ({ size = 'md', animated, label, className, ...rest }, ref) => {
    useStyles('lite-success-checkmark', successCheckmarkStyles)
    return (
      <span
        ref={ref}
        className={`ui-lite-success-checkmark${className ? ` ${className}` : ''}`}
        data-size={size}
        data-animated={animated ? '' : undefined}
        role="img"
        aria-label={label ?? 'Success'}
        {...rest}
      >
        &#x2713;
      </span>
    )
  }
)
SuccessCheckmark.displayName = 'SuccessCheckmark'
