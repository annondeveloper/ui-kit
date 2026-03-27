'use client'

import { GlowCard as BaseGlowCard, type GlowCardProps } from '../domain/glow-card'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumGlowCardStyles = css`
  @layer premium {
    @scope (.ui-premium-glow-card) {
      :scope {
        position: relative;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Multi-layer glow enhancement */
      :scope .ui-glow-card {
        box-shadow:
          0 0 15px oklch(65% 0.2 270 / 0.15),
          0 0 40px oklch(70% 0.15 240 / 0.08),
          0 0 80px oklch(60% 0.1 300 / 0.04);
      }
      :scope .ui-glow-card:hover {
        box-shadow:
          0 0 20px oklch(65% 0.25 270 / 0.25),
          0 0 50px oklch(70% 0.18 240 / 0.12),
          0 0 100px oklch(60% 0.12 300 / 0.06);
      }

      /* Aurora color-shift background layer */
      :scope::before {
        content: '';
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        background: linear-gradient(
          135deg,
          oklch(65% 0.15 270 / 0.08),
          oklch(70% 0.12 200 / 0.06),
          oklch(60% 0.1 330 / 0.08)
        );
        pointer-events: none;
        z-index: 0;
      }

      /* Animated aurora shift */
      :scope:not([data-motion="0"]):not([data-motion="1"])::before {
        animation: ui-premium-glow-shift 8s ease-in-out infinite alternate;
      }
      @keyframes ui-premium-glow-shift {
        0%   { background-position: 0% 50%; opacity: 0.7; }
        50%  { opacity: 1; }
        100% { background-position: 100% 50%; opacity: 0.7; }
      }

      /* Spring-scale entrance */
      :scope:not([data-motion="0"]) .ui-glow-card {
        animation: ui-premium-glow-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-glow-enter {
        from { opacity: 0; transform: scale(0.95) translateY(8px); }
        70%  { transform: scale(1.01) translateY(-1px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }

      :scope[data-motion="0"] .ui-glow-card,
      :scope[data-motion="0"]::before {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-glow-card { animation: none; }
        :scope::before { animation: none; }
      }
    }
  }
`

export function GlowCard({ motion: motionProp, ...rest }: GlowCardProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-glow-card', premiumGlowCardStyles)

  return (
    <div className="ui-premium-glow-card" data-motion={motionLevel}>
      <BaseGlowCard motion={motionProp} {...rest} />
    </div>
  )
}

GlowCard.displayName = 'GlowCard'
