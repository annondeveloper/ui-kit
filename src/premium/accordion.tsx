'use client'

import { forwardRef } from 'react'
import {
  Accordion as BaseAccordion,
  type AccordionProps,
} from '../components/accordion'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

// ─── Styles ─────────────────────────────────────────────────────────────────

const premiumAccordionStyles = css`
  @layer premium {
    @scope (.ui-premium-accordion) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Spring-animated expand with overshoot curve */
      :scope:not([data-motion="0"]) .ui-accordion details[open] > .ui-accordion__content-wrapper {
        transition: grid-template-rows 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Spring chevron rotation with overshoot */
      :scope:not([data-motion="0"]) .ui-accordion details[open] > summary .ui-accordion__chevron {
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Aurora glow on expanded item header */
      :scope .ui-accordion details[open] > summary {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.06);
        box-shadow:
          inset 0 0 20px -8px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12),
          0 0 24px -12px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1);
      }

      /* Shimmer highlight on dividers */
      :scope .ui-accordion details {
        border-image: linear-gradient(
          90deg,
          transparent 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.15) c h / 0.3) 30%,
          oklch(70% 0.18 300 / 0.25) 50%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.15) c h / 0.3) 70%,
          transparent 100%
        ) 1;
      }
      :scope .ui-accordion details:last-child {
        border-image: none;
      }

      /* Motion 2+: animated shimmer */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-accordion details {
        animation: ui-premium-accordion-shimmer 4s ease-in-out infinite alternate;
      }
      @keyframes ui-premium-accordion-shimmer {
        from { border-image-slice: 1; opacity: 0.85; }
        to { border-image-slice: 1; opacity: 1; }
      }

      /* Motion 3: enhanced aurora glow pulse */
      :scope[data-motion="3"] .ui-accordion details[open] > summary {
        animation: ui-premium-accordion-glow 2.5s ease-in-out infinite alternate;
      }
      @keyframes ui-premium-accordion-glow {
        from {
          box-shadow:
            inset 0 0 20px -8px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12),
            0 0 24px -12px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1);
        }
        to {
          box-shadow:
            inset 0 0 28px -6px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2),
            0 0 36px -10px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.16);
        }
      }

      /* Motion 0: no premium effects */
      :scope[data-motion="0"] .ui-accordion details[open] > summary {
        box-shadow: none;
        animation: none;
      }
      :scope[data-motion="0"] .ui-accordion details {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-accordion details[open] > summary { animation: none; }
        :scope .ui-accordion details { animation: none; }
        :scope .ui-accordion details[open] > .ui-accordion__content-wrapper {
          transition: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion({ motion: motionProp, ...rest }, ref) {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-accordion', premiumAccordionStyles)

    return (
      <div className="ui-premium-accordion" data-motion={motionLevel}>
        <BaseAccordion ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

Accordion.displayName = 'Accordion'
