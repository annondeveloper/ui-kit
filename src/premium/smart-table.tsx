'use client'

import { forwardRef, type Ref } from 'react'
import { SmartTable as BaseSmartTable, type SmartTableProps } from '../domain/smart-table'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumSmartTableStyles = css`
  @layer premium {
    @scope (.ui-premium-smart-table) {
      :scope {
        position: relative;
      }

      /* Aurora glow headers */
      :scope .ui-data-table__header-cell {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.06);
        box-shadow: inset 0 -2px 8px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.25);
        transition: box-shadow 0.3s ease;
      }
      :scope .ui-data-table__header-cell:hover {
        box-shadow:
          inset 0 -2px 8px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.4),
          0 0 12px -3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2);
      }

      /* Shimmer loading rows */
      :scope[data-loading="true"] .ui-data-table__row {
        position: relative;
        overflow: hidden;
      }
      :scope:not([data-motion="0"])[data-loading="true"] .ui-data-table__row::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) 90% 0.03 h / 0.4) 50%,
          transparent 100%
        );
        animation: ui-premium-table-shimmer 1.6s ease-in-out infinite;
      }
      @keyframes ui-premium-table-shimmer {
        from { transform: translateX(-100%); }
        to { transform: translateX(100%); }
      }

      /* Spring-sort column transition */
      :scope:not([data-motion="0"]) .ui-data-table__row {
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                    opacity 0.25s ease;
      }

      /* Motion 0: disable */
      :scope[data-motion="0"] .ui-data-table__row {
        transition: none;
      }
      :scope[data-motion="0"] .ui-data-table__row::after {
        display: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-data-table__row { transition: none; }
        :scope .ui-data-table__row::after { animation: none; }
      }
    }
  }
`

function SmartTableInner<T extends object>(
  props: SmartTableProps<T> & { ref?: Ref<HTMLDivElement> },
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const { motion: motionProp, loading, ...rest } = props as SmartTableProps<T> & { motion?: 0 | 1 | 2 | 3; loading?: boolean }
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-smart-table', premiumSmartTableStyles)

  return (
    <div
      className="ui-premium-smart-table"
      data-motion={motionLevel}
      data-loading={loading || undefined}
    >
      <BaseSmartTable ref={ref} {...rest} />
    </div>
  )
}

export const SmartTable = forwardRef(SmartTableInner) as <T extends object>(
  props: SmartTableProps<T> & { ref?: Ref<HTMLDivElement> }
) => React.ReactElement | null

;(SmartTable as any).displayName = 'SmartTable'
