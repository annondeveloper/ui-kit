'use client'

import { forwardRef, useRef } from 'react'
import { SectionHeader as BaseSectionHeader, type SectionHeaderProps } from '../components/section-header'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumSectionHeaderStyles = css`
  @layer premium {
    @scope (.ui-premium-section-header) {
      :scope {
        position: relative;
        width: 100%;
        min-width: 0;
      }

      ${sharedPremiumCSS}

      /* Subtle aurora glow on the border */
      :scope::before {
        content: '';
        position: absolute;
        inset-block-end: 0;
        inset-inline: 0;
        block-size: 1px;
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3) 50%,
          transparent 100%
        );
        pointer-events: none;
        z-index: 1;
      }
    }
  }
`

export const SectionHeader = forwardRef<HTMLElement, SectionHeaderProps>((props, ref) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const motionLevel = useMotionLevel((props as any).motion)
  useEntrance(wrapperRef, motionLevel >= 2 ? 'fade-up' : 'none', { duration: 280 })
  useStyles('premium-section-header', premiumSectionHeaderStyles)

  return (
    <div ref={wrapperRef} className="ui-premium-section-header">
      <BaseSectionHeader ref={ref} {...props} />
    </div>
  )
})
SectionHeader.displayName = 'SectionHeader'
