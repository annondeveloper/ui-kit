'use client'

import { useRef } from 'react'
import { DiffViewer as BaseDiffViewer, type DiffViewerProps } from '../domain/diff-viewer'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumDiffViewerStyles = css`
  @layer premium {
    @scope (.ui-premium-diff-viewer) {
      :scope {
        position: relative;
      }

      /* Aurora glow on changed lines */
      :scope:not([data-motion="0"]) .ui-diff-viewer__line--added {
        box-shadow: inset 3px 0 0 oklch(72% 0.19 155 / 0.6);
        text-shadow: 0 0 6px oklch(72% 0.15 155 / 0.25);
      }
      :scope:not([data-motion="0"]) .ui-diff-viewer__line--removed {
        box-shadow: inset 3px 0 0 oklch(65% 0.25 25 / 0.6);
        text-shadow: 0 0 6px oklch(65% 0.2 25 / 0.2);
      }

      /* Shimmer on additions */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-diff-viewer__line--added {
        background: linear-gradient(
          110deg,
          oklch(72% 0.08 155 / 0.06) 30%,
          oklch(72% 0.15 155 / 0.18) 50%,
          oklch(72% 0.08 155 / 0.06) 70%
        );
        background-size: 200% 100%;
        animation: ui-premium-diff-shimmer 2.5s ease-in-out infinite;
      }
      @keyframes ui-premium-diff-shimmer {
        0%, 100% { background-position: 200% center; }
        50% { background-position: -200% center; }
      }

      /* Spring-scroll — smooth scroll behavior with overshoot feel */
      :scope:not([data-motion="0"]) .ui-diff-viewer {
        scroll-behavior: smooth;
      }

      /* Staggered line entrance */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-diff-viewer__line {
        animation: ui-premium-diff-line-enter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-diff-line-enter {
        from {
          opacity: 0;
          transform: translateX(-4px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      /* Fold toggle spring */
      :scope:not([data-motion="0"]) .ui-diff-viewer__fold-toggle {
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      :scope:not([data-motion="0"]) .ui-diff-viewer__fold-toggle:hover {
        transform: scale(1.08);
        text-shadow: 0 0 8px oklch(65% 0.2 270 / 0.3);
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-diff-viewer__line {
        animation: none;
        box-shadow: none;
        text-shadow: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-diff-viewer__line {
          animation: none !important;
          text-shadow: none;
        }
      }
    }
  }
`

export function DiffViewer({
  motion: motionProp,
  ...rest
}: DiffViewerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const motionLevel = useMotionLevel(motionProp)
  useEntrance(wrapperRef, motionLevel >= 2 ? 'fade-up' : 'none', { duration: 280 })
  useStyles('premium-diff-viewer', premiumDiffViewerStyles)

  return (
    <div
      ref={wrapperRef}
      className="ui-premium-diff-viewer"
      data-motion={motionLevel}
    >
      <BaseDiffViewer motion={motionProp} {...rest} />
    </div>
  )
}

DiffViewer.displayName = 'DiffViewer'
