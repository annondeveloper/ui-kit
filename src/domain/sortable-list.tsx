'use client'

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SortableItem {
  id: string
  content: ReactNode
}

export interface SortableListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: SortableItem[]
  onChange: (items: SortableItem[]) => void
  handle?: boolean
  disabled?: boolean
  orientation?: 'vertical' | 'horizontal'
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const sortableListStyles = css`
  @layer components {
    @scope (.ui-sortable-list) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
      }

      :scope[data-orientation="horizontal"] {
        flex-direction: row;
      }

      /* ── Item ────────────────────────────────────────── */

      .ui-sortable-list__item {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-sm, 0.5rem);
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 0.5rem);
        background: var(--bg-surface, oklch(18% 0.01 270));
        color: var(--text-primary, oklch(90% 0 0));
        font-size: var(--text-sm, 0.875rem);
        cursor: grab;
        user-select: none;
        touch-action: none;
        min-block-size: 2.25rem;
        outline: none;
        position: relative;
        transition: background 0.1s, box-shadow 0.1s, transform 0.15s;
      }

      .ui-sortable-list__item:focus-visible {
        box-shadow: 0 0 0 2px var(--brand, oklch(65% 0.2 270));
      }

      .ui-sortable-list__item:hover:not([aria-disabled="true"]) {
        background: var(--bg-hover);
      }

      .ui-sortable-list__item[data-grabbed="true"] {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08);
        box-shadow:
          0 0 0 2px var(--brand, oklch(65% 0.2 270)),
          var(--shadow-md, 0 4px 12px oklch(0% 0 0 / 0.25));
        cursor: grabbing;
        z-index: 10;
      }

      /* Drag-in-progress visual feedback */
      .ui-sortable-list__item--dragging {
        opacity: 0.5;
        box-shadow:
          0 0 0 2px var(--brand, oklch(65% 0.2 270)),
          0 8px 24px oklch(0% 0 0 / 0.3);
        transform: scale(1.02);
      }

      /* Drop indicator line */
      .ui-sortable-list__drop-indicator {
        block-size: 2px;
        background: var(--brand, oklch(65% 0.2 270));
        border-radius: 1px;
        box-shadow: 0 0 6px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.4);
        margin-block: -1px;
        pointer-events: none;
      }

      :scope[data-orientation="horizontal"] .ui-sortable-list__drop-indicator {
        inline-size: 2px;
        block-size: auto;
        align-self: stretch;
        margin-inline: -1px;
        margin-block: 0;
      }

      .ui-sortable-list__item[aria-disabled="true"] {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* ── Drag handle ─────────────────────────────────── */

      .ui-sortable-list__handle {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: var(--text-tertiary, oklch(60% 0 0));
        cursor: grab;
        touch-action: none;
      }

      .ui-sortable-list__handle svg {
        inline-size: 1em;
        block-size: 1em;
      }

      [data-grabbed="true"] .ui-sortable-list__handle {
        cursor: grabbing;
      }

      /* ── Content ─────────────────────────────────────── */

      .ui-sortable-list__content {
        flex: 1;
        min-inline-size: 0;
      }

      /* ── Drop placeholder ────────────────────────────── */

      .ui-sortable-list__placeholder {
        border: 2px dashed var(--brand, oklch(65% 0.2 270));
        border-radius: var(--radius-md, 0.5rem);
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.04);
        min-block-size: 2.25rem;
      }

      /* ── Reduced motion ──────────────────────────────── */

      @media (prefers-reduced-motion: reduce) {
        .ui-sortable-list__item {
          transition: none;
        }
      }

      /* ── Touch targets ───────────────────────────────── */

      @media (pointer: coarse) {
        .ui-sortable-list__item {
          min-block-size: 44px;
        }
        .ui-sortable-list__handle {
          min-inline-size: 44px;
          min-block-size: 44px;
        }
      }

      /* ── Forced colors ───────────────────────────────── */

      @media (forced-colors: active) {
        .ui-sortable-list__item {
          border: 1px solid ButtonText;
        }
        .ui-sortable-list__item[data-grabbed="true"] {
          outline: 2px solid Highlight;
        }
        .ui-sortable-list__item:focus-visible {
          outline: 2px solid Highlight;
        }
        .ui-sortable-list__placeholder {
          border: 2px dashed Highlight;
        }
      }

      /* ── Print ───────────────────────────────────────── */

      @media print {
        .ui-sortable-list__handle {
          display: none;
        }
      }
    }
  }
`

// ─── Grip Icon ──────────────────────────────────────────────────────────────

function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="5.5" cy="3" r="1" fill="currentColor" />
      <circle cx="10.5" cy="3" r="1" fill="currentColor" />
      <circle cx="5.5" cy="8" r="1" fill="currentColor" />
      <circle cx="10.5" cy="8" r="1" fill="currentColor" />
      <circle cx="5.5" cy="13" r="1" fill="currentColor" />
      <circle cx="10.5" cy="13" r="1" fill="currentColor" />
    </svg>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export function SortableList({
  items,
  onChange,
  handle = true,
  disabled = false,
  orientation = 'vertical',
  motion: motionProp,
  className,
  'aria-label': ariaLabel,
  ...rest
}: SortableListProps) {
  const cls = useStyles('sortable-list', sortableListStyles)
  const motionLevel = useMotionLevel(motionProp)
  const listRef = useRef<HTMLDivElement>(null)
  const [grabbedId, setGrabbedId] = useState<string | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  // Initialize tabindex
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const options = list.querySelectorAll<HTMLElement>('[role="option"]')
    options.forEach((opt, i) => {
      opt.setAttribute('tabindex', i === 0 ? '0' : '-1')
    })
  }, [items])

  const focusItem = useCallback((index: number) => {
    const list = listRef.current
    if (!list) return
    const options = list.querySelectorAll<HTMLElement>('[role="option"]')
    options.forEach((opt, i) => {
      opt.setAttribute('tabindex', i === index ? '0' : '-1')
    })
    options[index]?.focus()
  }, [])

  const moveItem = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= items.length) return
      if (fromIndex === toIndex) return
      const next = [...items]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      onChange(next)
    },
    [items, onChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return

      const list = listRef.current
      if (!list) return
      const options = Array.from(list.querySelectorAll<HTMLElement>('[role="option"]'))
      const focusedEl = document.activeElement as HTMLElement
      const index = options.indexOf(focusedEl)
      if (index < 0) return

      const isVertical = orientation === 'vertical'
      const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft'
      const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight'

      if (e.altKey && e.key === prevKey) {
        e.preventDefault()
        if (index > 0) {
          moveItem(index, index - 1)
          // Focus will shift after re-render
          requestAnimationFrame(() => focusItem(index - 1))
        }
        return
      }

      if (e.altKey && e.key === nextKey) {
        e.preventDefault()
        if (index < items.length - 1) {
          moveItem(index, index + 1)
          requestAnimationFrame(() => focusItem(index + 1))
        }
        return
      }

      switch (e.key) {
        case prevKey: {
          e.preventDefault()
          if (index > 0) focusItem(index - 1)
          break
        }
        case nextKey: {
          e.preventDefault()
          if (index < options.length - 1) focusItem(index + 1)
          break
        }
        case ' ':
        case 'Enter': {
          e.preventDefault()
          const itemId = focusedEl.getAttribute('data-item-id')
          if (grabbedId === itemId) {
            setGrabbedId(null)
          } else {
            setGrabbedId(itemId)
          }
          break
        }
        case 'Escape': {
          e.preventDefault()
          setGrabbedId(null)
          break
        }
        case 'Home': {
          e.preventDefault()
          focusItem(0)
          break
        }
        case 'End': {
          e.preventDefault()
          focusItem(options.length - 1)
          break
        }
      }
    },
    [disabled, orientation, items, moveItem, focusItem, grabbedId]
  )

  // ── Mouse drag handlers (native HTML DnD) ──

  const getDropIndexFromEvent = useCallback(
    (e: React.DragEvent) => {
      const list = listRef.current
      if (!list) return items.length
      const options = Array.from(list.querySelectorAll<HTMLElement>('[role="option"]'))
      const isVertical = orientation === 'vertical'
      for (let i = 0; i < options.length; i++) {
        const rect = options[i].getBoundingClientRect()
        const mid = isVertical
          ? rect.top + rect.height / 2
          : rect.left + rect.width / 2
        const pos = isVertical ? e.clientY : e.clientX
        if (pos < mid) return i
      }
      return items.length
    },
    [items.length, orientation]
  )

  const handleDragStart = useCallback(
    (e: React.DragEvent, itemId: string) => {
      if (disabled) return
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', itemId)
      setDraggedId(itemId)
      const target = e.currentTarget as HTMLElement
      requestAnimationFrame(() => {
        target?.classList?.add('ui-sortable-list__item--dragging')
      })
    },
    [disabled]
  )

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const el = e.currentTarget as HTMLElement
    el.classList.remove('ui-sortable-list__item--dragging')
    setDraggedId(null)
    setDropIndex(null)
  }, [])

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      const idx = getDropIndexFromEvent(e)
      setDropIndex(idx)
    },
    [getDropIndexFromEvent]
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const list = listRef.current
    if (list && !list.contains(e.relatedTarget as Node)) {
      setDropIndex(null)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const dragItemId = e.dataTransfer.getData('text/plain')
      const fromIndex = items.findIndex((item) => item.id === dragItemId)
      let toIndex = getDropIndexFromEvent(e)
      setDraggedId(null)
      setDropIndex(null)
      if (fromIndex < 0) return
      // Adjust target index when dragging downward
      if (fromIndex < toIndex) toIndex -= 1
      if (fromIndex !== toIndex) {
        const next = [...items]
        const [moved] = next.splice(fromIndex, 1)
        next.splice(toIndex, 0, moved)
        onChange(next)
      }
    },
    [items, getDropIndexFromEvent, onChange]
  )

  return (
    <div
      className={cn(cls('root'), className)}
      data-motion={motionLevel}
      data-orientation={orientation}
      {...rest}
    >
      <div
        ref={listRef}
        role="listbox"
        aria-label={ariaLabel || 'Sortable list'}
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
        onDragOver={!disabled ? handleDragOver : undefined}
        onDragLeave={!disabled ? handleDragLeave : undefined}
        onDrop={!disabled ? handleDrop : undefined}
      >
        {items.map((item, i) => (
          <React.Fragment key={item.id}>
            {dropIndex === i && draggedId !== null && (
              <div className="ui-sortable-list__drop-indicator" aria-hidden="true" />
            )}
            <div
              role="option"
              aria-selected={grabbedId === item.id}
              aria-disabled={disabled || undefined}
              aria-roledescription="sortable item"
              data-item-id={item.id}
              data-grabbed={grabbedId === item.id ? 'true' : undefined}
              className="ui-sortable-list__item"
              tabIndex={-1}
              draggable={!disabled}
              onDragStart={!disabled ? (e) => handleDragStart(e, item.id) : undefined}
              onDragEnd={!disabled ? handleDragEnd : undefined}
            >
              {handle && (
                <span className="ui-sortable-list__handle" aria-hidden="true">
                  <GripIcon />
                </span>
              )}
              <span className="ui-sortable-list__content">{item.content}</span>
            </div>
          </React.Fragment>
        ))}
        {dropIndex === items.length && draggedId !== null && (
          <div className="ui-sortable-list__drop-indicator" aria-hidden="true" />
        )}
      </div>
    </div>
  )
}

SortableList.displayName = 'SortableList'
