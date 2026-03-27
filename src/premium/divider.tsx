'use client'

import { forwardRef } from 'react'
import { Divider as BaseDivider, type DividerProps } from '../components/divider'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumDividerStyles = css`
  @layer premium {
    @scope (.ui-premium-divider) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Shimmer gradient sweep along the line */
      :scope .ui-divider {
        border-image: linear-gradient(
          90deg,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.06) 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2) 45%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.06) 55%,
          transparent 100%
        ) 1;
        background: linear-gradient(
          90deg,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.04) 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15) 45%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.04) 55%,
          transparent 100%
        );
        background-size: 200% 100%;
        background-clip: padding-box;
        animation: ui-premium-divider-sweep 4s ease-in-out infinite alternate;
      }
      @keyframes ui-premium-divider-sweep {
        from { background-position: 100% 0; }
        to { background-position: 0% 0; }
      }

      /* Aurora glow on label */
      :scope .ui-divider__label {
        text-shadow:
          0 0 8px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3),
          0 0 20px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
        color: oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.1) c h);
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-divider { animation: none; }
      }
    }
  }
`

export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  (props, ref) => {
    useStyles('premium-divider', premiumDividerStyles)

    return (
      <span className="ui-premium-divider">
        <BaseDivider ref={ref} {...props} />
      </span>
    )
  }
)

Divider.displayName = 'Divider'
