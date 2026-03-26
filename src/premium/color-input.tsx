'use client'

import { forwardRef } from 'react'
import { ColorInput as BaseColorInput, type ColorInputProps } from '../components/color-input'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumColorInputStyles = css`
  @layer premium {
    @scope (.ui-premium-color-input) {
      :scope {
        display: contents;
      }

      /* Aurora glow on focus for trigger */
      :scope .ui-color-input__trigger:focus-visible {
        box-shadow:
          0 0 0 3px oklch(65% 0.2 270 / 0.15),
          0 0 16px -2px oklch(65% 0.2 270 / 0.3);
      }

      /* Aurora glow on hex input focus */
      :scope .ui-color-input__hex-input:focus {
        box-shadow:
          0 0 0 3px oklch(65% 0.2 270 / 0.15),
          0 0 14px -3px oklch(65% 0.2 270 / 0.25);
      }

      /* Spring-scale on swatch hover */
      :scope:not([data-motion="0"]) .ui-color-input__trigger {
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                    box-shadow 0.25s ease-out;
      }
      :scope:not([data-motion="0"]) .ui-color-input__trigger:hover {
        transform: scale(1.08);
      }

      /* Spring-scale on preset swatches */
      :scope:not([data-motion="0"]) .ui-color-input__preset-swatch {
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                    border-color 0.15s ease-out,
                    box-shadow 0.2s ease-out;
      }
      :scope:not([data-motion="0"]) .ui-color-input__preset-swatch:hover {
        transform: scale(1.15);
        box-shadow: 0 0 10px -2px oklch(65% 0.15 270 / 0.3);
      }

      /* Shimmer sweep on selected color swatch */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-color-input__swatch {
        position: relative;
        overflow: hidden;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-color-input__swatch::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          110deg,
          oklch(100% 0 0 / 0) 30%,
          oklch(100% 0.05 270 / 0.2) 50%,
          oklch(100% 0 0 / 0) 70%
        );
        background-size: 200% 100%;
        animation: ui-premium-color-shimmer 2.5s ease-in-out infinite;
        border-radius: inherit;
        pointer-events: none;
      }
      @keyframes ui-premium-color-shimmer {
        0%, 100% { background-position: 200% center; }
        50% { background-position: -200% center; }
      }

      /* Popover glass effect */
      :scope .ui-color-input__popover {
        backdrop-filter: blur(12px) saturate(1.2);
        -webkit-backdrop-filter: blur(12px) saturate(1.2);
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-color-input__trigger {
        transition: none;
      }
      :scope[data-motion="0"] .ui-color-input__preset-swatch {
        transition: none;
      }
      :scope[data-motion="0"] .ui-color-input__swatch::after {
        display: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-color-input__trigger { transition: none !important; }
        :scope .ui-color-input__preset-swatch { transition: none !important; }
        :scope .ui-color-input__swatch::after { animation: none !important; }
      }
    }
  }
`

export const ColorInput = forwardRef<HTMLDivElement, ColorInputProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-color-input', premiumColorInputStyles)

    return (
      <div className="ui-premium-color-input" data-motion={motionLevel}>
        <BaseColorInput ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

ColorInput.displayName = 'ColorInput'
