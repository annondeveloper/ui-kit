'use client'

import { useRef } from 'react'
import { EvervaultCard as BaseEvervaultCard, type EvervaultCardProps } from '../domain/evervault-card'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumEvervaultCardStyles = css`
  @layer premium {
    @scope (.ui-premium-evervault-card) {
      :scope {
        position: relative;
      }

      /* Enhanced matrix glow — intensified pointer-follow radial */
      :scope:not([data-motion="0"]) .ui-evervault-card {
        box-shadow:
          0 0 20px -4px oklch(65% 0.2 270 / 0.25),
          0 0 40px -8px oklch(70% 0.15 300 / 0.15);
        transition: box-shadow 0.3s ease-out;
      }
      :scope:not([data-motion="0"]) .ui-evervault-card:hover {
        box-shadow:
          0 0 30px -4px oklch(65% 0.25 270 / 0.4),
          0 0 60px -8px oklch(70% 0.2 300 / 0.25);
      }

      /* Aurora border — gradient border glow */
      :scope:not([data-motion="0"]) .ui-evervault-card::before {
        content: '';
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        padding: 1px;
        background: linear-gradient(
          135deg,
          oklch(65% 0.18 270 / 0.4),
          oklch(70% 0.15 300 / 0.2),
          oklch(65% 0.18 240 / 0.4)
        );
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
      }

      /* Animated aurora border rotation */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-evervault-card::before {
        background-size: 300% 300%;
        animation: ui-premium-evervault-border 4s ease-in-out infinite;
      }
      @keyframes ui-premium-evervault-border {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }

      /* Spring-hover scale */
      :scope:not([data-motion="0"]) .ui-evervault-card {
        transition:
          transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
          box-shadow 0.3s ease-out;
      }
      :scope:not([data-motion="0"]) .ui-evervault-card:hover {
        transform: scale(1.015);
      }

      /* Matrix overlay enhanced glow */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-evervault-card__matrix {
        filter: blur(0.3px);
        text-shadow: 0 0 4px oklch(65% 0.2 270 / 0.5);
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-evervault-card {
        box-shadow: none;
        transition: none;
      }
      :scope[data-motion="0"] .ui-evervault-card::before {
        display: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-evervault-card {
          transition: none !important;
          animation: none !important;
        }
        :scope .ui-evervault-card::before { animation: none !important; }
      }
    }
  }
`

export function EvervaultCard({
  motion: motionProp,
  ...rest
}: EvervaultCardProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const motionLevel = useMotionLevel(motionProp)
  useEntrance(wrapperRef, motionLevel >= 2 ? 'fade-up' : 'none', { duration: 300 })
  useStyles('premium-evervault-card', premiumEvervaultCardStyles)

  return (
    <div
      ref={wrapperRef}
      className="ui-premium-evervault-card"
      data-motion={motionLevel}
    >
      <BaseEvervaultCard motion={motionProp} {...rest} />
    </div>
  )
}

EvervaultCard.displayName = 'EvervaultCard'
