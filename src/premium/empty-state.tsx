'use client'

import { useRef } from 'react'
import { EmptyState as BaseEmptyState, type EmptyStateProps } from '../domain/empty-state'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumEmptyStateStyles = css`
  @layer premium {
    @scope (.ui-premium-empty-state) {
      :scope {
        position: relative;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Spring-bounce icon entrance */
      :scope:not([data-motion="0"]) .ui-empty-state__icon {
        animation: ui-premium-empty-icon-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-empty-icon-bounce {
        from {
          opacity: 0;
          transform: translateY(-16px) scale(0.7);
        }
        65% {
          transform: translateY(3px) scale(1.06);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Aurora glow CTA button */
      :scope:not([data-motion="0"]) .ui-empty-state__actions .ui-button[data-variant="primary"],
      :scope:not([data-motion="0"]) .ui-empty-state__actions button:first-child {
        box-shadow: 0 0 18px -4px oklch(65% 0.2 270 / 0.35);
        transition: box-shadow 0.3s ease-out, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      :scope:not([data-motion="0"]) .ui-empty-state__actions .ui-button[data-variant="primary"]:hover,
      :scope:not([data-motion="0"]) .ui-empty-state__actions button:first-child:hover {
        box-shadow: 0 0 28px -4px oklch(65% 0.25 270 / 0.45);
        transform: translateY(-1px);
      }

      /* Particle float — ambient dots around icon */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-empty-state__icon::before,
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-empty-state__icon::after {
        content: '';
        position: absolute;
        border-radius: 50%;
        background: oklch(65% 0.15 270 / 0.25);
        pointer-events: none;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-empty-state__icon::before {
        width: 4px; height: 4px;
        top: -8px; right: -4px;
        animation: ui-premium-empty-float-a 3s ease-in-out infinite;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-empty-state__icon::after {
        width: 3px; height: 3px;
        bottom: -6px; left: -6px;
        animation: ui-premium-empty-float-b 3.5s ease-in-out infinite 0.5s;
      }
      @keyframes ui-premium-empty-float-a {
        0%, 100% { transform: translate(0, 0); opacity: 0.4; }
        50% { transform: translate(4px, -6px); opacity: 0.8; }
      }
      @keyframes ui-premium-empty-float-b {
        0%, 100% { transform: translate(0, 0); opacity: 0.3; }
        50% { transform: translate(-3px, 5px); opacity: 0.7; }
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-empty-state__icon {
        animation: none;
      }
      :scope[data-motion="0"] .ui-empty-state__icon::before,
      :scope[data-motion="0"] .ui-empty-state__icon::after {
        display: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-empty-state__icon { animation: none !important; }
        :scope .ui-empty-state__icon::before,
        :scope .ui-empty-state__icon::after { display: none; }
      }
    }
  }
`

export function EmptyState({
  motion: motionProp,
  ...rest
}: EmptyStateProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const motionLevel = useMotionLevel(motionProp)
  useEntrance(wrapperRef, motionLevel >= 2 ? 'fade-up' : 'none', { duration: 320 })
  useStyles('premium-empty-state', premiumEmptyStateStyles)

  return (
    <div
      ref={wrapperRef}
      className="ui-premium-empty-state"
      data-motion={motionLevel}
    >
      <BaseEmptyState motion={motionProp} {...rest} />
    </div>
  )
}

EmptyState.displayName = 'EmptyState'
