'use client'

import { ResponsiveCard as BaseResponsiveCard, type ResponsiveCardProps } from '../domain/responsive-card'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumResponsiveCardStyles = css`
  @layer premium {
    @scope (.ui-premium-responsive-card) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Enhanced aurora glow on card */
      :scope .ui-responsive-card {
        box-shadow:
          0 0 16px -4px oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.2),
          0 0 32px -8px oklch(from var(--aurora-2, oklch(70% 0.15 330)) l c h / 0.1);
        transition: box-shadow 0.3s var(--ease-out, ease-out),
                    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Enhanced hover glow */
      @media (hover: hover) {
        :scope:not([data-motion="0"]) .ui-responsive-card:hover {
          box-shadow:
            0 0 24px -4px oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.35),
            0 0 48px -8px oklch(from var(--aurora-2, oklch(70% 0.15 330)) l c h / 0.15);
          transform: translateY(-3px) scale(1.01);
        }
      }

      /* Spring-scale entrance */
      :scope:not([data-motion="0"]) .ui-responsive-card {
        animation: ui-premium-rcard-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-rcard-enter {
        0% { opacity: 0; transform: scale(0.92); }
        60% { transform: scale(1.02); }
        100% { opacity: 1; transform: scale(1); }
      }

      /* Spring-scale responsive transition at container breakpoints */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-responsive-card {
        transition: box-shadow 0.3s var(--ease-out, ease-out),
                    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Motion 0: no effects */
      :scope[data-motion="0"] .ui-responsive-card {
        box-shadow: none;
        animation: none;
        transition: none;
      }

      /* Motion 1: glow only */
      :scope[data-motion="1"] .ui-responsive-card {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-responsive-card {
          animation: none !important;
          transition: none !important;
        }
      }

      @media (forced-colors: active) {
        :scope .ui-responsive-card { box-shadow: none; }
      }
    }
  }
`

export function ResponsiveCard({ motion: motionProp, ...rest }: ResponsiveCardProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-responsive-card', premiumResponsiveCardStyles)

  return (
    <div className="ui-premium-responsive-card" data-motion={motionLevel}>
      <BaseResponsiveCard motion={motionProp} {...rest} />
    </div>
  )
}

ResponsiveCard.displayName = 'ResponsiveCard'
