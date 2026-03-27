'use client'

import { useRef } from 'react'
import { DataTable as BaseDataTable, type DataTableProps } from '../domain/data-table'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumDataTableStyles = css`
  @layer premium {
    @scope (.ui-premium-data-table) {
      :scope {
        position: relative;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Aurora glow on sorted column header */
      :scope:not([data-motion="0"]) .ui-data-table__header-cell[aria-sort="ascending"],
      :scope:not([data-motion="0"]) .ui-data-table__header-cell[aria-sort="descending"] {
        text-shadow: 0 0 10px oklch(65% 0.2 270 / 0.4);
        box-shadow: inset 0 -2px 0 oklch(65% 0.2 270 / 0.5);
        transition: text-shadow 0.3s ease-out, box-shadow 0.3s ease-out;
      }

      /* Shimmer row loading skeleton */
      :scope:not([data-motion="0"]) .ui-data-table__row--loading {
        background: linear-gradient(
          110deg,
          oklch(25% 0.01 270 / 0) 30%,
          oklch(35% 0.04 270 / 0.3) 50%,
          oklch(25% 0.01 270 / 0) 70%
        );
        background-size: 200% 100%;
        animation: ui-premium-table-shimmer 1.8s ease-in-out infinite;
      }
      @keyframes ui-premium-table-shimmer {
        0%, 100% { background-position: 200% center; }
        50% { background-position: -200% center; }
      }

      /* Spring-slide row entrance animation */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-data-table__row {
        animation: ui-premium-table-row-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        animation-delay: calc(var(--row-index, 0) * 30ms);
      }
      @keyframes ui-premium-table-row-enter {
        from {
          opacity: 0;
          transform: translateX(-8px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      /* Row hover aurora glow */
      :scope:not([data-motion="0"]) .ui-data-table__row:hover {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.06);
        box-shadow: inset 3px 0 0 oklch(65% 0.2 270 / 0.4);
        transition: background 0.2s ease-out, box-shadow 0.2s ease-out;
      }

      /* Selected row glow */
      :scope:not([data-motion="0"]) .ui-data-table__row[aria-selected="true"] {
        box-shadow:
          inset 3px 0 0 oklch(65% 0.25 270 / 0.6),
          0 0 12px -4px oklch(65% 0.2 270 / 0.2);
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-data-table__row {
        animation: none;
        transition: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-data-table__row {
          animation: none !important;
          transition: none !important;
        }
      }
    }
  }
`

export function DataTable<T extends object>({
  motion: motionProp,
  ...rest
}: DataTableProps<T>) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-data-table', premiumDataTableStyles)

  return (
    <div
      ref={wrapperRef}
      className="ui-premium-data-table"
      data-motion={motionLevel}
    >
      <BaseDataTable motion={motionProp} {...rest} />
    </div>
  )
}

DataTable.displayName = 'DataTable'
