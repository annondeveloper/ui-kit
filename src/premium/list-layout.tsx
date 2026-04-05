'use client'

import { useRef, type ReactElement } from 'react'
import { ListLayout as BaseListLayout, type ListLayoutProps } from '../components/list-layout'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumListLayoutStyles = css`
  @layer premium {
    @scope (.ui-premium-list-layout) {
      :scope {
        position: relative;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}

      /* Staggered entrance for children */
      :scope:not([data-motion="0"]):not([data-motion="1"]) > .ui-list-layout > * {
        animation: ui-premium-list-enter 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        animation-delay: calc(var(--child-index, 0) * 60ms);
      }

      @keyframes ui-premium-list-enter {
        from {
          opacity: 0;
          transform: translateX(-8px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      /* Subtle hover glow on children */
      @media (hover: hover) {
        :scope:not([data-motion="0"]) > .ui-list-layout > *:hover {
          box-shadow: 0 0 16px -4px oklch(65% 0.15 270 / 0.15);
          transition: box-shadow 0.2s ease-out;
        }
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] > .ui-list-layout > * {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope > .ui-list-layout > * {
          animation: none !important;
        }
      }
    }
  }
`

export function ListLayout({
  motion: motionProp,
  ...rest
}: ListLayoutProps & { motion?: number }): ReactElement {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const motionLevel = useMotionLevel(motionProp)
  useEntrance(wrapperRef, motionLevel >= 2 ? 'fade-up' : 'none', { duration: 280 })
  useStyles('premium-list-layout', premiumListLayoutStyles)

  return (
    <div
      ref={wrapperRef}
      className="ui-premium-list-layout"
      data-motion={motionLevel}
    >
      <BaseListLayout {...rest} />
    </div>
  )
}

ListLayout.displayName = 'ListLayout'
