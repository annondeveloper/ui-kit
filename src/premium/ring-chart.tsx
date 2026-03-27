'use client'

import { RingChart as BaseRingChart, type RingChartProps } from '../domain/ring-chart'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumRingChartStyles = css`
  @layer premium {
    @scope (.ui-premium-ring-chart) {
      :scope {
        position: relative;
        display: inline-flex;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Aurora glow behind the ring */
      :scope:not([data-motion="0"]) .ui-ring-chart {
        filter: drop-shadow(0 0 8px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3));
      }

      /* Animated stroke draw-in */
      :scope:not([data-motion="0"]) .ui-ring-chart__fill {
        animation: ui-premium-ring-draw 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-ring-draw {
        from { stroke-dashoffset: var(--ring-circ, 200); opacity: 0.3; }
        60% { opacity: 1; }
      }

      /* Shimmer sweep */
      :scope:not([data-motion="0"]):not([data-motion="1"])::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: linear-gradient(
          105deg,
          transparent 40%,
          oklch(100% 0 0 / 0.06) 50%,
          transparent 60%
        );
        animation: ui-premium-ring-shimmer 3s ease-in-out infinite;
        pointer-events: none;
      }
      @keyframes ui-premium-ring-shimmer {
        0%, 100% { transform: translateX(-120%); }
        50% { transform: translateX(120%); }
      }

      :scope[data-motion="0"] .ui-ring-chart__fill { animation: none; }
      :scope[data-motion="0"]::after { display: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-ring-chart__fill { animation: none; }
        :scope::after { display: none; }
      }
    }
  }
`

export function RingChart({ motion: motionProp, ...rest }: RingChartProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-ring-chart', premiumRingChartStyles)

  return (
    <div className="ui-premium-ring-chart" data-motion={motionLevel}>
      <BaseRingChart motion={motionProp} {...rest} />
    </div>
  )
}

RingChart.displayName = 'RingChart'
