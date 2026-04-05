'use client'

import { useRef, type ReactElement } from 'react'
import { CardGrid as BaseCardGrid, type CardGridProps } from '../components/card-grid'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumCardGridStyles = css`
  @layer premium {
    @scope (.ui-premium-card-grid) {
      :scope {
        position: relative;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}

      /* Staggered entrance for children */
      :scope:not([data-motion="0"]):not([data-motion="1"]) > .ui-card-grid > * {
        animation: ui-premium-card-grid-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        animation-delay: calc(var(--child-index, 0) * 80ms);
      }

      @keyframes ui-premium-card-grid-enter {
        from {
          opacity: 0;
          transform: translateY(12px) scale(0.96);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Glass morphism effect on children */
      :scope:not([data-motion="0"]):not([data-motion="1"]) > .ui-card-grid > * {
        backdrop-filter: blur(8px) saturate(1.3);
        -webkit-backdrop-filter: blur(8px) saturate(1.3);
      }

      /* Aurora ambient border glow */
      :scope:not([data-motion="0"]):not([data-motion="1"]) > .ui-card-grid > *::before {
        content: '';
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        background: linear-gradient(135deg, oklch(65% 0.15 270 / 0.1), oklch(70% 0.12 300 / 0.06));
        z-index: -1;
        pointer-events: none;
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] > .ui-card-grid > * {
        animation: none;
        backdrop-filter: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope > .ui-card-grid > * {
          animation: none !important;
        }
      }
    }
  }
`

export function CardGrid({
  motion: motionProp,
  ...rest
}: CardGridProps & { motion?: number }): ReactElement {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const motionLevel = useMotionLevel(motionProp)
  useEntrance(wrapperRef, motionLevel >= 2 ? 'fade-up' : 'none', { duration: 300 })
  useStyles('premium-card-grid', premiumCardGridStyles)

  return (
    <div
      ref={wrapperRef}
      className="ui-premium-card-grid"
      data-motion={motionLevel}
    >
      <BaseCardGrid {...rest} />
    </div>
  )
}

CardGrid.displayName = 'CardGrid'
