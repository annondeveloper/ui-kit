'use client'

import { forwardRef, useRef } from 'react'
import { ContainerQuery as BaseContainerQuery, type ContainerQueryProps } from '../components/container-query'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumContainerQueryStyles = css`
  @layer premium {
    @scope (.ui-premium-container-query) {
      :scope {
        position: relative;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}

      /* Aurora glow border */
      :scope::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: var(--radius-lg, 0.75rem);
        background: radial-gradient(
          ellipse at 20% 0%,
          oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.04) 0%,
          transparent 60%
        ),
        radial-gradient(
          ellipse at 80% 100%,
          oklch(from var(--aurora-2, oklch(70% 0.15 330)) l c h / 0.03) 0%,
          transparent 50%
        );
        pointer-events: none;
        z-index: 0;
      }

      :scope > * {
        position: relative;
        z-index: 1;
      }
    }
  }
`

export const ContainerQuery = forwardRef<HTMLDivElement, ContainerQueryProps & { motion?: 0 | 1 | 2 | 3 }>(
  ({ motion: motionProp, className, ...props }, ref) => {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const motionLevel = useMotionLevel(motionProp)
    useEntrance(wrapperRef, motionLevel >= 2 ? 'fade-up' : 'none', { duration: 280 })
    useStyles('premium-container-query', premiumContainerQueryStyles)

    return (
      <div ref={wrapperRef} className="ui-premium-container-query" data-motion={motionLevel}>
        <BaseContainerQuery ref={ref} className={className} {...props} />
      </div>
    )
  },
)

ContainerQuery.displayName = 'ContainerQuery'
