'use client'

import { forwardRef } from 'react'
import { Link as BaseLink, type LinkProps } from '../components/link'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumLinkStyles = css`
  @layer premium {
    @scope (.ui-premium-link) {
      :scope {
        display: inline;
        position: relative;
      }

      /* Aurora underline glow on hover */
      :scope .ui-link:hover {
        text-shadow: 0 0 16px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.5);
      }

      /* Spring-slide underline via pseudo-element */
      :scope:not([data-motion="0"]) .ui-link {
        position: relative;
      }
      :scope:not([data-motion="0"]) .ui-link::after {
        content: '';
        position: absolute;
        inset-inline: 0;
        inset-block-end: -1px;
        block-size: 2px;
        background: linear-gradient(
          90deg,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.6),
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.1) c h),
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.6)
        );
        border-radius: 1px;
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow: 0 0 8px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.4);
      }
      :scope:not([data-motion="0"]) .ui-link:hover::after {
        transform: scaleX(1);
      }

      /* Shimmer text effect — motion 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-link:hover {
        background: linear-gradient(
          110deg,
          currentColor 35%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.15) c h) 50%,
          currentColor 65%
        );
        background-size: 200% 100%;
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: ui-premium-link-shimmer 1.8s ease-in-out infinite;
      }

      @keyframes ui-premium-link-shimmer {
        0% { background-position: 200% center; }
        100% { background-position: -200% center; }
      }

      /* Motion 0: no effects */
      :scope[data-motion="0"] .ui-link::after {
        display: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-link::after { transition: none; display: none; }
        :scope .ui-link:hover {
          animation: none;
          -webkit-text-fill-color: unset;
          background-clip: unset;
        }
      }
    }
  }
`

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-link', premiumLinkStyles)

    return (
      <span className="ui-premium-link" data-motion={motionLevel}>
        <BaseLink ref={ref} motion={motionProp} {...rest} />
      </span>
    )
  }
)

Link.displayName = 'Link'
