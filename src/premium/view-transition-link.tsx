'use client'

import { ViewTransitionLink as BaseViewTransitionLink, type ViewTransitionLinkProps } from '../domain/view-transition-link'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumViewTransitionLinkStyles = css`
  @layer premium {
    @scope (.ui-premium-view-transition-link) {
      :scope {
        display: inline-flex;
        position: relative;
      }

      /* Aurora glow on hover */
      :scope:not([data-motion="0"]) .ui-view-transition-link:hover {
        text-shadow: 0 0 12px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.35);
      }

      :scope:not([data-motion="0"]) .ui-view-transition-link::after {
        content: '';
        position: absolute;
        inset-inline: 0;
        inset-block-end: -2px;
        block-size: 2px;
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.5);
        border-radius: 1px;
        transform: scaleX(0);
        transform-origin: center;
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      :scope:not([data-motion="0"]) .ui-view-transition-link:hover::after {
        transform: scaleX(1);
      }

      /* Spring-scale on click transition */
      :scope:not([data-motion="0"]) .ui-view-transition-link:active {
        transform: scale(0.97);
        transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Entrance animation */
      :scope:not([data-motion="0"]) .ui-view-transition-link {
        animation: ui-premium-vtlink-enter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }

      @keyframes ui-premium-vtlink-enter {
        from { opacity: 0; transform: scale(0.9); }
        70% { transform: scale(1.03); }
        to { opacity: 1; transform: scale(1); }
      }

      :scope[data-motion="0"] .ui-view-transition-link {
        animation: none;
      }
      :scope[data-motion="0"] .ui-view-transition-link::after {
        display: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-view-transition-link { animation: none; }
        :scope .ui-view-transition-link::after { display: none; }
      }
    }
  }
`

export function ViewTransitionLink(props: ViewTransitionLinkProps) {
  const motionLevel = useMotionLevel()
  useStyles('premium-view-transition-link', premiumViewTransitionLinkStyles)

  return (
    <span className="ui-premium-view-transition-link" data-motion={motionLevel}>
      <BaseViewTransitionLink {...props} />
    </span>
  )
}

ViewTransitionLink.displayName = 'ViewTransitionLink'
