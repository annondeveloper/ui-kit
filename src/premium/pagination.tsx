'use client'

import { forwardRef } from 'react'
import { Pagination as BasePagination, type PaginationProps } from '../components/pagination'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumPaginationStyles = css`
  @layer premium {
    @scope (.ui-premium-pagination) {
      :scope {
        display: inline-flex;
      }

      /* Aurora glow on current page */
      :scope .ui-pagination button[aria-current="page"] {
        box-shadow:
          0 0 12px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.4),
          0 0 4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2);
      }

      /* Spring-scale active page — motion 1+ */
      :scope:not([data-motion="0"]) .ui-pagination button {
        transition:
          background 0.15s ease-out,
          color 0.15s ease-out,
          border-color 0.15s ease-out,
          transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
          box-shadow 0.3s ease-out;
      }
      :scope:not([data-motion="0"]) .ui-pagination button[aria-current="page"] {
        animation: ui-premium-page-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      :scope:not([data-motion="0"]) .ui-pagination button:hover:not(:disabled) {
        transform: scale(1.08);
      }

      @keyframes ui-premium-page-pop {
        0% { transform: scale(0.85); opacity: 0.5; }
        60% { transform: scale(1.1); }
        100% { transform: scale(1); opacity: 1; }
      }

      /* Shimmer transition on page change — motion 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-pagination button[aria-current="page"] {
        background:
          linear-gradient(
            110deg,
            var(--brand, oklch(65% 0.2 270)) 35%,
            oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.12) c h) 50%,
            var(--brand, oklch(65% 0.2 270)) 65%
          );
        background-size: 200% 100%;
        animation:
          ui-premium-page-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
          ui-premium-page-shimmer 2s ease-in-out infinite 0.35s;
      }

      @keyframes ui-premium-page-shimmer {
        0% { background-position: 200% center; }
        100% { background-position: -200% center; }
      }

      /* Subtle hover glow */
      :scope .ui-pagination button:hover:not(:disabled):not([aria-current="page"]) {
        box-shadow: 0 0 8px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
      }

      /* Motion 0: no animation */
      :scope[data-motion="0"] .ui-pagination button {
        animation: none;
        transition: background 0.15s, color 0.15s, border-color 0.15s;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-pagination button {
          animation: none;
          transition: none;
          transform: none !important;
        }
      }
    }
  }
`

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-pagination', premiumPaginationStyles)

    return (
      <span className="ui-premium-pagination" data-motion={motionLevel}>
        <BasePagination ref={ref} motion={motionProp} {...rest} />
      </span>
    )
  }
)

Pagination.displayName = 'Pagination'
