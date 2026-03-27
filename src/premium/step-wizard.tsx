'use client'

import { type StepWizardProps, StepWizard as BaseStepWizard } from '../domain/step-wizard'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumStepWizardStyles = css`
  @layer premium {
    @scope (.ui-premium-step-wizard) {
      :scope {
        position: relative;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Aurora glow active step indicator */
      :scope:not([data-motion="0"]) .ui-step-wizard__step[data-active="true"] .ui-step-wizard__indicator {
        box-shadow:
          0 0 14px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.45),
          0 0 28px -6px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2);
        transition: box-shadow 0.35s ease;
      }

      /* Spring-transition between steps */
      :scope:not([data-motion="0"]) .ui-step-wizard__content {
        animation: ui-premium-step-spring 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-step-spring {
        from {
          opacity: 0;
          transform: translateX(12px) scale(0.97);
        }
        60% {
          transform: translateX(-2px) scale(1.01);
        }
        to {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
      }

      /* Shimmer connector between steps */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-step-wizard__connector {
        position: relative;
        overflow: hidden;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-step-wizard__connector::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) 88% 0.05 h / 0.5) 50%,
          transparent 100%
        );
        animation: ui-premium-step-shimmer 2s ease-in-out infinite;
      }
      @keyframes ui-premium-step-shimmer {
        from { transform: translateX(-100%); }
        to { transform: translateX(100%); }
      }

      /* Completed step subtle glow */
      :scope .ui-step-wizard__step[data-completed="true"] .ui-step-wizard__indicator {
        box-shadow: 0 0 8px -2px oklch(from var(--status-ok, oklch(72% 0.19 155)) l c h / 0.3);
      }

      /* Motion 0: disable */
      :scope[data-motion="0"] .ui-step-wizard__content {
        animation: none;
      }
      :scope[data-motion="0"] .ui-step-wizard__connector::after {
        display: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-step-wizard__content { animation: none; }
        :scope .ui-step-wizard__connector::after { animation: none; display: none; }
      }
    }
  }
`

export function StepWizard({ motion: motionProp, ...rest }: StepWizardProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-step-wizard', premiumStepWizardStyles)

  return (
    <div className="ui-premium-step-wizard" data-motion={motionLevel}>
      <BaseStepWizard motion={motionProp} {...rest} />
    </div>
  )
}

StepWizard.displayName = 'StepWizard'
