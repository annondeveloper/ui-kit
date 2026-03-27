'use client'

import { forwardRef } from 'react'
import { Cropper as BaseCropper, type CropperProps } from '../domain/cropper'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumCropperStyles = css`
  @layer premium {
    @scope (.ui-premium-cropper) {
      :scope {
        position: relative;
      }

      /* Aurora glow on crop area border */
      :scope:not([data-motion="0"]) .ui-cropper__crop-area {
        box-shadow:
          0 0 12px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2),
          inset 0 0 8px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.05);
        transition: box-shadow 0.2s ease-out;
      }

      /* Handle hover aurora glow */
      :scope:not([data-motion="0"]) .ui-cropper__handle:hover {
        box-shadow:
          0 2px 8px oklch(0% 0 0 / 0.5),
          0 0 16px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.4);
        transform: scale(1.4);
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
      }

      /* Zoom/rotate button spring */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-cropper__rotate-btn:active:not(:disabled) {
        transform: scale(0.85);
        transition: transform 0.06s ease-out;
      }

      /* Grid line glow on drag */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-cropper__grid-line {
        background: oklch(100% 0 0 / 0.4);
        box-shadow: 0 0 4px oklch(100% 0 0 / 0.1);
      }

      /* Slider thumb glow */
      :scope:not([data-motion="0"]) .ui-cropper__slider::-webkit-slider-thumb {
        box-shadow:
          0 1px 4px oklch(0% 0 0 / 0.3),
          0 0 8px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3);
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-cropper__crop-area { transition: none; box-shadow: none; }
      :scope[data-motion="0"] .ui-cropper__handle { transition: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-cropper__crop-area { transition: none; }
        :scope .ui-cropper__handle { transition: none; }
      }
    }
  }
`

export const Cropper = forwardRef<HTMLDivElement, CropperProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-cropper', premiumCropperStyles)

    return (
      <div ref={ref} className="ui-premium-cropper" data-motion={motionLevel}>
        <BaseCropper motion={motionProp} {...rest} />
      </div>
    )
  }
)

Cropper.displayName = 'Cropper'
