'use client'

import { HeroHighlight as BaseHeroHighlight, Highlight as BaseHighlight, type HeroHighlightProps, type HighlightProps } from '../domain/hero-highlight'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumHeroStyles = css`
  @layer premium {
    @scope (.ui-premium-hero-highlight) {
      :scope {
        position: relative;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Enhanced gradient with aurora tones */
      :scope .ui-hero-highlight {
        background:
          radial-gradient(ellipse at 40% 30%, oklch(65% 0.15 270 / 0.1), transparent 55%),
          radial-gradient(ellipse at 70% 70%, oklch(70% 0.12 200 / 0.08), transparent 55%);
      }

      /* Aurora shimmer overlay */
      :scope:not([data-motion="0"])::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          110deg,
          transparent 25%,
          oklch(75% 0.15 270 / 0.06) 50%,
          transparent 75%
        );
        background-size: 250% 100%;
        animation: ui-premium-hero-shimmer 6s ease-in-out infinite;
        pointer-events: none;
        border-radius: inherit;
      }
      @keyframes ui-premium-hero-shimmer {
        0%   { background-position: 200% 50%; }
        100% { background-position: -200% 50%; }
      }

      /* Spring-text reveal for children */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-hero-highlight > * {
        animation: ui-premium-hero-text-reveal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-hero-text-reveal {
        from { opacity: 0; transform: translateY(16px) scale(0.97); }
        70%  { transform: translateY(-2px) scale(1.01); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }

      /* Enhanced highlight glow */
      :scope .ui-highlight {
        text-shadow: 0 0 20px oklch(65% 0.2 270 / 0.3);
      }

      :scope[data-motion="0"]::after,
      :scope[data-motion="0"] .ui-hero-highlight > * {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope::after { animation: none; }
        :scope .ui-hero-highlight > * { animation: none; }
      }
    }
  }
`

export function HeroHighlight({ motion: motionProp, ...rest }: HeroHighlightProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-hero-highlight', premiumHeroStyles)

  return (
    <div className="ui-premium-hero-highlight" data-motion={motionLevel}>
      <BaseHeroHighlight motion={motionProp} {...rest} />
    </div>
  )
}

HeroHighlight.displayName = 'HeroHighlight'

export function Highlight(props: HighlightProps) {
  return <BaseHighlight {...props} />
}

Highlight.displayName = 'Highlight'
