'use client'

import { forwardRef } from 'react'
import { PipelineStage as BasePipelineStage, type PipelineStageProps } from '../domain/pipeline-stage'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumPipelineStyles = css`
  @layer premium {
    @scope (.ui-premium-pipeline-stage) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Aurora glow on active/running stage */
      :scope .ui-pipeline-stage__indicator[data-status="running"] {
        box-shadow: 0 0 12px 2px oklch(65% 0.2 270 / 0.35),
                    0 0 24px 4px oklch(65% 0.15 270 / 0.15);
      }

      /* Spring-progress pulse on running indicator */
      :scope:not([data-motion="0"]) .ui-pipeline-stage__indicator[data-status="running"] {
        animation: ui-premium-pipe-pulse 1.8s cubic-bezier(0.34, 1.2, 0.64, 1) infinite;
      }

      @keyframes ui-premium-pipe-pulse {
        0%, 100% {
          box-shadow: 0 0 12px 2px oklch(65% 0.2 270 / 0.35), 0 0 24px 4px oklch(65% 0.15 270 / 0.15);
          transform: scale(1);
        }
        50% {
          box-shadow: 0 0 18px 4px oklch(65% 0.2 270 / 0.5), 0 0 36px 8px oklch(65% 0.15 270 / 0.2);
          transform: scale(1.08);
        }
      }

      /* Success stage particle burst */
      :scope:not([data-motion="0"]) .ui-pipeline-stage__indicator[data-status="success"] {
        animation: ui-premium-pipe-success 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }

      @keyframes ui-premium-pipe-success {
        from {
          transform: scale(0.8);
          box-shadow: 0 0 0 0 oklch(72% 0.19 155 / 0.5);
        }
        50% {
          transform: scale(1.12);
          box-shadow: 0 0 16px 6px oklch(72% 0.19 155 / 0.3);
        }
        to {
          transform: scale(1);
          box-shadow: 0 0 8px 2px oklch(72% 0.19 155 / 0.2);
        }
      }

      /* Failed stage glow */
      :scope .ui-pipeline-stage__indicator[data-status="failed"] {
        box-shadow: 0 0 10px 2px oklch(62% 0.22 25 / 0.3);
      }

      /* Connector glow between completed stages */
      :scope:not([data-motion="0"]) .ui-pipeline-stage__connector {
        position: relative;
        overflow: hidden;
      }

      :scope:not([data-motion="0"]) .ui-pipeline-stage__connector::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent, oklch(65% 0.2 270 / 0.3), transparent);
        animation: ui-premium-pipe-connector 2.5s ease-in-out infinite;
      }

      @keyframes ui-premium-pipe-connector {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(200%); }
      }

      /* Stagger entrance for stages */
      :scope:not([data-motion="0"]) .ui-pipeline-stage__item {
        animation: ui-premium-pipe-enter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      :scope:not([data-motion="0"]) li:nth-child(1) .ui-pipeline-stage__item { animation-delay: 0ms; }
      :scope:not([data-motion="0"]) li:nth-child(2) .ui-pipeline-stage__item { animation-delay: 80ms; }
      :scope:not([data-motion="0"]) li:nth-child(3) .ui-pipeline-stage__item { animation-delay: 160ms; }
      :scope:not([data-motion="0"]) li:nth-child(4) .ui-pipeline-stage__item { animation-delay: 240ms; }
      :scope:not([data-motion="0"]) li:nth-child(5) .ui-pipeline-stage__item { animation-delay: 320ms; }

      @keyframes ui-premium-pipe-enter {
        from {
          opacity: 0;
          transform: translateY(8px) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Motion 0 */
      :scope[data-motion="0"] .ui-pipeline-stage__indicator { animation: none; }
      :scope[data-motion="0"] .ui-pipeline-stage__connector::after { display: none; }
      :scope[data-motion="0"] .ui-pipeline-stage__item { animation: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-pipeline-stage__indicator { animation: none; }
        :scope .ui-pipeline-stage__connector::after { display: none; }
        :scope .ui-pipeline-stage__item { animation: none; }
      }
    }
  }
`

export const PipelineStage = forwardRef<HTMLDivElement, PipelineStageProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-pipeline-stage', premiumPipelineStyles)

    return (
      <div className="ui-premium-pipeline-stage" data-motion={motionLevel} ref={ref}>
        <BasePipelineStage motion={motionProp} {...rest} />
      </div>
    )
  }
)

PipelineStage.displayName = 'PipelineStage'
