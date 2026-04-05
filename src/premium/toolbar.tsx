'use client'

import { forwardRef, useRef } from 'react'
import { Toolbar as BaseToolbar, type ToolbarProps } from '../components/toolbar'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumToolbarStyles = css`
  @layer premium {
    @scope (.ui-premium-toolbar) {
      :scope {
        position: relative;
        width: 100%;
        min-width: 0;
      }

      ${sharedPremiumCSS}

      /* Aurora glow backdrop for sticky mode */
      :scope:has([data-sticky="true"])::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(
          ellipse at 50% 100%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.06),
          transparent 70%
        );
        pointer-events: none;
        z-index: 0;
      }
    }
  }
`

export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>((props, ref) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const motionLevel = useMotionLevel((props as any).motion)
  useEntrance(wrapperRef, motionLevel >= 2 ? 'fade-up' : 'none', { duration: 280 })
  useStyles('premium-toolbar', premiumToolbarStyles)

  return (
    <div ref={wrapperRef} className="ui-premium-toolbar">
      <BaseToolbar ref={ref} {...props} />
    </div>
  )
})
Toolbar.displayName = 'Toolbar'
