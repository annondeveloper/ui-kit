'use client'

import { forwardRef } from 'react'
import { WavyBackground as BaseWavyBackground, type WavyBackgroundProps } from '../domain/wavy-background'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumWavyBackgroundStyles = css`
  @layer premium {
    @scope (.ui-premium-wavy-background) {
      :scope {
        position: relative;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Enhanced aurora wave colors — multi-layer glow */
      :scope .ui-wavy-background--wave:nth-child(1) {
        filter: blur(0.5px);
        box-shadow: 0 0 24px 6px oklch(70% 0.2 270 / 0.15);
      }
      :scope .ui-wavy-background--wave:nth-child(2) {
        filter: blur(0.3px);
        box-shadow: 0 0 20px 4px oklch(70% 0.2 330 / 0.12);
      }
      :scope .ui-wavy-background--wave:nth-child(3) {
        box-shadow: 0 0 18px 3px oklch(70% 0.2 180 / 0.1);
      }

      /* Aurora color cycling across wave layers */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-wavy-background--wave:nth-child(1) {
        animation-name: var(--wave-anim, ui-wave), ui-premium-wave-glow-1;
        animation-duration: var(--wave-duration, 10s), 8s;
        animation-timing-function: ease-in-out, ease-in-out;
        animation-iteration-count: infinite, infinite;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-wavy-background--wave:nth-child(2) {
        animation-name: var(--wave-anim, ui-wave), ui-premium-wave-glow-2;
        animation-duration: var(--wave-duration, 12s), 10s;
        animation-timing-function: ease-in-out, ease-in-out;
        animation-iteration-count: infinite, infinite;
      }

      @keyframes ui-premium-wave-glow-1 {
        0%, 100% { box-shadow: 0 0 24px 6px oklch(70% 0.2 270 / 0.15); }
        33% { box-shadow: 0 0 28px 8px oklch(70% 0.22 330 / 0.2); }
        66% { box-shadow: 0 0 26px 7px oklch(70% 0.2 180 / 0.18); }
      }

      @keyframes ui-premium-wave-glow-2 {
        0%, 100% { box-shadow: 0 0 20px 4px oklch(70% 0.2 330 / 0.12); }
        33% { box-shadow: 0 0 24px 6px oklch(70% 0.22 180 / 0.16); }
        66% { box-shadow: 0 0 22px 5px oklch(70% 0.2 270 / 0.14); }
      }

      /* Ambient backdrop glow */
      :scope::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(
          ellipse 80% 50% at 50% 80%,
          oklch(50% 0.15 270 / 0.08),
          transparent
        );
        pointer-events: none;
      }

      :scope[data-motion="0"] .ui-wavy-background--wave {
        filter: none;
        box-shadow: none;
      }
      :scope[data-motion="0"]::before {
        display: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-wavy-background--wave { filter: none; box-shadow: none; }
        :scope::before { display: none; }
      }
    }
  }
`

export const WavyBackground = forwardRef<HTMLDivElement, WavyBackgroundProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-wavy-background', premiumWavyBackgroundStyles)

    return (
      <div ref={ref} className="ui-premium-wavy-background" data-motion={motionLevel}>
        <BaseWavyBackground motion={motionProp} {...rest} />
      </div>
    )
  }
)

WavyBackground.displayName = 'WavyBackground'
