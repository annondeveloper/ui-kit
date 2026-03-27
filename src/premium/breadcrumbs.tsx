'use client'

import { forwardRef } from 'react'
import { Breadcrumbs as BaseBreadcrumbs, type BreadcrumbsProps } from '../components/breadcrumbs'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

interface PremiumBreadcrumbsProps extends BreadcrumbsProps {
  motion?: 0 | 1 | 2 | 3
}

const premiumBreadcrumbsStyles = css`
  @layer premium {
    @scope (.ui-premium-breadcrumbs) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Active item aurora glow */
      :scope .ui-breadcrumbs__current {
        text-shadow: 0 0 10px oklch(65% 0.2 270 / 0.35);
      }

      /* Spring-slide staggered entrance for items */
      :scope:not([data-motion="0"]) .ui-breadcrumbs li {
        animation: ui-premium-crumb-slide 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      :scope:not([data-motion="0"]) .ui-breadcrumbs li:nth-child(1) { animation-delay: 0s; }
      :scope:not([data-motion="0"]) .ui-breadcrumbs li:nth-child(2) { animation-delay: 0.05s; }
      :scope:not([data-motion="0"]) .ui-breadcrumbs li:nth-child(3) { animation-delay: 0.1s; }
      :scope:not([data-motion="0"]) .ui-breadcrumbs li:nth-child(4) { animation-delay: 0.15s; }
      :scope:not([data-motion="0"]) .ui-breadcrumbs li:nth-child(5) { animation-delay: 0.2s; }
      :scope:not([data-motion="0"]) .ui-breadcrumbs li:nth-child(n+6) { animation-delay: 0.25s; }

      @keyframes ui-premium-crumb-slide {
        from {
          opacity: 0;
          transform: translateX(-8px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      /* Hover glow on links */
      :scope:not([data-motion="0"]) .ui-breadcrumbs a {
        transition: color 0.15s, background 0.15s, text-shadow 0.25s ease-out;
      }
      :scope:not([data-motion="0"]) .ui-breadcrumbs a:hover {
        text-shadow: 0 0 8px oklch(65% 0.15 270 / 0.3);
      }

      /* Separator fade for higher motion levels */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-breadcrumbs__separator {
        animation: ui-premium-crumb-sep-fade 0.3s ease-out both;
      }
      @keyframes ui-premium-crumb-sep-fade {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-breadcrumbs li {
        animation: none;
      }
      :scope[data-motion="0"] .ui-breadcrumbs__current {
        text-shadow: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-breadcrumbs li { animation: none !important; }
        :scope .ui-breadcrumbs a { transition: none !important; }
        :scope .ui-breadcrumbs__current { text-shadow: none; }
      }
    }
  }
`

export const Breadcrumbs = forwardRef<HTMLElement, PremiumBreadcrumbsProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-breadcrumbs', premiumBreadcrumbsStyles)

    return (
      <div className="ui-premium-breadcrumbs" data-motion={motionLevel}>
        <BaseBreadcrumbs ref={ref} {...rest} />
      </div>
    )
  }
)

Breadcrumbs.displayName = 'Breadcrumbs'
