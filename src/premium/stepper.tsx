'use client'

import { forwardRef } from 'react'
import { Stepper as BaseStepper, type StepperProps, type StepperStep } from '../components/stepper'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumStepperStyles = css`
  @layer premium {
    @scope (.ui-premium-stepper) {
      :scope {
        display: contents;
      }

      /* Aurora glow on active indicator */
      :scope .ui-stepper__step[data-status="active"] .ui-stepper__indicator {
        box-shadow:
          0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15),
          0 0 16px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.35);
      }

      /* Completed indicator glow */
      :scope .ui-stepper__step[data-status="completed"] .ui-stepper__indicator {
        box-shadow: 0 0 10px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.25);
      }

      /* Spring-scale entrance for indicators */
      :scope:not([data-motion="0"]) .ui-stepper__indicator {
        animation: ui-premium-stepper-indicator-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }

      :scope:not([data-motion="0"]) .ui-stepper__step:nth-child(1) .ui-stepper__indicator { animation-delay: 0ms; }
      :scope:not([data-motion="0"]) .ui-stepper__step:nth-child(2) .ui-stepper__indicator { animation-delay: 60ms; }
      :scope:not([data-motion="0"]) .ui-stepper__step:nth-child(3) .ui-stepper__indicator { animation-delay: 120ms; }
      :scope:not([data-motion="0"]) .ui-stepper__step:nth-child(4) .ui-stepper__indicator { animation-delay: 180ms; }
      :scope:not([data-motion="0"]) .ui-stepper__step:nth-child(5) .ui-stepper__indicator { animation-delay: 240ms; }
      :scope:not([data-motion="0"]) .ui-stepper__step:nth-child(6) .ui-stepper__indicator { animation-delay: 300ms; }
      :scope:not([data-motion="0"]) .ui-stepper__step:nth-child(7) .ui-stepper__indicator { animation-delay: 360ms; }
      :scope:not([data-motion="0"]) .ui-stepper__step:nth-child(8) .ui-stepper__indicator { animation-delay: 420ms; }

      @keyframes ui-premium-stepper-indicator-enter {
        from {
          opacity: 0;
          transform: scale(0.4);
        }
        70% {
          transform: scale(1.12);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* Connector shimmer at motion 3 */
      :scope[data-motion="3"] .ui-stepper__connector[data-completed="true"] {
        position: relative;
        overflow: hidden;
      }

      :scope[data-motion="3"] .ui-stepper__connector[data-completed="true"]::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          110deg,
          transparent 30%,
          oklch(100% 0 0 / 0.15) 48%,
          oklch(100% 0 0 / 0.22) 50%,
          oklch(100% 0 0 / 0.15) 52%,
          transparent 70%
        );
        background-size: 250% 100%;
        animation: ui-premium-stepper-shimmer 3s ease-in-out infinite;
        pointer-events: none;
      }

      @keyframes ui-premium-stepper-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      /* Spring hover on clickable steps at motion 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-stepper__step[data-clickable="true"]:hover .ui-stepper__indicator {
        transform: scale(1.08);
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Motion 0: disable everything */
      :scope[data-motion="0"] .ui-stepper__indicator {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-stepper__indicator { animation: none !important; }
        :scope .ui-stepper__connector[data-completed="true"]::after { animation: none; }
      }

      @media (forced-colors: active) {
        :scope .ui-stepper__step[data-status="active"] .ui-stepper__indicator,
        :scope .ui-stepper__step[data-status="completed"] .ui-stepper__indicator {
          box-shadow: none;
        }
      }
    }
  }
`

export const Stepper = forwardRef<HTMLDivElement, StepperProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-stepper', premiumStepperStyles)

    return (
      <div className="ui-premium-stepper" data-motion={motionLevel}>
        <BaseStepper ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

Stepper.displayName = 'Stepper'

export type { StepperProps, StepperStep } from '../components/stepper'
