'use client'

import { forwardRef } from 'react'
import { Kbd as BaseKbd, type KbdProps } from '../components/kbd'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumKbdStyles = css`
  @layer premium {
    @scope (.ui-premium-kbd) {
      :scope {
        display: inline-flex;
      }

      /* Spring-scale hover lift */
      @media (hover: hover) {
        :scope:not([data-motion="0"]) .ui-kbd {
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.3s var(--ease-out, ease-out);
        }
        :scope:not([data-motion="0"]) .ui-kbd:hover {
          transform: translateY(-2px) scale(1.05);
        }
      }

      /* Subtle glow shadow */
      :scope .ui-kbd[data-variant="default"] {
        box-shadow:
          0 1px 0 0 oklch(0% 0 0 / 0.15),
          inset 0 1px 0 0 oklch(100% 0 0 / 0.04),
          0 0 8px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2);
      }
      @media (hover: hover) {
        :scope:not([data-motion="0"]) .ui-kbd[data-variant="default"]:hover {
          box-shadow:
            0 3px 4px 0 oklch(0% 0 0 / 0.12),
            inset 0 1px 0 0 oklch(100% 0 0 / 0.06),
            0 0 14px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3);
        }
      }

      /* Shimmer on press */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-kbd {
        position: relative;
        overflow: hidden;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-kbd::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(
          110deg,
          transparent 30%,
          oklch(100% 0 0 / 0.12) 45%,
          oklch(100% 0 0 / 0.2) 50%,
          oklch(100% 0 0 / 0.12) 55%,
          transparent 70%
        );
        background-size: 250% 100%;
        background-position: 200% center;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.1s;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-kbd:active::after {
        opacity: 1;
        animation: ui-premium-kbd-shimmer 0.5s ease-out 1;
      }
      @keyframes ui-premium-kbd-shimmer {
        0% { background-position: 200% center; }
        100% { background-position: -50% center; }
      }

      /* Press depression */
      :scope:not([data-motion="0"]) .ui-kbd:active {
        transform: translateY(1px) scale(0.97);
      }

      /* Motion 0: no animation */
      :scope[data-motion="0"] .ui-kbd {
        transition: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-kbd { transition: none; }
        :scope .ui-kbd::after { animation: none; }
      }
    }
  }
`

export const Kbd = forwardRef<HTMLElement, KbdProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-kbd', premiumKbdStyles)

    return (
      <span className="ui-premium-kbd" data-motion={motionLevel}>
        <BaseKbd ref={ref} motion={motionProp} {...rest} />
      </span>
    )
  }
)

Kbd.displayName = 'Kbd'
