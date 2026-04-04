'use client'

import { type ReactElement } from 'react'

import { type PipelineDAGProps, PipelineDAG as BasePipelineDAG } from '../domain/pipeline-dag'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumPipelineDAGStyles = css`
  @layer premium {
    @scope (.ui-premium-pipeline-dag) {
      :scope {
        display: contents;
      }

      ${sharedPremiumCSS}

      /* ── Aurora glow on running nodes ──── */

      :scope .ui-pipeline-dag__node--running .ui-pipeline-dag__node-bg {
        filter: drop-shadow(0 0 8px oklch(65% 0.2 270 / 0.3));
      }

      /* ── Spring-scale entrance ─────────── */

      :scope:not([data-motion="0"]) .ui-pipeline-dag__node {
        animation: ui-premium-dag-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }

      @keyframes ui-premium-dag-enter {
        0% { transform: scale(0.8); opacity: 0; }
        60% { transform: scale(1.05); }
        100% { transform: scale(1); opacity: 1; }
      }

      /* ── Failed node breathing ─────────── */

      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-pipeline-dag__node[data-status="failed"] .ui-pipeline-dag__node-bg {
        animation: ui-premium-dag-fail-glow 2s ease-in-out infinite;
      }

      @keyframes ui-premium-dag-fail-glow {
        0%, 100% { filter: drop-shadow(0 0 4px oklch(62% 0.22 25 / 0.2)); }
        50% { filter: drop-shadow(0 0 12px oklch(62% 0.22 25 / 0.5)); }
      }

      /* ── Success node glow ─────────────── */

      :scope .ui-pipeline-dag__node[data-status="success"] .ui-pipeline-dag__node-bg {
        filter: drop-shadow(0 0 6px oklch(72% 0.19 155 / 0.2));
      }

      /* ── Animated flow particles on edges */

      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-pipeline-dag__edge-path--animated {
        stroke-dasharray: 4 6;
        animation: ui-premium-dag-flow 0.6s linear infinite;
        filter: drop-shadow(0 0 2px oklch(65% 0.2 270 / 0.3));
      }

      @keyframes ui-premium-dag-flow {
        to { stroke-dashoffset: -10; }
      }

      /* ── Node ripple on click ──────────── */

      :scope:not([data-motion="0"]) .ui-pipeline-dag__node--clickable:active .ui-pipeline-dag__node-bg {
        animation: ui-premium-dag-ripple 0.3s ease-out;
      }

      @keyframes ui-premium-dag-ripple {
        0% { filter: brightness(1); }
        50% { filter: brightness(1.3); }
        100% { filter: brightness(1); }
      }

      /* ── Motion 0: no effects ──────────── */

      :scope[data-motion="0"] .ui-pipeline-dag__node {
        animation: none;
      }
      :scope[data-motion="0"] .ui-pipeline-dag__node .ui-pipeline-dag__node-bg {
        filter: none;
        animation: none;
      }
      :scope[data-motion="0"] .ui-pipeline-dag__edge-path--animated {
        animation: none;
        filter: none;
      }

      /* ── Motion 1: glow only, no entrance */

      :scope[data-motion="1"] .ui-pipeline-dag__node {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-pipeline-dag__node {
          animation: none !important;
        }
        :scope .ui-pipeline-dag__node .ui-pipeline-dag__node-bg {
          animation: none !important;
          filter: none !important;
        }
        :scope .ui-pipeline-dag__edge-path--animated {
          animation: none !important;
          filter: none !important;
        }
      }

      @media (forced-colors: active) {
        :scope .ui-pipeline-dag__node .ui-pipeline-dag__node-bg {
          filter: none;
        }
      }
    }
  }
`

export function PipelineDAG({ motion: motionProp, ...rest }: PipelineDAGProps): ReactElement {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-pipeline-dag', premiumPipelineDAGStyles)

  return (
    <div className="ui-premium-pipeline-dag" data-motion={motionLevel}>
      <BasePipelineDAG motion={motionProp} {...rest} />
    </div>
  )
}

PipelineDAG.displayName = 'PipelineDAG'
