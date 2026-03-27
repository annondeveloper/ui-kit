'use client'

import { forwardRef } from 'react'
import { FilterPill as BaseFilterPill, type FilterPillProps } from '../components/filter-pill'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumFilterPillStyles = css`
  @layer premium {
    @scope (.ui-premium-filter-pill) {
      :scope {
        position: relative;
        display: inline-flex;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Spring-scale on select/deselect */
      :scope:not([data-motion="0"]) .ui-filter-pill {
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                    box-shadow 0.3s var(--ease-out, ease-out);
      }
      :scope:not([data-motion="0"]) .ui-filter-pill:active {
        transform: scale(0.92);
      }

      /* Aurora glow on active */
      :scope .ui-filter-pill[data-active] {
        box-shadow:
          0 0 10px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.35),
          0 0 24px -6px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2);
      }

      /* Shimmer sweep on active pills */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-filter-pill[data-active]::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(
          110deg,
          transparent 30%,
          oklch(100% 0 0 / 0.1) 45%,
          oklch(100% 0 0 / 0.18) 50%,
          oklch(100% 0 0 / 0.1) 55%,
          transparent 70%
        );
        background-size: 250% 100%;
        pointer-events: none;
        animation: ui-premium-pill-shimmer 2.5s ease-in-out infinite;
      }
      @keyframes ui-premium-pill-shimmer {
        0% { background-position: 200% center; }
        100% { background-position: -50% center; }
      }

      /* Ensure filter-pill has position for pseudo-element */
      :scope .ui-filter-pill[data-active] {
        position: relative;
        overflow: hidden;
      }

      /* Spring-scale entry animation */
      :scope:not([data-motion="0"]) .ui-filter-pill {
        animation: ui-premium-pill-enter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-pill-enter {
        from {
          opacity: 0;
          transform: scale(0.7);
        }
        70% {
          transform: scale(1.06);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* Motion 0: no animation */
      :scope[data-motion="0"] .ui-filter-pill {
        animation: none;
        transition: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-filter-pill { animation: none; transition: none; }
        :scope .ui-filter-pill[data-active]::after { animation: none; }
      }
    }
  }
`

export const FilterPill = forwardRef<HTMLButtonElement, FilterPillProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-filter-pill', premiumFilterPillStyles)

    return (
      <span className="ui-premium-filter-pill" data-motion={motionLevel}>
        <BaseFilterPill ref={ref} motion={motionProp} {...rest} />
      </span>
    )
  }
)

FilterPill.displayName = 'FilterPill'
