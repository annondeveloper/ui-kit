'use client'

import type React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '../utils'
import { Plus } from 'lucide-react'

export type KanbanBadgeColor =
  | 'brand' | 'blue' | 'green' | 'yellow' | 'red' | 'orange'
  | 'purple' | 'pink' | 'teal' | 'gray'

export interface KanbanItem {
  id: string
  title: string
  description?: string
  tags?: { label: string; color: KanbanBadgeColor }[]
  assignee?: { name: string; avatar?: string }
}

export interface KanbanColumnProps {
  /** Column title. */
  title: string
  /** Items to display in this column. */
  items: KanbanItem[]
  /** Optional override for the count badge. */
  count?: number
  /** Column header accent color (CSS value or token). */
  color?: string
  /** Callback when a card is clicked. */
  onItemClick?: (item: KanbanItem) => void
  /** Callback when the add button is clicked. */
  onAddItem?: () => void
  className?: string
}

const TAG_COLOR_MAP: Record<KanbanBadgeColor, string> = {
  brand:  'bg-[hsl(var(--brand-primary))]/15 text-[hsl(var(--brand-primary))]',
  blue:   'bg-[hsl(var(--brand-secondary))]/15 text-[hsl(var(--brand-secondary))]',
  green:  'bg-[hsl(var(--status-ok))]/15 text-[hsl(var(--status-ok))]',
  yellow: 'bg-[hsl(var(--status-warning))]/15 text-[hsl(var(--status-warning))]',
  red:    'bg-[hsl(var(--status-critical))]/15 text-[hsl(var(--status-critical))]',
  orange: 'bg-[hsl(var(--status-warning))]/20 text-[hsl(var(--status-warning))]',
  purple: 'bg-[hsl(270,60%,60%)]/15 text-[hsl(270,60%,65%)]',
  pink:   'bg-[hsl(330,60%,60%)]/15 text-[hsl(330,60%,65%)]',
  teal:   'bg-[hsl(180,60%,40%)]/15 text-[hsl(180,60%,55%)]',
  gray:   'bg-[hsl(var(--bg-overlay))] text-[hsl(var(--text-secondary))]',
}

/**
 * @description A kanban board column with title, count badge, scrollable card list,
 * hover states, staggered Framer Motion entrance, and empty state.
 */
export function KanbanColumn({
  title,
  items,
  count,
  color,
  onItemClick,
  onAddItem,
  className,
}: KanbanColumnProps): React.JSX.Element {
  const reduced = useReducedMotion()
  const displayCount = count ?? items.length

  return (
    <div
      className={cn(
        'flex flex-col w-72 min-w-[18rem] rounded-2xl',
        'bg-[hsl(var(--bg-surface))] border border-[hsl(var(--border-subtle))]',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border-subtle))]">
        <div className="flex items-center gap-2">
          {color && (
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
          )}
          <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">
            {title}
          </span>
          <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-medium tabular-nums bg-[hsl(var(--bg-overlay))] text-[hsl(var(--text-secondary))]">
            {displayCount}
          </span>
        </div>
        {onAddItem && (
          <button
            type="button"
            onClick={onAddItem}
            className={cn(
              'p-1 rounded-lg cursor-pointer',
              'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]',
              'hover:bg-[hsl(var(--bg-overlay))] transition-colors duration-150',
            )}
            aria-label={`Add item to ${title}`}
          >
            <Plus className="size-4" />
          </button>
        )}
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {items.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-xs text-[hsl(var(--text-tertiary))]">
            No items
          </div>
        ) : (
          items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={reduced ? undefined : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduced ? { duration: 0 } : { delay: idx * 0.04, duration: 0.2 }}
            >
              <KanbanCard item={item} onClick={onItemClick} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

function KanbanCard({
  item,
  onClick,
}: {
  item: KanbanItem
  onClick?: (item: KanbanItem) => void
}): React.JSX.Element {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick ? () => onClick(item) : undefined}
      onKeyDown={
        onClick
          ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(item) }
          : undefined
      }
      className={cn(
        'rounded-xl p-3 border border-[hsl(var(--border-subtle))]',
        'bg-[hsl(var(--bg-base))]',
        onClick && 'cursor-pointer hover:bg-[hsl(var(--bg-elevated))] hover:shadow-sm',
        'transition-all duration-150',
      )}
    >
      <p className="text-sm font-medium text-[hsl(var(--text-primary))] line-clamp-2">
        {item.title}
      </p>
      {item.description && (
        <p className="mt-1 text-xs text-[hsl(var(--text-secondary))] line-clamp-2">
          {item.description}
        </p>
      )}

      {/* Tags + Assignee row */}
      {(item.tags?.length || item.assignee) && (
        <div className="flex items-center justify-between mt-2.5 gap-2">
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 min-w-0">
              {item.tags.map((tag, i) => (
                <span
                  key={i}
                  className={cn(
                    'inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap',
                    TAG_COLOR_MAP[tag.color],
                  )}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          )}
          {item.assignee && (
            <div className="shrink-0" title={item.assignee.name}>
              {item.assignee.avatar ? (
                <img
                  src={item.assignee.avatar}
                  alt={item.assignee.name}
                  className="size-6 rounded-full object-cover"
                />
              ) : (
                <div className="size-6 rounded-full bg-[hsl(var(--bg-overlay))] flex items-center justify-center text-[10px] font-semibold text-[hsl(var(--text-secondary))]">
                  {item.assignee.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
