'use client'

import { useRef, useCallback } from 'react'
import { ColumnVisibilityToggle as BaseColumnVisibilityToggle, type ColumnVisibilityToggleProps } from '../domain/column-visibility-toggle'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumColumnVisibilityStyles = css`
  @layer premium {
    @scope (.ui-premium-column-visibility) {
      :scope {
        position: relative;
      }
      /* Staggered item entrance */
      .ui-column-visibility__dropdown[data-open="true"] .ui-column-visibility__item {
        animation: ui-premium-col-item-in 0.2s ease-out backwards;
      }
      .ui-column-visibility__dropdown[data-open="true"] .ui-column-visibility__item:nth-child(1) { animation-delay: 0ms; }
      .ui-column-visibility__dropdown[data-open="true"] .ui-column-visibility__item:nth-child(2) { animation-delay: 30ms; }
      .ui-column-visibility__dropdown[data-open="true"] .ui-column-visibility__item:nth-child(3) { animation-delay: 60ms; }
      .ui-column-visibility__dropdown[data-open="true"] .ui-column-visibility__item:nth-child(4) { animation-delay: 90ms; }
      .ui-column-visibility__dropdown[data-open="true"] .ui-column-visibility__item:nth-child(5) { animation-delay: 120ms; }
      .ui-column-visibility__dropdown[data-open="true"] .ui-column-visibility__item:nth-child(n+6) { animation-delay: 150ms; }
      @keyframes ui-premium-col-item-in {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      /* Checkbox toggle flash */
      .ui-column-visibility__checkbox:checked {
        animation: ui-premium-check-flash 0.3s ease-out;
      }
      @keyframes ui-premium-check-flash {
        0% { box-shadow: 0 0 0 0 oklch(65% 0.2 270 / 0.4); }
        100% { box-shadow: 0 0 0 6px oklch(65% 0.2 270 / 0); }
      }
      /* Motion 0 disable */
      :scope[data-motion="0"] .ui-column-visibility__item,
      :scope[data-motion="0"] .ui-column-visibility__checkbox {
        animation: none;
      }
    }
  }
`

export function ColumnVisibilityToggle({
  motion: motionProp,
  ...rest
}: ColumnVisibilityToggleProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const motionLevel = useMotionLevel(motionProp)
  useEntrance(wrapperRef, motionLevel >= 2 ? 'fade-up' : 'none', { duration: 200 })
  useStyles('premium-column-visibility', premiumColumnVisibilityStyles)

  return (
    <div ref={wrapperRef} className="ui-premium-column-visibility" data-motion={motionLevel}>
      <BaseColumnVisibilityToggle motion={motionProp} {...rest} />
    </div>
  )
}

ColumnVisibilityToggle.displayName = 'ColumnVisibilityToggle'
