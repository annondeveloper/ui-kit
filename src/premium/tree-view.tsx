'use client'

import { forwardRef } from 'react'
import { TreeView as BaseTreeView, type TreeViewProps } from '../domain/tree-view'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumTreeStyles = css`
  @layer premium {
    @scope (.ui-premium-tree-view) {
      :scope {
        position: relative;
      }

      /* Spring expand/collapse on group toggle */
      :scope:not([data-motion="0"]) .ui-tree-view__group:not([data-motion="0"]) {
        transition: grid-template-rows 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Spring-rotate chevron with overshoot */
      :scope:not([data-motion="0"]) .ui-tree-view__toggle svg {
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Aurora glow on active/selected node */
      :scope:not([data-motion="0"]) .ui-tree-view__row[data-selected] {
        box-shadow: inset 0 0 12px -4px oklch(65% 0.2 270 / 0.25);
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.14);
      }

      /* Subtle glow on hover */
      :scope:not([data-motion="0"]) .ui-tree-view__row:hover:not([data-selected]) {
        box-shadow: inset 0 0 8px -3px oklch(65% 0.15 270 / 0.12);
      }

      /* Shimmer loading state on lazy nodes */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-tree-view__loading {
        position: relative;
        overflow: hidden;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-tree-view__loading::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          105deg,
          transparent 35%,
          oklch(100% 0 0 / 0.06) 50%,
          transparent 65%
        );
        animation: ui-premium-tree-shimmer 1.5s ease-in-out infinite;
        pointer-events: none;
      }
      @keyframes ui-premium-tree-shimmer {
        from { transform: translateX(-100%); }
        to { transform: translateX(100%); }
      }

      /* Enhanced spinner glow */
      :scope:not([data-motion="0"]) .ui-tree-view__spinner {
        border-block-start-color: oklch(75% 0.2 270);
        filter: drop-shadow(0 0 4px oklch(65% 0.2 270 / 0.4));
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-tree-view__group { transition: none; }
      :scope[data-motion="0"] .ui-tree-view__toggle svg { transition: none; }
      :scope[data-motion="0"] .ui-tree-view__loading::after { display: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-tree-view__group { transition: none; }
        :scope .ui-tree-view__toggle svg { transition: none; }
        :scope .ui-tree-view__loading::after { display: none; }
      }
    }
  }
`

export const TreeView = forwardRef<HTMLDivElement, TreeViewProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-tree-view', premiumTreeStyles)

    return (
      <div ref={ref} className="ui-premium-tree-view" data-motion={motionLevel}>
        <BaseTreeView motion={motionProp} {...rest} />
      </div>
    )
  }
)

TreeView.displayName = 'TreeView'
