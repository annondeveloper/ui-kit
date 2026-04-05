'use client'

import { forwardRef, useRef } from 'react'
import { PageHeader as BasePageHeader, type PageHeaderProps } from '../components/page-header'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumPageHeaderStyles = css`
  @layer premium {
    @scope (.ui-premium-page-header) {
      :scope {
        position: relative;
      }

      ${sharedPremiumCSS}

      /* Gradient underline for the title */
      :scope .ui-page-header__title {
        background: linear-gradient(135deg, var(--text-primary, oklch(95% 0 0)) 0%, var(--brand, oklch(65% 0.2 270)) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
  }
`

export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>((props, ref) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const motionLevel = useMotionLevel((props as any).motion)
  useEntrance(wrapperRef, motionLevel >= 2 ? 'fade-up' : 'none', { duration: 280 })
  useStyles('premium-page-header', premiumPageHeaderStyles)

  return (
    <div ref={wrapperRef} className="ui-premium-page-header">
      <BasePageHeader ref={ref} {...props} />
    </div>
  )
})
PageHeader.displayName = 'PageHeader'
