'use client'

import { forwardRef } from 'react'
import { Typography as BaseTypography, type TypographyProps } from '../components/typography'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumTypographyStyles = css`
  @layer premium {
    @scope (.ui-premium-typography) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Shimmer gradient text for headings — motion 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-typography[data-variant^="h"] {
        background: linear-gradient(
          110deg,
          var(--text-primary, oklch(90% 0 0)) 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.15) c h) 40%,
          var(--text-primary, oklch(90% 0 0)) 60%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.1) c h) 100%
        );
        background-size: 250% 100%;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: ui-premium-typo-shimmer 3s ease-in-out infinite;
      }

      /* Static gradient for headings — motion 1 */
      :scope[data-motion="1"] .ui-typography[data-variant^="h"] {
        background: linear-gradient(
          110deg,
          var(--text-primary, oklch(90% 0 0)) 20%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.15) c h) 80%
        );
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      @keyframes ui-premium-typo-shimmer {
        0%   { background-position: 100% 50%; }
        50%  { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
      }

      /* Aurora glow on code variant */
      :scope .ui-typography[data-variant="code"] {
        box-shadow: 0 0 10px -3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3);
        border: 1px solid oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1);
      }

      /* Spring-fade entrance — motion 1+ */
      :scope:not([data-motion="0"]) .ui-typography {
        animation: ui-premium-typo-fade 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }

      @keyframes ui-premium-typo-fade {
        from {
          opacity: 0;
          transform: translateY(4px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Motion 0: no animations */
      :scope[data-motion="0"] .ui-typography {
        animation: none;
        -webkit-text-fill-color: unset;
        background: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-typography {
          animation: none;
          -webkit-text-fill-color: unset;
          background: none;
        }
      }
    }
  }
`

export const Typography = forwardRef<HTMLElement, TypographyProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-typography', premiumTypographyStyles)

    return (
      <span className="ui-premium-typography" data-motion={motionLevel}>
        <BaseTypography ref={ref} motion={motionProp} {...rest} />
      </span>
    )
  }
)

Typography.displayName = 'Typography'
