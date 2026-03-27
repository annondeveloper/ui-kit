'use client'

import { useRef } from 'react'
import { PropertyList as BasePropertyList, type PropertyListProps } from '../domain/property-list'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumPropertyListStyles = css`
  @layer premium {
    @scope (.ui-premium-property-list) {
      :scope {
        position: relative;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}

      /* Shimmer highlight on row hover */
      :scope .ui-property-list__row {
        position: relative;
        overflow: hidden;
      }
      :scope:not([data-motion="0"]) .ui-property-list__row::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(65% 0.2 270 / 0.04) 50%,
          transparent 100%
        );
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }
      :scope:not([data-motion="0"]) .ui-property-list__row:hover::after {
        opacity: 1;
      }
      /* Copy success flash */
      :scope .ui-property-list__copy[data-copied]::before {
        content: '';
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        background: oklch(72% 0.19 155 / 0.2);
        animation: ui-premium-copy-flash 0.4s ease-out forwards;
        pointer-events: none;
      }
      @keyframes ui-premium-copy-flash {
        from { transform: scale(0.8); opacity: 1; }
        to { transform: scale(1.8); opacity: 0; }
      }
      /* Motion 0: disable */
      :scope[data-motion="0"] .ui-property-list__row::after {
        display: none;
      }
      :scope[data-motion="0"] .ui-property-list__copy::before {
        display: none;
      }
    }
  }
`

export function PropertyList({
  motion: motionProp,
  ...rest
}: PropertyListProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const motionLevel = useMotionLevel(motionProp)
  useEntrance(wrapperRef, motionLevel >= 2 ? 'fade-up' : 'none', { duration: 280 })
  useStyles('premium-property-list', premiumPropertyListStyles)

  return (
    <div
      ref={wrapperRef}
      className="ui-premium-property-list"
      data-motion={motionLevel}
    >
      <BasePropertyList motion={motionProp} {...rest} />
    </div>
  )
}

PropertyList.displayName = 'PropertyList'
