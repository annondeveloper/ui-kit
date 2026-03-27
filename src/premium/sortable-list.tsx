'use client'

import { type SortableListProps, SortableList as BaseSortableList } from '../domain/sortable-list'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumSortableListStyles = css`
  @layer premium {
    @scope (.ui-premium-sortable-list) {
      :scope {
        position: relative;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Spring-snap on drop */
      :scope:not([data-motion="0"]) .ui-sortable-list__item {
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                    box-shadow 0.3s ease;
      }

      /* Aurora glow on drag */
      :scope:not([data-motion="0"]) .ui-sortable-list__item[data-dragging="true"] {
        box-shadow:
          0 0 18px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.35),
          0 8px 24px -6px oklch(0% 0 0 / 0.2);
        z-index: 10;
      }

      /* Shimmer placeholder */
      :scope:not([data-motion="0"]) .ui-sortable-list__placeholder {
        position: relative;
        overflow: hidden;
        border: 2px dashed oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3);
        border-radius: var(--radius-md, 0.5rem);
      }
      :scope:not([data-motion="0"]) .ui-sortable-list__placeholder::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) 90% 0.04 h / 0.3) 50%,
          transparent 100%
        );
        animation: ui-premium-sortable-shimmer 1.4s ease-in-out infinite;
      }
      @keyframes ui-premium-sortable-shimmer {
        from { transform: translateX(-100%); }
        to { transform: translateX(100%); }
      }

      /* Spring entry for items */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-sortable-list__item {
        animation: ui-premium-sortable-enter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-sortable-enter {
        from {
          opacity: 0;
          transform: scale(0.92) translateY(8px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      /* Motion 0: disable */
      :scope[data-motion="0"] .ui-sortable-list__item {
        transition: none;
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-sortable-list__item { transition: none; animation: none; }
        :scope .ui-sortable-list__placeholder::after { animation: none; }
      }
    }
  }
`

export function SortableList({ motion: motionProp, ...rest }: SortableListProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-sortable-list', premiumSortableListStyles)

  return (
    <div className="ui-premium-sortable-list" data-motion={motionLevel}>
      <BaseSortableList motion={motionProp} {...rest} />
    </div>
  )
}

SortableList.displayName = 'SortableList'
