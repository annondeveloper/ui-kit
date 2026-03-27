'use client'

import { useRef } from 'react'
import { EntityCard as BaseEntityCard, type EntityCardProps } from '../domain/entity-card'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumEntityCardStyles = css`
  @layer premium {
    @scope (.ui-premium-entity-card) {
      :scope {
        position: relative;
      }
      /* Aurora border glow on hover */
      :scope:not([data-motion="0"])::after {
        content: '';
        position: absolute;
        inset: -1px;
        border-radius: var(--radius-lg, 0.75rem);
        background: linear-gradient(
          135deg,
          oklch(70% 0.15 270 / 0.15),
          oklch(70% 0.15 330 / 0.1),
          oklch(70% 0.15 200 / 0.15)
        );
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        z-index: 0;
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask-composite: exclude;
        padding: 1px;
      }
      @media (hover: hover) {
        :scope:not([data-motion="0"]):hover::after {
          opacity: 1;
        }
      }
      /* Enhanced status dot with aurora glow ring */
      :scope:not([data-motion="0"]) .ui-entity-card__status-dot {
        animation: ui-premium-entity-dot-pulse 2s ease-in-out infinite;
        box-shadow: 0 0 4px currentColor;
      }
      @keyframes ui-premium-entity-dot-pulse {
        0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 4px currentColor; }
        50% { opacity: 0.7; transform: scale(0.8); box-shadow: 0 0 10px currentColor, 0 0 20px currentColor; }
      }

      /* Status shimmer for critical */
      :scope:not([data-motion="0"]) .ui-entity-card[data-status="critical"] {
        animation: ui-premium-entity-critical-pulse 3s ease-in-out infinite;
      }
      @keyframes ui-premium-entity-critical-pulse {
        0%, 100% { box-shadow: 0 0 0 oklch(62% 0.22 25 / 0); }
        50% { box-shadow: 0 0 16px oklch(62% 0.22 25 / 0.15); }
      }
      /* Tag entrance stagger at motion 3 */
      :scope:not([data-motion="0"]):not([data-motion="1"]):not([data-motion="2"])
        .ui-entity-card__tag {
        animation: ui-premium-tag-fade 0.2s ease-out both;
      }
      :scope .ui-entity-card__tag:nth-child(1) { animation-delay: 0.05s; }
      :scope .ui-entity-card__tag:nth-child(2) { animation-delay: 0.1s; }
      :scope .ui-entity-card__tag:nth-child(3) { animation-delay: 0.15s; }
      :scope .ui-entity-card__tag:nth-child(4) { animation-delay: 0.2s; }
      :scope .ui-entity-card__tag:nth-child(5) { animation-delay: 0.25s; }
      @keyframes ui-premium-tag-fade {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      /* Motion 0: disable all */
      :scope[data-motion="0"]::after {
        display: none;
      }
      :scope[data-motion="0"] .ui-entity-card[data-status="critical"] {
        animation: none;
      }
      :scope[data-motion="0"] .ui-entity-card__tag {
        animation: none;
      }
    }
  }
`

export function EntityCard({
  motion: motionProp,
  ...rest
}: EntityCardProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const motionLevel = useMotionLevel(motionProp)
  useEntrance(wrapperRef, motionLevel >= 2 ? 'fade-up' : 'none', { duration: 280 })
  useStyles('premium-entity-card', premiumEntityCardStyles)

  return (
    <div
      ref={wrapperRef}
      className="ui-premium-entity-card"
      data-motion={motionLevel}
    >
      <BaseEntityCard motion={motionProp} {...rest} />
    </div>
  )
}

EntityCard.displayName = 'EntityCard'
