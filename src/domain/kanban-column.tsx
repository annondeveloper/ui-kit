'use client'

import React, {
  useCallback,
  useRef,
  useState,
  useEffect,
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
        background: var(--border-subtle, oklch(100% 0 0 / 0.06));
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
        background: var(--border-subtle, oklch(100% 0 0 / 0.06));
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
        background: var(--border-subtle, oklch(100% 0 0 / 0.04));
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
        background: var(--border-subtle, oklch(100% 0 0 / 0.06));
        font-size: var(--text-2xs, 0.625rem);
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1.6;
      }

      .ui-kanban-column__assignee {
        margin-inline-start: auto;
        flex-shrink: 0;
      }

      /* ── Drag and drop states ─────────────────────────── */

      .ui-kanban-column__card--dragging {
        opacity: 0.5;
        box-shadow: 0 0 0 2px var(--brand, oklch(65% 0.2 270));
      }

      .ui-kanban__drop-indicator {
        block-size: 2px;
        background: var(--brand, oklch(65% 0.2 270));
        border-radius: 1px;
        box-shadow: 0 0 6px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.4);
        margin-block: -1px;
        pointer-events: none;
      }

      .ui-kanban-column__cards[data-drag-over] {
        box-shadow: inset 0 0 0 1px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
        border-radius: var(--radius-md, 0.5rem);
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
  const cardsRef = useRef<HTMLDivElement>(null)
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null)
  const dropIndicatorIndexRef = useRef<number | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const dragEnterCounterRef = useRef(0)

  // Keep ref in sync with state
  const updateDropIndicatorIndex = useCallback((index: number | null) => {
    dropIndicatorIndexRef.current = index
    setDropIndicatorIndex(index)
  }, [])

  // ── Drag handlers ──

  const handleDragStart = useCallback(
    (e: React.DragEvent, cardId: string) => {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', JSON.stringify({ cardId, sourceColumnId: columnId }))
      const target = e.currentTarget as HTMLElement
      requestAnimationFrame(() => {
        target?.classList?.add('ui-kanban-column__card--dragging')
      })
    },
    [columnId]
  )

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement
    target.classList.remove('ui-kanban-column__card--dragging')
    updateDropIndicatorIndex(null)
    setIsDragOver(false)
  }, [updateDropIndicatorIndex])

  const getDropIndex = useCallback((e: React.DragEvent) => {
    const container = cardsRef.current
    if (!container) return cards.length
    const cardElements = Array.from(container.querySelectorAll<HTMLElement>('[data-card]'))
    for (let i = 0; i < cardElements.length; i++) {
      const rect = cardElements[i].getBoundingClientRect()
      const midY = rect.top + rect.height / 2
      if (e.clientY < midY) return i
    }
    return cards.length
  }, [cards.length])

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      dragEnterCounterRef.current++
      setIsDragOver(true)
    },
    []
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      const index = getDropIndex(e)
      updateDropIndicatorIndex(index)
    },
    [getDropIndex, updateDropIndicatorIndex]
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    dragEnterCounterRef.current--
    if (dragEnterCounterRef.current <= 0) {
      dragEnterCounterRef.current = 0
      updateDropIndicatorIndex(null)
      setIsDragOver(false)
    }
  }, [updateDropIndicatorIndex])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      dragEnterCounterRef.current = 0
      updateDropIndicatorIndex(null)
      setIsDragOver(false)
      try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'))
        const newIndex = getDropIndex(e)
        onCardMove?.(data.cardId, columnId, newIndex)
      } catch {
        // ignore invalid drag data
      }
    },
    [getDropIndex, onCardMove, columnId, updateDropIndicatorIndex]
  )

  // ── Touch DnD (basic) ──

  const touchState = useRef<{
    cardId: string
    startY: number
    el: HTMLElement
    clone: HTMLElement | null
  } | null>(null)

  useEffect(() => {
    const container = cardsRef.current
    if (!container || !onCardMove) return

    const handleTouchStart = (e: TouchEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('[data-card]')
      if (!card) return
      const cardId = card.getAttribute('data-card-id')
      if (!cardId) return
      const touch = e.touches[0]
      card.classList.add('ui-kanban-column__card--dragging')
      touchState.current = { cardId, startY: touch.clientY, el: card, clone: null }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchState.current) return
      e.preventDefault()
      const touch = e.touches[0]
      const cardEls = Array.from(container.querySelectorAll<HTMLElement>('[data-card]'))
      let newIndex = cardEls.length
      for (let i = 0; i < cardEls.length; i++) {
        const rect = cardEls[i].getBoundingClientRect()
        if (touch.clientY < rect.top + rect.height / 2) {
          newIndex = i
          break
        }
      }
      updateDropIndicatorIndex(newIndex)
    }

    const handleTouchEnd = () => {
      if (!touchState.current) return
      const { cardId, el } = touchState.current
      el.classList.remove('ui-kanban-column__card--dragging')
      const currentDropIndex = dropIndicatorIndexRef.current
      if (currentDropIndex !== null) {
        onCardMove(cardId, columnId, currentDropIndex)
      }
      updateDropIndicatorIndex(null)
      touchState.current = null
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onCardMove, columnId, updateDropIndicatorIndex])

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
        <div
          ref={cardsRef}
          className="ui-kanban-column__cards"
          {...(isDragOver ? { 'data-drag-over': '' } : {})}
          onDragEnter={onCardMove ? handleDragEnter : undefined}
          onDragOver={onCardMove ? handleDragOver : undefined}
          onDragLeave={onCardMove ? handleDragLeave : undefined}
          onDrop={onCardMove ? handleDrop : undefined}
        >
          {cards.map((card, i) => (
            <React.Fragment key={card.id}>
              {dropIndicatorIndex === i && (
                <div className="ui-kanban__drop-indicator" aria-hidden="true" />
              )}
              <div
                className="ui-kanban-column__card"
                data-card=""
                data-card-id={card.id}
                data-priority={card.priority || undefined}
                tabIndex={onCardClick ? 0 : undefined}
                draggable={onCardMove ? true : undefined}
                onDragStart={onCardMove ? (e) => handleDragStart(e, card.id) : undefined}
                onDragEnd={onCardMove ? handleDragEnd : undefined}
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
            </React.Fragment>
          ))}
          {dropIndicatorIndex === cards.length && (
            <div className="ui-kanban__drop-indicator" aria-hidden="true" />
          )}
        </div>
      )}
    </div>
  )
}

KanbanColumn.displayName = 'KanbanColumn'
