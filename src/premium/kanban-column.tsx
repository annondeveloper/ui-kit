'use client'

import { KanbanColumn as BaseKanbanColumn, type KanbanColumnProps } from '../domain/kanban-column'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumKanbanStyles = css`
  @layer premium {
    @scope (.ui-premium-kanban-column) {
      :scope {
        position: relative;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Glass morphism header */
      :scope .ui-kanban-column__header {
        background: oklch(20% 0.02 270 / 0.6);
        backdrop-filter: blur(16px) saturate(1.4);
        -webkit-backdrop-filter: blur(16px) saturate(1.4);
        border-block-end: 1px solid oklch(50% 0.05 270 / 0.15);
        box-shadow: 0 2px 8px oklch(10% 0.02 270 / 0.15);
      }

      /* Aurora glow on drag-over */
      :scope[data-drag-over="true"] {
        box-shadow:
          0 0 16px oklch(65% 0.2 270 / 0.25),
          0 0 40px oklch(70% 0.15 240 / 0.1);
        outline: 1.5px solid oklch(65% 0.18 270 / 0.35);
        transition: box-shadow 0.25s ease-out, outline 0.25s ease-out;
      }

      /* Spring-snap entrance for cards */
      :scope:not([data-motion="0"]) .ui-kanban-column__card {
        animation: ui-premium-kanban-card-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-kanban-card-enter {
        from { opacity: 0; transform: translateY(12px) scale(0.95); }
        70%  { transform: translateY(-2px) scale(1.02); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }

      /* Stagger card entrance */
      :scope:not([data-motion="0"]) .ui-kanban-column__card:nth-child(1) { animation-delay: 0ms; }
      :scope:not([data-motion="0"]) .ui-kanban-column__card:nth-child(2) { animation-delay: 60ms; }
      :scope:not([data-motion="0"]) .ui-kanban-column__card:nth-child(3) { animation-delay: 120ms; }
      :scope:not([data-motion="0"]) .ui-kanban-column__card:nth-child(4) { animation-delay: 180ms; }
      :scope:not([data-motion="0"]) .ui-kanban-column__card:nth-child(5) { animation-delay: 240ms; }

      /* Card hover glow */
      :scope .ui-kanban-column__card:hover {
        box-shadow: 0 0 10px oklch(65% 0.15 270 / 0.2);
        transition: box-shadow 0.2s ease-out;
      }

      /* Dragging card visual */
      :scope .ui-kanban-column__card[data-dragging="true"] {
        box-shadow: 0 8px 24px oklch(10% 0.02 270 / 0.4);
        transform: rotate(2deg) scale(1.03);
        opacity: 0.9;
      }

      :scope[data-motion="0"] .ui-kanban-column__card {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-kanban-column__card { animation: none; }
      }
    }
  }
`

export function KanbanColumn({ motion: motionProp, ...rest }: KanbanColumnProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-kanban-column', premiumKanbanStyles)

  return (
    <div className="ui-premium-kanban-column" data-motion={motionLevel}>
      <BaseKanbanColumn motion={motionProp} {...rest} />
    </div>
  )
}

KanbanColumn.displayName = 'KanbanColumn'
