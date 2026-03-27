'use client'

import { type SpotlightCardProps, SpotlightCard as BaseSpotlightCard } from '../domain/spotlight-card'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumSpotlightCardStyles = css`
  @layer premium {
    @scope (.ui-premium-spotlight-card) {
      :scope {
        position: relative;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Enhanced spotlight radius */
      :scope .ui-spotlight-card {
        --spotlight-size: 350px;
      }
      :scope:hover .ui-spotlight-card {
        --spotlight-size: 450px;
      }

      /* Aurora color blend — multi-layer glow */
      :scope:not([data-motion="0"]) .ui-spotlight-card::before {
        content: '';
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        background: conic-gradient(
          from 180deg,
          oklch(65% 0.2 270 / 0.08),
          oklch(70% 0.18 200 / 0.06),
          oklch(65% 0.15 330 / 0.08),
          oklch(65% 0.2 270 / 0.08)
        );
        z-index: -1;
        opacity: 0;
        transition: opacity 0.4s ease;
      }
      :scope:not([data-motion="0"]):hover .ui-spotlight-card::before {
        opacity: 1;
      }

      /* Ambient border glow */
      :scope:not([data-motion="0"]) .ui-spotlight-card {
        transition: box-shadow 0.4s ease;
      }
      :scope:not([data-motion="0"]):hover .ui-spotlight-card {
        box-shadow:
          0 0 24px -6px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2),
          0 0 48px -12px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1);
      }

      /* Spring entrance */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-spotlight-card {
        animation: ui-premium-spotlight-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-spotlight-enter {
        from {
          opacity: 0;
          transform: scale(0.96) translateY(6px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      /* Motion 0: disable */
      :scope[data-motion="0"] .ui-spotlight-card {
        transition: none;
        animation: none;
      }
      :scope[data-motion="0"] .ui-spotlight-card::before {
        display: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-spotlight-card { transition: none; animation: none; }
        :scope .ui-spotlight-card::before { display: none; }
      }
    }
  }
`

export function SpotlightCard({ motion: motionProp, ...rest }: SpotlightCardProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-spotlight-card', premiumSpotlightCardStyles)

  return (
    <div className="ui-premium-spotlight-card" data-motion={motionLevel}>
      <BaseSpotlightCard motion={motionProp} {...rest} />
    </div>
  )
}

SpotlightCard.displayName = 'SpotlightCard'
