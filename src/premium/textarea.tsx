'use client'

import { forwardRef } from 'react'
import { Textarea as BaseTextarea, type TextareaProps } from '../components/textarea'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumStyles = css`
  @layer premium {
    @scope (.ui-premium-textarea) {
      :scope {
        display: contents;
      }

      /* Aurora glow on focus */
      :scope:not([data-motion="0"]) .ui-textarea__field:focus {
        box-shadow: 0 0 16px -3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.35);
      }

      /* Smooth auto-resize with spring ease */
      :scope:not([data-motion="0"]) .ui-textarea__field[data-auto-resize] {
        transition: height 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                    box-shadow 0.3s var(--ease-out, ease-out);
      }

      :scope[data-motion="0"] .ui-textarea__field { transition: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-textarea__field { transition: none; }
      }
    }
  }
`

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-textarea', premiumStyles)

    return (
      <div className="ui-premium-textarea" data-motion={motionLevel}>
        <BaseTextarea ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
