'use client'

import { useRef } from 'react'
import { DensitySelector as BaseDensitySelector, type DensitySelectorProps } from '../domain/density-selector'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumDensitySelectorStyles = css`
  @layer premium {
    @scope (.ui-premium-density-selector) {
      :scope {
        position: relative;
      }
      /* Glow pulse on segment change */
      :scope[data-glow="true"] .ui-density-selector__indicator {
        box-shadow: 0 0 16px oklch(65% 0.2 270 / 0.4);
        animation: ui-premium-density-glow 0.5s ease-out forwards;
      }
      @keyframes ui-premium-density-glow {
        from { box-shadow: 0 0 20px oklch(65% 0.2 270 / 0.5); }
        to { box-shadow: 0 0 8px oklch(65% 0.2 270 / 0.15); }
      }
      /* Hover shimmer on options */
      .ui-density-selector__option:hover:not([data-active="true"])::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(135deg, oklch(100% 0 0 / 0.05), transparent);
        pointer-events: none;
      }
      /* Motion 0 disable */
      :scope[data-motion="0"]::after,
      :scope[data-motion="0"] .ui-density-selector__indicator {
        animation: none;
        box-shadow: none;
      }
    }
  }
`

export function DensitySelector({
  motion: motionProp,
  onChange,
  ...rest
}: DensitySelectorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const motionLevel = useMotionLevel(motionProp)
  useEntrance(wrapperRef, motionLevel >= 2 ? 'fade-up' : 'none', { duration: 200 })
  useStyles('premium-density-selector', premiumDensitySelectorStyles)

  const glowRef = useRef(false)
  const handleChange = (value: 'compact' | 'comfortable' | 'spacious') => {
    if (motionLevel >= 2 && wrapperRef.current) {
      wrapperRef.current.setAttribute('data-glow', 'true')
      setTimeout(() => wrapperRef.current?.removeAttribute('data-glow'), 500)
    }
    onChange?.(value)
  }

  return (
    <div ref={wrapperRef} className="ui-premium-density-selector" data-motion={motionLevel}>
      <BaseDensitySelector motion={motionProp} onChange={handleChange} {...rest} />
    </div>
  )
}

DensitySelector.displayName = 'DensitySelector'
