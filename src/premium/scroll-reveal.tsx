'use client'

import { ScrollReveal as BaseScrollReveal, type ScrollRevealProps } from '../domain/scroll-reveal'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumScrollRevealStyles = css`
  @layer premium {
    @scope (.ui-premium-scroll-reveal) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Enhanced spring-entrance with overshoot */
      :scope .ui-scroll-reveal[data-revealed="true"]:not([data-motion="0"]) {
        transition:
          opacity 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) var(--scroll-reveal-delay, 0ms),
          transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) var(--scroll-reveal-delay, 0ms);
      }

      /* Larger initial offset for more dramatic reveal */
      :scope .ui-scroll-reveal:not([data-revealed="true"]):not([data-motion="0"])[data-animation="fade-up"] {
        transform: translateY(2.5rem);
      }
      :scope .ui-scroll-reveal:not([data-revealed="true"]):not([data-motion="0"])[data-animation="fade-down"] {
        transform: translateY(-2.5rem);
      }
      :scope .ui-scroll-reveal:not([data-revealed="true"]):not([data-motion="0"])[data-animation="scale"] {
        transform: scale(0.8);
      }

      /* Aurora glow on reveal */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-scroll-reveal[data-revealed="true"] {
        animation: ui-premium-reveal-glow 0.8s ease-out forwards;
      }
      @keyframes ui-premium-reveal-glow {
        0% {
          box-shadow: 0 0 0 0 oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0);
        }
        40% {
          box-shadow: 0 0 24px -4px oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.25),
                      0 0 48px -8px oklch(from var(--aurora-2, oklch(70% 0.15 330)) l c h / 0.1);
        }
        100% {
          box-shadow: 0 0 0 0 oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0);
        }
      }

      /* Stagger children with spring timing */
      :scope:not([data-motion="0"]) .ui-scroll-reveal[data-stagger] > * {
        transition:
          opacity 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)
            calc(var(--scroll-reveal-delay, 0ms) + var(--stagger-index, 0) * var(--stagger-delay, 0ms)),
          transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)
            calc(var(--scroll-reveal-delay, 0ms) + var(--stagger-index, 0) * var(--stagger-delay, 0ms));
      }

      /* Motion 0: instant */
      :scope[data-motion="0"] .ui-scroll-reveal {
        animation: none;
      }

      /* Motion 1: subtle, no glow */
      :scope[data-motion="1"] .ui-scroll-reveal[data-revealed="true"] {
        animation: none;
        transition-timing-function: ease-out;
        transition-duration: 0.3s;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-scroll-reveal {
          animation: none !important;
          transition: none !important;
          transform: none !important;
          opacity: 1 !important;
        }
      }

      @media (forced-colors: active) {
        :scope .ui-scroll-reveal { box-shadow: none; }
      }
    }
  }
`

export function ScrollReveal({ motion: motionProp, ...rest }: ScrollRevealProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-scroll-reveal', premiumScrollRevealStyles)

  return (
    <div className="ui-premium-scroll-reveal" data-motion={motionLevel}>
      <BaseScrollReveal motion={motionProp} {...rest} />
    </div>
  )
}

ScrollReveal.displayName = 'ScrollReveal'
