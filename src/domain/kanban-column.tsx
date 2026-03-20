'use client'

import {
  useCallback,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useStableId } from '../core/a11y/stable-id'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface KanbanCard {
  id: string
  title: ReactNode
  description?: ReactNode
  tags?: string[]
  assignee?: ReactNode
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

export interface KanbanColumnProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode
  cards: KanbanCard[]
  onCardMove?: (cardId: string, targetColumnId: string, targetIndex: number) => void
  onCardClick?: (cardId: string) => void
  wipLimit?: number
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  columnId: string
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const kanbanColumnStyles = css`
  @layer components {
    @scope (.ui-kanban-column) {
      :scope {
        display: flex;
        flex-direction: column;
        min-inline-size: 17rem;
        max-inline-size: 22rem;
        background: var(--bg-surface, oklch(18% 0.01 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-lg, 0.75rem);
        overflow: hidden;
      }

      :scope[data-collapsed] {
        min-inline-size: 3rem;
        max-inline-size: 3rem;
        align-items: center;
      }

      /* ── Header ──────────────────────────────────────── */

      .ui-kanban-column__header {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        padding-block: var(--space-sm, 0.5rem);
        padding-inline: var(--space-md, 0.75rem);
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        user-select: none;
      }

      :scope[data-collapsed] .ui-kanban-column__header {
        flex-direction: column;
        padding-inline: var(--space-xs, 0.25rem);
        writing-mode: vertical-rl;
        text-orientation: mixed;
        border-block-end: none;
      }

      .ui-kanban-column__title {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        flex: 1;
        min-inline-size: 0;
        text-wrap: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .ui-kanban-column__count {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-inline-size: 1.5rem;
        block-size: 1.5rem;
        padding-inline: 0.25rem;
        border-radius: var(--radius-full, 9999px);
        background: oklch(100% 0 0 / 0.06);
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-secondary, oklch(70% 0 0));
        flex-shrink: 0;
      }

      /* WIP exceeded state */
      [data-wip-exceeded] .ui-kanban-column__count {
        background: oklch(65% 0.2 30 / 0.15);
        color: oklch(75% 0.15 30);
      }

      .ui-kanban-column__collapse-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 1.5rem;
        block-size: 1.5rem;
        border: none;
        background: transparent;
        color: var(--text-tertiary, oklch(60% 0 0));
        cursor: pointer;
        border-radius: var(--radius-sm, 0.25rem);
        flex-shrink: 0;
        padding: 0;
      }

      .ui-kanban-column__collapse-btn:hover {
        background: oklch(100% 0 0 / 0.06);
        color: var(--text-primary, oklch(90% 0 0));
      }

      /* ── Card list ───────────────────────────────────── */

      .ui-kanban-column__cards {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        padding: var(--space-sm, 0.5rem);
        overflow-y: auto;
        flex: 1;
        min-block-size: 3rem;
      }

      /* ── Card ────────────────────────────────────────── */

      .ui-kanban-column__card {
        display: flex;
        flex-direction: column;
        gap: var(--space-2xs, 0.125rem);
        padding: var(--space-sm, 0.5rem);
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 0.5rem);
        background: var(--bg-elevated, oklch(22% 0.01 270));
        cursor: pointer;
        outline: none;
        position: relative;
        transition: background 0.1s, box-shadow 0.1s;
      }

      .ui-kanban-column__card:hover {
        background: oklch(100% 0 0 / 0.04);
        box-shadow: var(--shadow-sm, 0 2px 6px oklch(0% 0 0 / 0.15));
      }

      .ui-kanban-column__card:focus-visible {
        box-shadow: 0 0 0 2px var(--brand, oklch(65% 0.2 270));
      }

      /* Priority left border */
      .ui-kanban-column__card[data-priority="low"] {
        border-inline-start: 3px solid oklch(70% 0.1 200);
      }
      .ui-kanban-column__card[data-priority="medium"] {
        border-inline-start: 3px solid oklch(75% 0.15 80);
      }
      .ui-kanban-column__card[data-priority="high"] {
        border-inline-start: 3px solid oklch(70% 0.2 40);
      }
      .ui-kanban-column__card[data-priority="critical"] {
        border-inline-start: 3px solid oklch(65% 0.25 25);
      }

      /* ── Card title ──────────────────────────────────── */

      .ui-kanban-column__card-title {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.4;
      }

      /* ── Card description ────────────────────────────── */

      .ui-kanban-column__card-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      /* ── Card footer (tags + assignee) ───────────────── */

      .ui-kanban-column__card-footer {
        display: flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        margin-block-start: var(--space-2xs, 0.125rem);
        flex-wrap: wrap;
      }

      .ui-kanban-column__tag {
        display: inline-flex;
        align-items: center;
        padding-block: 0.0625rem;
        padding-inline: 0.375rem;
        border-radius: var(--radius-full, 9999px);
        background: oklch(100% 0 0 / 0.06);
        font-size: var(--text-2xs, 0.625rem);
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1.6;
      }

      .ui-kanban-column__assignee {
        margin-inline-start: auto;
        flex-shrink: 0;
      }

      /* ── Reduced motion ──────────────────────────────── */

      @media (prefers-reduced-motion: reduce) {
        .ui-kanban-column__card {
          transition: none;
        }
      }

      /* ── Touch targets ───────────────────────────────── */

      @media (pointer: coarse) {
        .ui-kanban-column__card {
          min-block-size: 44px;
        }
        .ui-kanban-column__collapse-btn {
          min-inline-size: 44px;
          min-block-size: 44px;
        }
      }

      /* ── Forced colors ───────────────────────────────── */

      @media (forced-colors: active) {
        :scope {
          border: 1px solid ButtonText;
        }
        .ui-kanban-column__card {
          border: 1px solid ButtonText;
        }
        .ui-kanban-column__card:focus-visible {
          outline: 2px solid Highlight;
        }
        .ui-kanban-column__card[data-priority] {
          border-inline-start: 3px solid Highlight;
        }
        .ui-kanban-column__tag {
          border: 1px solid ButtonText;
        }
      }

      /* ── Print ───────────────────────────────────────── */

      @media print {
        :scope {
          break-inside: avoid;
        }
        .ui-kanban-column__collapse-btn {
          display: none;
        }
      }
    }
  }
`

// ─── Icons ──────────────────────────────────────────────────────────────────

function CollapseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export function KanbanColumn({
  title,
  cards,
  onCardMove,
  onCardClick,
  wipLimit,
  collapsed = false,
  onCollapse,
  columnId,
  motion: motionProp,
  className,
  ...rest
}: KanbanColumnProps) {
  useStyles('kanban-column', kanbanColumnStyles)
  const motionLevel = useMotionLevel(motionProp)
  const headerId = useStableId('kanban-header')

  const wipExceeded = wipLimit !== undefined && cards.length >= wipLimit

  const handleCardClick = useCallback(
    (cardId: string) => {
      onCardClick?.(cardId)
    },
    [onCardClick]
  )

  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent, cardId: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onCardClick?.(cardId)
      }
    },
    [onCardClick]
  )

  return (
    <div
      className={cn('ui-kanban-column', className)}
      data-motion={motionLevel}
      data-column-id={columnId}
      {...(collapsed ? { 'data-collapsed': '' } : {})}
      {...(wipExceeded ? { 'data-wip-exceeded': '' } : {})}
      role="region"
      aria-labelledby={headerId}
      {...rest}
    >
      {/* Header */}
      <div className="ui-kanban-column__header">
        <span className="ui-kanban-column__title" id={headerId}>
          {title}
        </span>
        <span className="ui-kanban-column__count">{cards.length}</span>
        {wipLimit !== undefined && (
          <span className="ui-kanban-column__wip-label" aria-label={`WIP limit: ${wipLimit}`}>
            / {wipLimit}
          </span>
        )}
        {onCollapse && (
          <button
            className="ui-kanban-column__collapse-btn"
            onClick={() => onCollapse(!collapsed)}
            aria-label={collapsed ? 'Expand column' : 'Collapse column'}
          >
            {collapsed ? <ExpandIcon /> : <CollapseIcon />}
          </button>
        )}
      </div>

      {/* Cards */}
      {!collapsed && (
        <div className="ui-kanban-column__cards">
          {cards.map((card, i) => (
            <div
              key={card.id}
              className="ui-kanban-column__card"
              data-card=""
              data-card-id={card.id}
              data-priority={card.priority || undefined}
              tabIndex={onCardClick ? 0 : undefined}
              onClick={() => handleCardClick(card.id)}
              onKeyDown={(e) => handleCardKeyDown(e, card.id)}
            >
              <span className="ui-kanban-column__card-title">{card.title}</span>
              {card.description && (
                <span className="ui-kanban-column__card-desc">{card.description}</span>
              )}
              {(card.tags?.length || card.assignee) && (
                <div className="ui-kanban-column__card-footer">
                  {card.tags?.map((tag) => (
                    <span key={tag} className="ui-kanban-column__tag">{tag}</span>
                  ))}
                  {card.assignee && (
                    <span className="ui-kanban-column__assignee">{card.assignee}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

KanbanColumn.displayName = 'KanbanColumn'
