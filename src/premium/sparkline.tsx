'use client'

import { type SparklineProps, Sparkline as BaseSparkline } from '../domain/sparkline'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumSparklineStyles = css`
  @layer premium {
    @scope (.ui-premium-sparkline) {
      :scope {
        position: relative;
      }

      /* Aurora glow on hover point */
      :scope:not([data-motion="0"]) .ui-sparkline__tooltip-dot {
        box-shadow: 0 0 10px 2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.45);
        transition: box-shadow 0.25s ease;
      }
      :scope:not([data-motion="0"]) .ui-sparkline__tooltip-dot:hover {
        box-shadow: 0 0 16px 4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.6);
      }

      /* Enhanced gradient fill */
      :scope .ui-sparkline svg linearGradient stop:first-child {
        stop-opacity: 0.35;
      }
      :scope .ui-sparkline svg path[fill]:not([stroke]) {
        filter: blur(0.5px);
        opacity: 0.8;
      }

      /* Shimmer trace animation */
      :scope:not([data-motion="0"]) .ui-sparkline svg path[stroke] {
        stroke-dasharray: 300;
        stroke-dashoffset: 300;
        animation: ui-premium-sparkline-trace 1.2s ease-out forwards;
      }
      @keyframes ui-premium-sparkline-trace {
        to { stroke-dashoffset: 0; }
      }

      /* Post-trace shimmer overlay */
      :scope:not([data-motion="0"]):not([data-motion="1"])::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) 92% 0.02 h / 0.25) 50%,
          transparent 100%
        );
        animation: ui-premium-sparkline-shimmer 2s ease-in-out 1.2s 1 both;
        pointer-events: none;
      }
      @keyframes ui-premium-sparkline-shimmer {
        from { transform: translateX(-100%); }
        to { transform: translateX(100%); opacity: 0; }
      }

      /* Motion 0: disable */
      :scope[data-motion="0"] .ui-sparkline svg path[stroke] {
        stroke-dasharray: none;
        stroke-dashoffset: 0;
        animation: none;
      }
      :scope[data-motion="0"]::after {
        display: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-sparkline svg path[stroke] {
          stroke-dasharray: none;
          animation: none;
        }
        :scope::after { animation: none; display: none; }
      }
    }
  }
`

export function Sparkline({ motion: motionProp, ...rest }: SparklineProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-sparkline', premiumSparklineStyles)

  return (
    <div className="ui-premium-sparkline" data-motion={motionLevel}>
      <BaseSparkline motion={motionProp} {...rest} />
    </div>
  )
}

Sparkline.displayName = 'Sparkline'
