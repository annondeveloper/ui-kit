'use client'

import { type TextRevealProps, TextReveal as BaseTextReveal } from '../domain/text-reveal'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumTextRevealStyles = css`
  @layer premium {
    @scope (.ui-premium-text-reveal) {
      :scope {
        position: relative;
      }

      /* Enhanced spring-reveal per character */
      :scope:not([data-motion="0"]) .ui-text-reveal__char {
        animation: ui-premium-char-reveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        animation-delay: calc(var(--char-index, 0) * 30ms);
      }
      @keyframes ui-premium-char-reveal {
        from {
          opacity: 0;
          transform: translateY(0.6em) scale(0.7) rotateX(40deg);
          filter: blur(4px);
        }
        60% {
          transform: translateY(-0.05em) scale(1.05) rotateX(-2deg);
          filter: blur(0px);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1) rotateX(0deg);
          filter: blur(0px);
        }
      }

      /* Aurora glow on characters during reveal */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-text-reveal__char {
        text-shadow: 0 0 0 transparent;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"])[data-revealing="true"] .ui-text-reveal__char {
        animation:
          ui-premium-char-reveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both,
          ui-premium-char-glow 0.8s ease-out both;
        animation-delay: calc(var(--char-index, 0) * 30ms);
      }
      @keyframes ui-premium-char-glow {
        0% {
          text-shadow: 0 0 8px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.6);
        }
        100% {
          text-shadow: 0 0 0 transparent;
        }
      }

      /* Cinematic sweep after full reveal */
      :scope:not([data-motion="0"]):not([data-motion="1"]):not([data-motion="2"])[data-revealed="true"]::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) 92% 0.03 h / 0.25) 50%,
          transparent 100%
        );
        animation: ui-premium-reveal-sweep 0.8s ease-out 0.1s 1 both;
        pointer-events: none;
      }
      @keyframes ui-premium-reveal-sweep {
        from { transform: translateX(-100%); }
        to { transform: translateX(100%); opacity: 0; }
      }

      /* Motion 0: disable */
      :scope[data-motion="0"] .ui-text-reveal__char {
        animation: none;
        opacity: 1;
        transform: none;
        filter: none;
      }
      :scope[data-motion="0"]::after {
        display: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-text-reveal__char { animation: none; opacity: 1; transform: none; filter: none; }
        :scope::after { animation: none; display: none; }
      }
    }
  }
`

export function TextReveal({ motion: motionProp, ...rest }: TextRevealProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-text-reveal', premiumTextRevealStyles)

  return (
    <div className="ui-premium-text-reveal" data-motion={motionLevel}>
      <BaseTextReveal motion={motionProp} {...rest} />
    </div>
  )
}

TextReveal.displayName = 'TextReveal'
