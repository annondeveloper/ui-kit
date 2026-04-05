'use client'

import { forwardRef, useRef } from 'react'
import { PageShell as BasePageShell, type PageShellProps } from '../components/page-shell'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumPageShellStyles = css`
  @layer premium {
    @scope (.ui-premium-page-shell) {
      :scope {
        position: relative;
      }

      ${sharedPremiumCSS}

      /* Subtle aurora background wash */
      :scope::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: var(--radius-lg, 0.75rem);
        background: radial-gradient(
          ellipse at 50% 0%,
          oklch(65% 0.1 270 / 0.03),
          transparent 60%
        );
        pointer-events: none;
        z-index: 0;
      }

      :scope > .ui-page-shell {
        position: relative;
        z-index: 1;
      }
    }
  }
`

export const PageShell = forwardRef<HTMLDivElement, PageShellProps>((props, ref) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const motionLevel = useMotionLevel((props as any).motion)
  useEntrance(wrapperRef, motionLevel >= 2 ? 'fade-up' : 'none', { duration: 320 })
  useStyles('premium-page-shell', premiumPageShellStyles)

  return (
    <div ref={wrapperRef} className="ui-premium-page-shell">
      <BasePageShell ref={ref} {...props} />
    </div>
  )
})
PageShell.displayName = 'PageShell'
